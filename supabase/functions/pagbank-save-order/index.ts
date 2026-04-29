import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// API de Orders para Checkout Transparente
const IS_SANDBOX = Deno.env.get("PAGBANK_SANDBOX") === "true";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "";

// API de Orders para Checkout Transparente
const PAGSEGURO_ORDERS_URL = IS_SANDBOX 
  ? "https://sandbox.api.pagseguro.com/orders"
  : "https://api.pagseguro.com/orders";

async function createV3Order(params: {
  reference: string;
  itemDescription: string;
  amountCents: number;
  senderEmail: string;
  senderName: string;
  taxId: string;
  phone?: string;
  paymentMethod: string;
  cardEncrypted?: string;
}): Promise<any> {
  console.log(`[pagbank-save-order] Preparando payload (${params.paymentMethod}): ${params.itemDescription}`);

  // Tratar telefone (obrigatório para alguns métodos V3)
  const rawPhone = params.phone || "11999999999";
  const phoneDigits = rawPhone.replace(/\D/g, "");
  const areaCode = phoneDigits.substring(0, 2) || "11";
  const phoneNumber = phoneDigits.substring(2) || "999999999";

  const address = {
    street: "Avenida Paulista",
    number: "1000",
    locality: "Bela Vista",
    city: "São Paulo",
    region_code: "SP",
    country: "BRA",
    postal_code: "01310100"
  };

  const payload: any = {
    reference_id: params.reference,
    customer: {
      name: params.senderName,
      email: params.senderEmail,
      tax_id: params.taxId.replace(/\D/g, ""),
      phones: [
        {
          country: "55",
          area: areaCode,
          number: phoneNumber,
          type: "MOBILE"
        }
      ]
    },
    items: [
      {
        name: params.itemDescription,
        quantity: 1,
        unit_amount: params.amountCents
      }
    ],
    qr_codes: params.paymentMethod === "PIX" ? [{ amount: { value: params.amountCents } }] : undefined,
  };

  // Para Boleto, o endereço no customer é OBRIGATÓRIO
  if (params.paymentMethod === "BOLETO") {
    payload.customer.address = address;
  }

  // Se for Cartão de Crédito
  if (params.paymentMethod === "CREDIT_CARD" && params.cardEncrypted) {
    payload.charges = [{
      reference_id: params.reference,
      description: params.itemDescription,
      amount: { value: params.amountCents, currency: "BRL" },
      payment_method: {
        type: "CREDIT_CARD",
        installments: 1,
        capture: true,
        card: {
          encrypted: params.cardEncrypted,
          store: false
        }
      }
    }];
  }

  // Se for Boleto
  if (params.paymentMethod === "BOLETO") {
    const today = new Date();
    today.setDate(today.getDate() + 3); // Vencimento em 3 dias
    const dueDate = today.toISOString().split("T")[0];

    payload.charges = [{
      reference_id: params.reference,
      description: params.itemDescription,
      amount: { value: params.amountCents, currency: "BRL" },
      payment_method: {
        type: "BOLETO",
        boleto: {
          due_date: dueDate,
          instruction_lines: {
            line_1: "Pagável em qualquer banco até o vencimento.",
            line_2: "RoyalMed Health - Plano de Saúde"
          },
          holder: {
            name: params.senderName,
            tax_id: params.taxId.replace(/\D/g, ""),
            email: params.senderEmail,
            address: address
          }
        }
      }
    }];
  }

  console.log("[pagbank-save-order] Enviando Payload para PagBank:", JSON.stringify(payload));

  const res = await fetch(PAGSEGURO_ORDERS_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  
  if (!res.ok) {
    console.error("[pagbank-save-order] Erro detectado na resposta do PagBank:", JSON.stringify(data, null, 2));
    const errorMsg = data.error_messages?.[0]?.description || "Erro ao processar pedido no PagBank.";
    const parameter = data.error_messages?.[0]?.parameter_name ? ` (Campo: ${data.error_messages[0].parameter_name})` : "";
    throw new Error(`${errorMsg}${parameter}`);
  }

  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Não autorizado.");

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const jwt = authHeader.split(" ").pop() ?? "";
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const userId = payload.sub;

    if (!userId) throw new Error("Usuário não identificado.");

    const bodyParams = await req.json();
    const { plan_id, total_cents, extra_dependents = 0, payment_method, card } = bodyParams;

    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    const { data: profile } = await admin.from("profiles").select("full_name, phone, cpf").eq("id", userId).single();

    const refId = `sub_${userId.substring(0,8)}_${Date.now()}`;
    const senderEmail = bodyParams.customer?.email || profile?.email || "cliente@teste.com.br";
    const senderName = bodyParams.customer?.name || profile?.full_name || "Cliente RoyalMed";
    const taxId = bodyParams.customer?.tax_id || profile?.cpf || "";

    if (!taxId) throw new Error("CPF é obrigatório para o checkout transparente.");

    // Cria o Pedido (Order) no PagBank
    const orderData = await createV3Order({
      reference: refId,
      itemDescription: `Assinatura ${plan.name} - RoyalMed`,
      amountCents: total_cents || plan.price_cents,
      senderEmail,
      senderName,
      taxId,
      phone: bodyParams.customer?.phone || profile?.phone,
      paymentMethod: payment_method,
      cardEncrypted: card?.encrypted,
    });

    console.log(`[pagbank-save-order] Order criada com sucesso: ${orderData.id}`);

    // Extrai dados de pagamento dependendo do método
    let paymentResponse: any = { ok: true, reference: refId, method: payment_method };

    if (payment_method === "PIX") {
      const qrCode = orderData.qr_codes?.[0];
      if (!qrCode) throw new Error("Erro ao gerar QR Code PIX no PagBank.");
      
      paymentResponse.pix = {
        qr_code: qrCode.text,
        qr_code_image: qrCode.links?.find((l: any) => l.rel === "QRCODE.PNG")?.href
      };
      console.log("[pagbank-save-order] Dados PIX capturados:", !!paymentResponse.pix.qr_code);
    } else if (payment_method === "BOLETO") {
      const charge = orderData.charges?.[0];
      if (!charge) throw new Error("Erro ao gerar Boleto no PagBank (charge não encontrada).");
      
      const boletoData = charge.payment_method?.boleto;
      paymentResponse.boleto = {
        barcode: boletoData?.barcode,
        formatted_barcode: boletoData?.formatted_barcode,
        pdf_link: charge.links?.find((l: any) => l.rel === "PAYMENT.BOLETO.PDF")?.href,
        due_date: boletoData?.due_date
      };
      console.log("[pagbank-save-order] Dados Boleto capturados:", !!paymentResponse.boleto.barcode);
    } else if (payment_method === "CREDIT_CARD") {
      const charge = orderData.charges?.[0];
      paymentResponse.status = charge?.status;
      console.log("[pagbank-save-order] Status Cartão:", paymentResponse.status);
    }

    // Registra no banco
    await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      pagbank_subscription_id: refId,
      status: payment_method === "CREDIT_CARD" && paymentResponse.status === "PAID" ? "ACTIVE" : "PENDING",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      extra_dependents_count: extra_dependents,
      monthly_total_cents: total_cents || plan.price_cents,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify(paymentResponse), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[pagbank-save-order] Erro:", err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

