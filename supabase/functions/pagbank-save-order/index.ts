import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "";
const PAGBANK_BASE  = "https://api.pagseguro.com";

async function pagbankPost(path: string, body: object) {
  const res = await fetch(`${PAGBANK_BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok) {
    const msg = json?.error_messages?.[0]?.description ?? json?.message ?? "Erro PagBank";
    throw new Error(`PagBank ${res.status}: ${msg}`);
  }
  return json;
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

    // ── Busca plano ──────────────────────────────────────────────────────────
    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    const refId   = `royalmed_${user.id}_${Date.now()}`;
    const baseUrl = origin_url ?? "https://royalmed.com.br";

    // ── Cria sessão de Checkout hospedado no PagBank ─────────────────────────
    const checkout = await pagbankPost("/checkouts", {
      reference_id: refId,
      customer: {
        name:   customer.name,
        email:  customer.email,
        tax_id: customer.tax_id.replace(/\D/g, ""),
      },
      items: [{
        reference_id: plan_id,
        name:         `Plano RoyalMed Health – ${plan.name}`,
        quantity:     1,
        unit_amount:  total_cents,
      }],
      payment_methods: [
        { type: "CREDIT_CARD" },
        { type: "PIX" },
        { type: "BOLETO" },
      ],
      payment_methods_configs: [{
        type: "CREDIT_CARD",
        config_options: [{ option: "INSTALLMENTS_LIMIT", value: "1" }],
      }],
      // Após pagamento, PagBank redireciona aqui
      redirect_url: `${baseUrl}/pagamento-confirmado?ref=${refId}`,
      return_url:   `${baseUrl}/planos`,
      notification_urls: [
        `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
      ],
      soft_descriptor: "RoyalMed Health",
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1h
    });

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
        user_id:          user.id,
        subscription_id:  sub.id,
        type:             "SUBSCRIPTION",
        amount_cents:     total_cents,
        status:           "PENDING",
        payment_method:   null,
        pagbank_charge_id: refId,
        description:      `Assinatura Plano ${plan.name}`,
      });
    }

    return new Response(
      JSON.stringify({ ok: true, payment_url: checkout.payment_url, checkout_id: checkout.id }),
      { headers: { ...CORS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[pagbank-save-order]", err.message);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 400, headers: { ...CORS, "Content-Type": "application/json" } }
    );
  }
});
