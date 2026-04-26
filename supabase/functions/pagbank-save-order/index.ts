import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Token do Sandbox fornecido (V3 Bearer Token)
const PAGBANK_TOKEN = "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";
const IS_SANDBOX = true; 

const PAGSEGURO_API_URL = IS_SANDBOX 
  ? "https://sandbox.api.pagseguro.com/checkouts"
  : "https://api.pagseguro.com/checkouts";

async function createV3Checkout(params: {
  reference: string;
  itemDescription: string;
  amountCents: number;
  senderEmail: string;
  senderName: string;
  taxId?: string;
  phone?: string;
  redirectUrl: string;
  notificationUrl: string;
}): Promise<string> {
  console.log(`[pagbank-save-order] Criando checkout V3: ${params.itemDescription} - R$ ${params.amountCents / 100}`);

  // Formata o telefone, se existir
  let phones = [];
  if (params.phone) {
    const cleanPhone = params.phone.replace(/\D/g, "");
    if (cleanPhone.length >= 10 && cleanPhone.length <= 11) {
      phones.push({
        country: "55",
        area: cleanPhone.substring(0, 2),
        number: cleanPhone.substring(2),
        type: cleanPhone.length === 11 ? "MOBILE" : "HOME"
      });
    }
  }

  // Se for sandbox, o PagBank frequentemente tem restrições quanto ao email do customer.
  let customerEmail = params.senderEmail;
  if (IS_SANDBOX && (!customerEmail || customerEmail.includes("ronaldo.grupogold"))) {
    customerEmail = "c31804257124195159424@sandbox.pagseguro.com.br";
  }

  let cleanTaxId = params.taxId ? params.taxId.replace(/\D/g, "") : "";
  // Em sandbox, se não houver CPF válido (11 dígitos), usamos um gerado ou deixamos de enviar se não for obrigatório no sandbox
  // Vamos enviar vazio se não for válido para evitar erro de validação
  if (cleanTaxId.length !== 11 && cleanTaxId.length !== 14) {
    cleanTaxId = "";
  }

  const payload: any = {
    reference_id: params.reference,
    customer: {
      name: params.senderName,
      email: customerEmail,
    },
    items: [
      {
        reference_id: "item_01",
        name: params.itemDescription,
        quantity: 1,
        unit_amount: params.amountCents
      }
    ],
    redirect_url: params.redirectUrl,
    notification_urls: [ params.notificationUrl ]
  };

  if (cleanTaxId) {
    payload.customer.tax_id = cleanTaxId;
  }
  
  if (phones.length > 0) {
    payload.customer.phones = phones;
  }

  const res = await fetch(PAGSEGURO_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    console.error(`[pagbank-save-order] Erro PagSeguro V3 (Status ${res.status}):`, JSON.stringify(data));
    let errorMsg = "Erro desconhecido";
    if (data && data.error_messages) {
      errorMsg = data.error_messages.map((e: any) => `${e.parameter_name}: ${e.description}`).join(" | ");
    } else if (data && data.message) {
      errorMsg = data.message;
    }
    throw new Error(`Erro PagBank: ${errorMsg}`);
  }

  // Extrair o link de pagamento
  const payLink = data.links?.find((l: any) => l.rel === "PAY");
  if (!payLink || !payLink.href) {
    console.error("[pagbank-save-order] Resposta sem link de pagamento:", JSON.stringify(data));
    throw new Error("Link de pagamento não retornado pelo PagBank.");
  }

  return payLink.href;
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
    console.log("[pagbank-save-order] Payload recebido:", JSON.stringify(bodyParams));
    
    const { plan_id, total_cents, extra_dependents = 0, origin_url } = bodyParams;

    // Busca dados do plano
    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    // Busca dados do perfil do usuário
    const { data: profile } = await admin.from("profiles").select("full_name, phone, cpf").eq("id", userId).single();

    const refId = `sub_${userId.substring(0,8)}_${Date.now()}`;
    const baseUrl = origin_url || "https://royalsaude.com.br";

    const senderEmail = bodyParams.customer?.email || "cliente@teste.com.br";
    const senderName = profile?.full_name || bodyParams.customer?.name || "Cliente RoyalMed";
    const taxId = profile?.cpf || bodyParams.customer?.tax_id || "";
    const phone = profile?.phone || "";

    const checkoutUrl = await createV3Checkout({
      reference: refId,
      itemDescription: `Assinatura ${plan.name} - RoyalMed`,
      amountCents: total_cents || plan.price_cents,
      senderEmail,
      senderName,
      taxId,
      phone,
      redirectUrl: `${baseUrl}/pagamento-confirmado?ref=${refId}`,
      notificationUrl: `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
    });

    // Registra a intenção de assinatura no banco
    const { error: upsertErr } = await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      pagbank_subscription_id: refId,
      status: "PENDING",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      extra_dependents_count: extra_dependents,
      monthly_total_cents: total_cents || plan.price_cents,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (upsertErr) console.error("[pagbank-save-order] Erro ao salvar sub:", upsertErr);

    return new Response(JSON.stringify({ ok: true, payment_url: checkoutUrl }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[pagbank-save-order] Erro na execução:", err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

