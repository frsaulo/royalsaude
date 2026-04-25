import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";

const IS_SANDBOX = true; 

const PAGBANK_API_URL = IS_SANDBOX
  ? "https://sandbox.api.pagseguro.com/checkouts"
  : "https://api.pagseguro.com/checkouts";

async function createV3Checkout(params: {
  reference: string;
  itemDescription: string;
  amountCents: number;
  customer: {
    name: string;
    email: string;
    tax_id: string;
    phone?: string;
  };
  redirectUrl: string;
  notificationUrl: string;
}): Promise<string> {
  
  let name = params.customer.name.trim();
  if (!name.includes(" ")) {
    name = `${name} Cliente`;
  }

  // Formata o telefone se existir
  const phoneDigits = params.customer.phone ? params.customer.phone.replace(/\D/g, "") : "";
  const phoneObj = phoneDigits.length >= 10 ? {
    country: "55",
    area: phoneDigits.slice(0, 2),
    number: phoneDigits.slice(2),
    type: "MOBILE"
  } : undefined;

  const body = {
    reference_id: params.reference,
    customer: {
      name: name,
      email: params.customer.email,
      tax_id: params.customer.tax_id.replace(/\D/g, ""),
      phones: phoneObj ? [phoneObj] : undefined
    },
    items: [
      {
        reference_id: "0001",
        name: params.itemDescription,
        quantity: 1,
        unit_amount: params.amountCents
      }
    ],
    additional_info: [
      {
        key: "DETALHES",
        value: "Plano RoyalMed Health"
      }
    ],
    redirect_url: params.redirectUrl,
    notification_urls: [params.notificationUrl]
  };

  const res = await fetch(PAGBANK_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseData = await res.json();
  
  if (!res.ok) {
    const errMsg = responseData.error_messages 
      ? responseData.error_messages.map((e: any) => `${e.code}: ${e.description}`).join(", ")
      : JSON.stringify(responseData);
    throw new Error(`PagBank Erro: ${errMsg}`);
  }

  const payLink = responseData.links?.find((l: any) => l.rel === "PAY");
  if (!payLink?.href) throw new Error("Link de pagamento não gerado pelo PagBank.");

  return payLink.href;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Token de autorização ausente.");

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const jwt = authHeader.split(" ").pop() ?? "";
    
    // Extrai userId do JWT
    const payloadBase64 = jwt.split(".")[1];
    const payload = JSON.parse(atob(payloadBase64));
    const userId = payload.sub;

    if (!userId) throw new Error("Token inválido.");

    // Busca dados COMPLETOS do perfil para o PagBank
    const { data: profile } = await admin
      .from("profiles")
      .select("full_name, phone, cpf")
      .eq("id", userId)
      .single();

    const bodyParams = await req.json();
    const { plan_id, total_cents, extra_dependents = 0, origin_url } = bodyParams;

    const { data: plan } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (!plan) throw new Error("Plano não encontrado.");

    const refId   = `royalmed_${userId}_${Date.now()}`;
    const baseUrl = (origin_url && origin_url !== "null") ? origin_url : "https://royalsaude.com.br";

    // Usa dados do perfil como prioridade para o checkout
    const checkoutUrl = await createV3Checkout({
      reference: refId,
      itemDescription: `Plano RoyalMed Health - ${plan.name}`,
      amountCents: total_cents,
      customer: {
        name: profile?.full_name || bodyParams.customer?.name || "Cliente",
        email: bodyParams.customer?.email,
        tax_id: profile?.cpf || bodyParams.customer?.tax_id || "",
        phone: profile?.phone || ""
      },
      redirectUrl: `${baseUrl}/pagamento-confirmado?ref=${refId}`,
      notificationUrl: `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
    });

    // Salva ou atualiza assinatura
    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sub } = await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      pagbank_subscription_id: refId,
      status: "PENDING",
      payment_method: null,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd,
      extra_dependents_count: extra_dependents,
      monthly_total_cents: total_cents,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" }).select().single();

    if (sub) {
      await admin.from("payments").insert({
        user_id: userId,
        subscription_id: sub.id,
        type: "SUBSCRIPTION",
        amount_cents: total_cents,
        status: "PENDING",
        pagbank_charge_id: refId,
        description: `Assinatura Plano ${plan.name}`,
      });
    }

    return new Response(JSON.stringify({ ok: true, payment_url: checkoutUrl }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
