import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGBANK_TOKEN    = Deno.env.get("PAGBANK_TOKEN") ?? "";
const PAGBANK_BASE_URL = "https://api.pagseguro.com";
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

async function pagbankRequest(path: string, method: string, body?: object) {
  const res = await fetch(`${PAGBANK_BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    console.error("[pagbank-setup-plans] error:", JSON.stringify(data));
    throw new Error(data?.error_messages?.[0]?.description ?? JSON.stringify(data));
  }
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Buscar planos sem pagbank_plan_id
    const { data: plans, error } = await supabase
      .from("plans")
      .select("*")
      .eq("active", true)
      .is("pagbank_plan_id", null);

    if (error) throw error;
    if (!plans?.length) {
      return new Response(JSON.stringify({ ok: true, message: "Todos os planos já estão cadastrados no PagBank." }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const results = [];

    for (const plan of plans) {
      // Montar payload do plano para o PagBank
      const payload = {
        reference_id: plan.id,
        name: `RoyalMed Health - Plano ${plan.name}`,
        description: plan.description ?? `Plano ${plan.name} RoyalMed Health`,
        amount: {
          value: plan.price_cents,
          currency: "BRL",
        },
        interval: {
          unit: plan.interval_type === "YEARLY" ? "YEAR" : "MONTH",
          length: plan.interval_value ?? 1,
        },
        trial: null,
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          no_interest_installment_quantity: 1,
        },
      };

      console.log(`[pagbank-setup-plans] Criando plano: ${plan.name}`);
      const pagbankPlan = await pagbankRequest("/subscriptions/plans", "POST", payload);
      const pagbankPlanId = pagbankPlan.id;

      // Salvar o ID do plano no banco
      const { error: updateError } = await supabase
        .from("plans")
        .update({ pagbank_plan_id: pagbankPlanId })
        .eq("id", plan.id);

      if (updateError) throw updateError;

      console.log(`[pagbank-setup-plans] Plano criado: ${pagbankPlanId}`);
      results.push({ plan_id: plan.id, name: plan.name, pagbank_plan_id: pagbankPlanId });
    }

    return new Response(JSON.stringify({ ok: true, results }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[pagbank-setup-plans] erro:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
