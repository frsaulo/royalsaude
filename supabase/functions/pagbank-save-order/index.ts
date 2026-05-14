import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
};

interface PagBankLink {
  rel: string;
  href: string;
}

interface PagBankOrder {
  id?: string;
  qr_codes?: Array<{
    text: string;
    links?: PagBankLink[];
  }>;
  charges?: Array<{
    id?: string;
    status?: string;
    links?: PagBankLink[];
    payment_method?: {
      links?: PagBankLink[];
      boleto?: {
        barcode?: string;
        formatted_barcode?: string;
        due_date?: string;
        payment_link?: string;
        links?: PagBankLink[];
      };
    };
  }>;
  links?: PagBankLink[];
}

interface PagBankError {
  message?: string;
  error_messages?: Array<{
    description: string;
    parameter_name?: string;
  }>;
}

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
}): Promise<PagBankOrder> {
  console.log(`[pagbank-save-order] Preparando payload (${params.paymentMethod}): ${params.itemDescription}`);

  // Tratar telefone com mais segurança
  const phoneDigits = (params.phone || "11999999999").replace(/\D/g, "");
  let areaCode = "11";
  let phoneNumber = "999999999";

  if (phoneDigits.length >= 10) {
    areaCode = phoneDigits.substring(0, 2);
    phoneNumber = phoneDigits.substring(2);
  }

  // Endereço padrão para Customer e Cartão (V3)
  const customerAddress = {
    street: "Avenida Paulista",
    number: "1000",
    locality: "Bela Vista",
    city: "Sao Paulo",
    region: "SP",
    region_code: "SP",
    country: "BRA",
    postal_code: "01310100",
    complement: ""
  };

  // Endereço específico para o Holder do Boleto
  const boletoAddress = {
    street: "Avenida Paulista",
    number: "1000",
    locality: "Bela Vista",
    city: "Sao Paulo",
    region: "SP",
    region_code: "SP",
    country: "BRA",
    postal_code: "01310100",
    complement: ""
  };

  const cleanTaxId = params.taxId.replace(/\D/g, "");

  const payload = {
    reference_id: params.reference,
    customer: {
      name: params.senderName,
      email: params.senderEmail,
      tax_id: cleanTaxId,
      phones: [
        {
          country: "55",
          area: areaCode,
          number: phoneNumber,
          type: "MOBILE"
        }
      ],
      address: (params.paymentMethod === "BOLETO" || params.paymentMethod === "CREDIT_CARD")
        ? customerAddress
        : undefined
    },
    items: [
      {
        reference_id: "REF001",
        name: params.itemDescription,
        quantity: 1,
        unit_amount: params.amountCents
      }
    ],
    notification_urls: ["https://royalsaude.com.br/api/webhook/pagbank"],
    qr_codes: params.paymentMethod === "PIX"
      ? [{ amount: { value: params.amountCents } }]
      : undefined,
    charges: params.paymentMethod === "CREDIT_CARD" && params.cardEncrypted
      ? [{
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
        }]
      : params.paymentMethod === "BOLETO"
        ? (() => {
            const today = new Date();
            today.setDate(today.getDate() + 3); // Vencimento em 3 dias
            const dueDate = today.toISOString().split("T")[0];
            return [{
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
                    tax_id: cleanTaxId,
                    email: params.senderEmail,
                    address: boletoAddress
                  }
                }
              }
            }];
          })()
        : undefined
  };

  console.log(`[pagbank-save-order] Chamando PagBank (${params.paymentMethod})...`);
  console.log(`[pagbank-save-order] Payload completo:`, JSON.stringify(payload, null, 2));

  try {
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
      const errorData = data as PagBankError;
      console.error("[pagbank-save-order] RESPOSTA DE ERRO DO PAGBANK:", JSON.stringify(errorData, null, 2));
      
      // Tentar extrair a mensagem de erro específica do PagBank
      if (errorData.error_messages && errorData.error_messages.length > 0) {
        const errors = errorData.error_messages.map((m) => `${m.description} (${m.parameter_name || 'geral'})`).join(" | ");
        throw new Error(`PagBank diz: ${errors}`);
      }
      
      throw new Error(errorData.message || `Erro HTTP ${res.status} no PagBank`);
    }

    return data as PagBankOrder;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[pagbank-save-order] Falha na requisição ao PagBank:", message);
    throw err;
  }
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
    const { plan_id, total_cents, extra_dependents = 0, payment_method, card, coupon_code } = bodyParams;

    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    const { data: profile } = await admin.from("profiles").select("full_name, phone, cpf, email").eq("id", userId).single();

    const refId = `sub_${userId.substring(0,8)}_${Date.now()}`;
    const senderEmail = bodyParams.customer?.email || profile?.email || "cliente@teste.com.br";
    const senderName = bodyParams.customer?.name || profile?.full_name || "Cliente RoyalMed";
    const taxId = bodyParams.customer?.tax_id || profile?.cpf || "";

    if (!taxId) throw new Error("CPF é obrigatório para o checkout transparente.");

    let finalTotalCents = total_cents || plan.price_cents;

    if (coupon_code) {
      const { data: existingSub } = await admin.from("subscriptions").select("id").eq("user_id", userId).limit(1).maybeSingle();
      if (existingSub) {
         throw new Error("Cupons de desconto são válidos apenas para a primeira assinatura.");
      }
      const { data: coupon, error: couponErr } = await admin.from("coupons").select("*").eq("code", coupon_code).eq("active", true).single();
      if (couponErr || !coupon) {
         throw new Error("Cupom inválido ou expirado.");
      }
      // Calculate discount on the backend
      if (coupon.type === "fixed") {
         finalTotalCents = Math.max(0, finalTotalCents - Math.round(coupon.value * 100));
      } else if (coupon.type === "percentage") {
         finalTotalCents = Math.max(0, finalTotalCents - Math.round(finalTotalCents * (coupon.value / 100)));
      }
    }

    // Cria o Pedido (Order) no PagBank
    const orderData = await createV3Order({
      reference: refId,
      itemDescription: `Assinatura ${plan.name} - RoyalMed`,
      amountCents: finalTotalCents,
      senderEmail,
      senderName,
      taxId,
      phone: bodyParams.customer?.phone || profile?.phone,
      paymentMethod: payment_method,
      cardEncrypted: card?.encrypted,
    });

    console.log(`[pagbank-save-order] Order criada com sucesso: ${orderData.id}`);

    interface PaymentResponse {
      ok: boolean;
      reference: string;
      method: string;
      status?: string;
      pix?: { qr_code: string; qr_code_image?: string };
      boleto?: { barcode?: string; formatted_barcode?: string; pdf_link?: string; due_date?: string };
    }

    // Extrai dados de pagamento dependendo do método
    const paymentResponse: PaymentResponse = { ok: true, reference: refId, method: payment_method };

    if (payment_method === "PIX") {
      const qrCode = orderData.qr_codes?.[0];
      if (!qrCode) throw new Error("Erro ao gerar QR Code PIX no PagBank.");
      
      paymentResponse.pix = {
        qr_code: qrCode.text,
        qr_code_image: qrCode.links?.find((l) => l.rel === "QRCODE.PNG")?.href
      };
      console.log("[pagbank-save-order] Dados PIX capturados:", !!paymentResponse.pix.qr_code);
    } else if (payment_method === "BOLETO") {
      const charge = orderData.charges?.[0];
      if (!charge) throw new Error("Erro ao gerar Boleto no PagBank (charge não encontrada).");
      
      const boletoData = charge.payment_method?.boleto;
      const allLinks = [
        ...(orderData.links || []),
        ...(charge.links || []),
        ...(charge.payment_method?.links || []),
        ...(boletoData?.links || [])
      ];
      
      // Busca exaustiva e resiliente pelo PDF ou link de pagamento
      const allLinksData = allLinks.map(l => ({ rel: l.rel, href: l.href }));
      console.log("[pagbank-save-order] Lista exaustiva de links recebidos:", JSON.stringify(allLinksData));

      // Filtramos links que são claramente internos/API
      const isInternalApi = (l: PagBankLink) => 
        (l.href.includes("api.pagseguro.com") && (l.rel === "self" || l.rel === "PAY")) ||
        l.href.includes("/charges/") || l.href.includes("/orders/");

      // Tenta achar PDF primeiro
      const pdfLink = allLinks.find((l) => 
        l.rel.toUpperCase().includes("PDF") || 
        ["PAYMENT.BOLETO.PDF", "BOLETO.PDF"].includes(l.rel.toUpperCase())
      )?.href;
 
      // Tenta achar HTML/PAY_LINK
      const payLink = allLinks.find((l) => 
        (l.rel.toUpperCase().includes("BOLETO") && l.rel.toUpperCase().includes("HTML")) ||
        ["PAYMENT.BOLETO.HTML", "BOLETO.HTML", "PAY_LINK", "VIEW", "PAYMENT_LINK"].includes(l.rel.toUpperCase()) ||
        (l.rel.toLowerCase().includes("boleto") && !isInternalApi(l))
      )?.href;

      // Fallback final: qualquer link que não seja API e tenha boleto no nome ou venha do objeto boleto
      const finalPdfLink = pdfLink || payLink || boletoData?.payment_link || (allLinks.find((l) => !isInternalApi(l))?.href);
 
      paymentResponse.boleto = {
        barcode: boletoData?.barcode,
        formatted_barcode: boletoData?.formatted_barcode,
        pdf_link: finalPdfLink,
        due_date: boletoData?.due_date
      };

      console.log("[pagbank-save-order] Boleto processado com sucesso. Link:", finalPdfLink);
      
      if (!finalPdfLink) {
        console.warn("[pagbank-save-order] AVISO: Nenhum link PÚBLICO de boleto encontrado.");
      }
    } else if (payment_method === "CREDIT_CARD") {
      const charge = orderData.charges?.[0];
      paymentResponse.status = charge?.status;
      console.log("[pagbank-save-order] Status Cartão:", paymentResponse.status);
    }

    // Registra no banco
    await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      payment_method: payment_method,
      pagbank_subscription_id: refId,
      status: payment_method === "CREDIT_CARD" && paymentResponse.status === "PAID" ? "ACTIVE" : "PENDING",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      extra_dependents_count: extra_dependents,
      monthly_total_cents: finalTotalCents,
      coupon_code: coupon_code || null,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    return new Response(JSON.stringify(paymentResponse), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[pagbank-save-order] Erro:", message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

