import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "";
const PAGBANK_EMAIL = Deno.env.get("PAGBANK_EMAIL") ?? "";

const PAGSEGURO_API_URL      = "https://ws.pagseguro.uol.com.br/v2/checkout";
const PAGSEGURO_CHECKOUT_URL = "https://pagseguro.uol.com.br/v2/checkout";

// Cria sessão de checkout no PagSeguro v2 (Formulário HTML legado)
// Não exige whitelist de IP — usa email + token da conta PagBank
async function createV2Checkout(params: {
  reference: string;
  itemDescription: string;
  amountCents: number;
  senderEmail: string;
  senderName: string;
  redirectUrl: string;
  notificationUrl: string;
}): Promise<string> {
  const amount = (params.amountCents / 100).toFixed(2);

  const body = new URLSearchParams({
    email:            PAGBANK_EMAIL,
    token:            PAGBANK_TOKEN,
    currency:         "BRL",
    itemId1:          "0001",
    itemDescription1: params.itemDescription,
    itemAmount1:      amount,
    itemQuantity1:    "1",
    reference:        params.reference,
    senderEmail:      params.senderEmail,
    senderName:       params.senderName,
    redirectURL:      params.redirectUrl,
    notificationURL:  params.notificationUrl,
  });

  console.log(`[pagbank-save-order] Chamando PagSeguro v2. Email: ${PAGBANK_EMAIL}, Amount: ${amount}`);

  const res = await fetch(PAGSEGURO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "Accept": "application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1",
    },
    body: body.toString(),
  });

  const text = await res.text();
  console.log(`[pagbank-save-order] Resposta PagSeguro (${res.status}): ${text}`);

  if (!res.ok) {
    // Tenta extrair mensagem de erro do XML
    const errMatch = text.match(/<error><code>(\d+)<\/code><message>([^<]+)<\/message><\/error>/);
    const errMsg = errMatch ? `Cód. ${errMatch[1]}: ${errMatch[2]}` : text;
    throw new Error(`PagSeguro ${res.status}: ${errMsg}`);
  }

  // Extrai o code do XML de resposta: <checkout><code>XXXX</code>...</checkout>
  const match = text.match(/<code>([^<]+)<\/code>/);
  if (!match?.[1]) {
    throw new Error(`Código de checkout não encontrado na resposta: ${text}`);
  }

  return match[1];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    // ── Autenticação do usuário ──────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Não autenticado.");

    const supaUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: authErr } = await supaUser.auth.getUser();
    if (authErr || !user) throw new Error("Sessão inválida.");

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { plan_id, total_cents, extra_dependents = 0, customer, origin_url } = await req.json();

    if (!plan_id || !total_cents || !customer?.email) throw new Error("Dados incompletos.");
    if (!PAGBANK_EMAIL || !PAGBANK_TOKEN) throw new Error("Credenciais PagBank não configuradas no servidor.");

    // ── Busca plano ──────────────────────────────────────────────────────────
    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    const refId   = `royalmed_${user.id}_${Date.now()}`;
    const baseUrl = (origin_url && origin_url !== "null") ? origin_url : "https://royalsaude.com.br";

    console.log(`[pagbank-save-order] Iniciando para user=${user.id} ref=${refId} baseUrl=${baseUrl}`);

    // ── Cria checkout v2 no PagSeguro ────────────────────────────────────────
    const checkoutCode = await createV2Checkout({
      reference:       refId,
      itemDescription: `Plano RoyalMed Health - ${plan.name}`,
      amountCents:     total_cents,
      senderEmail:     customer.email,
      senderName:      customer.name,
      redirectUrl:     `${baseUrl}/pagamento-confirmado?ref=${refId}`,
      notificationUrl: `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
    });

    const paymentUrl = `${PAGSEGURO_CHECKOUT_URL}#${checkoutCode}`;
    console.log(`[pagbank-save-order] Checkout criado! Code: ${checkoutCode}`);

    // ── Salva assinatura como PENDING antes de redirecionar ──────────────────
    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: sub } = await admin.from("subscriptions").upsert({
      user_id:                 user.id,
      plan_id:                 plan.id,
      pagbank_subscription_id: refId,
      status:                  "PENDING",
      payment_method:          null,
      current_period_start:    new Date().toISOString(),
      current_period_end:      periodEnd,
      extra_dependents_count:  extra_dependents,
      monthly_total_cents:     total_cents,
      updated_at:              new Date().toISOString(),
    }, { onConflict: "user_id" }).select().single();

    if (sub) {
      await admin.from("payments").insert({
        user_id:           user.id,
        subscription_id:   sub.id,
        type:              "SUBSCRIPTION",
        amount_cents:      total_cents,
        status:            "PENDING",
        payment_method:    null,
        pagbank_charge_id: refId,
        description:       `Assinatura Plano ${plan.name}`,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, payment_url: paymentUrl, checkout_code: checkoutCode }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[pagbank-save-order] ERRO:", err.message);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
