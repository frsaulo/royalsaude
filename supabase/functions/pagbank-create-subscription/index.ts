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
    console.error("[pagbank] API error:", JSON.stringify(data));
    const msg = data?.error_messages?.[0]?.description ?? data?.message ?? JSON.stringify(data);
    throw new Error(msg);
  }
  return data;
}

// ─── SUBSCRIPTION via PIX ────────────────────────────────────────────────────
async function createPixSubscription(plan: any, customer: any, extraAmountCents: number) {
  const totalCents = plan.price_cents + extraAmountCents;
  // PagBank: assinatura PIX é criada como cobrança única para o 1º período
  const payload = {
    reference_id: `sub_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
    },
    items: [
      {
        reference_id: plan.id,
        name: `Plano ${plan.name} RoyalMed`,
        quantity: 1,
        unit_amount: totalCents,
      },
    ],
    qr_codes: [
      {
        amount: { value: totalCents },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min
      },
    ],
    notification_urls: [],
  };

  const result = await pagbankRequest("/orders", "POST", payload);
  const qrCode = result.qr_codes?.[0];

  return {
    order_id: result.id,
    pix: {
      qr_code: qrCode?.text,
      qr_code_image: qrCode?.links?.find((l: any) => l.media === "image/png")?.href,
      expiration: qrCode?.expiration_date,
    },
  };
}

// ─── SUBSCRIPTION via BOLETO ─────────────────────────────────────────────────
async function createBoletoSubscription(plan: any, customer: any, extraAmountCents: number) {
  const totalCents = plan.price_cents + extraAmountCents;
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]; // 3 dias

  const payload = {
    reference_id: `sub_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
    },
    items: [
      {
        reference_id: plan.id,
        name: `Plano ${plan.name} RoyalMed`,
        quantity: 1,
        unit_amount: totalCents,
      },
    ],
    charges: [
      {
        reference_id: `charge_${Date.now()}`,
        description: `Plano ${plan.name} RoyalMed Health`,
        amount: {
          value: totalCents,
          currency: "BRL",
        },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: dueDate,
            instruction_lines: {
              line_1: "Pagamento processado pela RoyalMed Health",
              line_2: "Não receber após o vencimento",
            },
            holder: {
              name: customer.name,
              tax_id: customer.tax_id.replace(/\D/g, ""),
              email: customer.email,
              address: {
                country: "Brasil",
                region: "MS",
                region_code: "MS",
                city: "Campo Grande",
                postal_code: "79002372",
                street: "Rua Pedro Celestino",
                number: "2395",
                locality: "Centro",
              },
            },
          },
        },
      },
    ],
  };

  const result = await pagbankRequest("/orders", "POST", payload);
  const charge = result.charges?.[0];
  const boleto = charge?.payment_method?.boleto;

  return {
    order_id: result.id,
    charge_id: charge?.id,
    boleto: {
      barcode: boleto?.barcode,
      formatted_barcode: boleto?.formatted_barcode,
      due_date: boleto?.due_date,
      pdf_link: charge?.links?.find((l: any) => l.media === "application/pdf")?.href,
    },
  };
}

// ─── SUBSCRIPTION via CARTÃO (Assinatura Recorrente) ────────────────────────
async function createCardSubscription(plan: any, customer: any, card: any, extraAmountCents: number) {
  if (!plan.pagbank_plan_id) {
    throw new Error("Plano não cadastrado no PagBank. Execute a configuração de planos primeiro.");
  }

  const extraDeps = extraAmountCents > 0 ? Math.round(extraAmountCents / 2490) : 0;

  const payload: any = {
    plan: { id: plan.pagbank_plan_id },
    reference_id: `sub_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
      phone: {
        country: "55",
        area: "67",
        number: "000000000",
        type: "MOBILE",
      },
    },
    payment_method: {
      type: "CREDIT_CARD",
      installments: 1,
      card: {
        encrypted: card.encrypted,
        security_code: card.security_code,
        holder: {
          name: card.holder_name,
        },
        store: false,
      },
    },
  };

  // Adicionar taxa de dependentes extras se houver
  if (extraAmountCents > 0) {
    payload.amount = {
      trial: {
        value: 0,
        type: "FULL",
      },
    };
  }

  const result = await pagbankRequest("/subscriptions", "POST", payload);

  return {
    subscription_id: result.id,
    status: result.status,
    credit_card: {
      brand: result.payment_method?.card?.brand,
      last_digits: result.payment_method?.card?.last_digits,
    },
  };
}

// ─── HANDLER PRINCIPAL ───────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabaseUser = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ ok: false, error: "Não autenticado." }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { plan_id, payment_method, extra_dependents = 0, customer, card } = body;

    if (!plan_id || !payment_method || !customer?.tax_id) {
      return new Response(JSON.stringify({ ok: false, error: "Dados obrigatórios faltando." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Buscar plano no banco
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ ok: false, error: "Plano não encontrado." }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const extraAmountCents = Math.max(0, extra_dependents) * plan.extra_dependent_price_cents;
    const totalCents = plan.price_cents + (plan.interval_type === "YEARLY" ? extraAmountCents * 12 : extraAmountCents);

    let paymentResult: any;
    let pagbankSubscriptionId: string | null = null;

    console.log(`[pagbank-create-subscription] user=${user.id} plan=${plan.name} method=${payment_method}`);

    if (payment_method === "PIX") {
      paymentResult = await createPixSubscription(plan, customer, extraAmountCents);
    } else if (payment_method === "BOLETO") {
      paymentResult = await createBoletoSubscription(plan, customer, extraAmountCents);
    } else if (payment_method === "CREDIT_CARD") {
      if (!card?.encrypted) {
        return new Response(JSON.stringify({ ok: false, error: "Dados do cartão criptografados são obrigatórios." }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      paymentResult = await createCardSubscription(plan, customer, card, extraAmountCents);
      pagbankSubscriptionId = paymentResult.subscription_id;
    } else {
      return new Response(JSON.stringify({ ok: false, error: "Método de pagamento inválido." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Registrar assinatura no banco
    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        pagbank_subscription_id: pagbankSubscriptionId,
        status: payment_method === "CREDIT_CARD" ? "ACTIVE" : "PENDING",
        payment_method,
        current_period_start: new Date().toISOString(),
        current_period_end: periodEnd,
        extra_dependents_count: extra_dependents,
        monthly_total_cents: totalCents,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "user_id",
        ignoreDuplicates: false,
      })
      .select()
      .single();

    if (subError) throw subError;

    // Registrar pagamento no banco
    await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      type: "SUBSCRIPTION",
      amount_cents: totalCents,
      status: payment_method === "CREDIT_CARD" ? "PAID" : "PENDING",
      payment_method,
      pagbank_charge_id: paymentResult.order_id ?? paymentResult.subscription_id ?? null,
      description: `Assinatura Plano ${plan.name}`,
    });

    console.log(`[pagbank-create-subscription] sucesso! subscription=${subscription.id}`);

    return new Response(JSON.stringify({ ok: true, subscription_id: subscription.id, ...paymentResult }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("[pagbank-create-subscription] erro:", err);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
