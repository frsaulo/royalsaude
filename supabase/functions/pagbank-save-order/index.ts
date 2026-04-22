import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Usuário não autenticado.");

    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) throw new Error("Sessão inválida.");

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const body = await req.json();

    const {
      plan_id,
      payment_method,
      extra_dependents = 0,
      order_id,         // ID retornado pela API do PagBank (feita no frontend)
      charge_id,        // ID da cobrança (para cartão/boleto)
      total_cents,
      pix,              // { qr_code, qr_code_image, expiration }
      boleto,           // { barcode, formatted_barcode, due_date, pdf_link }
      card_status,      // "PAID" | "AUTHORIZED" | etc (para cartão)
    } = body;

    if (!plan_id || !payment_method || !total_cents) {
      throw new Error("Campos obrigatórios ausentes: plan_id, payment_method, total_cents.");
    }

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) throw new Error("Plano não encontrado.");

    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const isCardPaid = payment_method === "CREDIT_CARD" &&
      (card_status === "PAID" || card_status === "AUTHORIZED");

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        pagbank_subscription_id: order_id ?? null,
        status: isCardPaid ? "ACTIVE" : "PENDING",
        payment_method,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        extra_dependents_count: extra_dependents,
        monthly_total_cents: total_cents,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (subError) {
      console.error("[pagbank-save-order] Erro ao salvar subscription:", subError);
      throw new Error("Falha ao salvar assinatura no banco de dados.");
    }

    await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      type: "SUBSCRIPTION",
      amount_cents: total_cents,
      status: isCardPaid ? "PAID" : "PENDING",
      payment_method,
      pagbank_charge_id: charge_id ?? order_id ?? null,
      description: `Assinatura Plano ${plan.name}`,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        subscription_id: subscription.id,
        order_id,
        pix,
        boleto,
      }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
