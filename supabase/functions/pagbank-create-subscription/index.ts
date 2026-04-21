import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Fallback garante funcionamento mesmo sem secret configurado no painel
const PAGBANK_TOKEN    = Deno.env.get("PAGBANK_TOKEN") ?? "dcf8c2e8-8fc2-4dc6-b112-f2dc388604572c0b5c6145f7bd457f39cce8c8bc59e85906-d760-4ee7-b88a-4dea9254c91c";
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
  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`PagBank erro HTTP ${res.status}: ${text.slice(0, 300)}`);
  }
  if (!res.ok) {
    console.error("[pagbank] API error:", JSON.stringify(data));
    const msg = data?.error_messages?.[0]?.description ?? data?.message ?? JSON.stringify(data);
    throw new Error(`PagBank ${res.status}: ${msg}`);
  }
  return data;
}

// ─── PIX ─────────────────────────────────────────────────────────────────────
async function createPixOrder(plan: any, customer: any, totalCents: number) {
  const payload = {
    reference_id: `royalmed_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
    },
    items: [
      {
        reference_id: plan.id,
        name: `Plano ${plan.name} RoyalMed Health`,
        quantity: 1,
        unit_amount: totalCents,
      },
    ],
    qr_codes: [
      {
        amount: { value: totalCents },
        expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
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

// ─── BOLETO ───────────────────────────────────────────────────────────────────
async function createBoletoOrder(plan: any, customer: any, totalCents: number) {
  const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const payload = {
    reference_id: `royalmed_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
    },
    items: [
      {
        reference_id: plan.id,
        name: `Plano ${plan.name} RoyalMed Health`,
        quantity: 1,
        unit_amount: totalCents,
      },
    ],
    charges: [
      {
        reference_id: `charge_${Date.now()}`,
        description: `Plano ${plan.name} RoyalMed Health`,
        amount: { value: totalCents, currency: "BRL" },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: dueDate,
            instruction_lines: {
              line_1: "Pagamento processado pela RoyalMed Health",
              line_2: "Nao receber apos o vencimento",
            },
            holder: {
              name: customer.name,
              tax_id: customer.tax_id.replace(/\D/g, ""),
              email: customer.email,
              address: {
                country: "Brasil",
                region: customer.state ?? "SP",
                region_code: customer.state ?? "SP",
                city: customer.city ?? "Sao Paulo",
                postal_code: (customer.postal_code ?? "01310100").replace(/\D/g, ""),
                street: customer.street ?? "Avenida Paulista",
                number: customer.number ?? "1",
                locality: customer.neighborhood ?? "Centro",
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

// ─── CARTÃO (cobrança direta, sem plano recorrente) ───────────────────────────
async function createCardOrder(plan: any, customer: any, card: any, totalCents: number) {
  const payload = {
    reference_id: `royalmed_${Date.now()}`,
    customer: {
      name: customer.name,
      email: customer.email,
      tax_id: customer.tax_id.replace(/\D/g, ""),
    },
    items: [
      {
        reference_id: plan.id,
        name: `Plano ${plan.name} RoyalMed Health`,
        quantity: 1,
        unit_amount: totalCents,
      },
    ],
    charges: [
      {
        reference_id: `charge_${Date.now()}`,
        description: `Plano ${plan.name} RoyalMed Health`,
        amount: { value: totalCents, currency: "BRL" },
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          capture: true,
          card: {
            encrypted: card.encrypted,
            security_code: card.security_code,
            holder: { name: card.holder_name },
            store: false,
          },
        },
      },
    ],
  };

  const result = await pagbankRequest("/orders", "POST", payload);
  const charge = result.charges?.[0];

  return {
    order_id: result.id,
    charge_id: charge?.id,
    status: charge?.status,
    credit_card: {
      brand: charge?.payment_method?.card?.brand,
      last_digits: charge?.payment_method?.card?.last_digits,
    },
  };
}

// ─── HANDLER PRINCIPAL ────────────────────────────────────────────────────────
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
      return new Response(JSON.stringify({ ok: false, error: "Nao autenticado." }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { plan_id, payment_method, extra_dependents = 0, customer, card } = body;

    if (!plan_id || !payment_method || !customer?.tax_id) {
      return new Response(JSON.stringify({ ok: false, error: "Dados obrigatorios faltando." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      return new Response(JSON.stringify({ ok: false, error: "Plano nao encontrado." }), {
        status: 404,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    const extraAmountCents = Math.max(0, extra_dependents) * (plan.extra_dependent_price_cents ?? 2490);
    const totalCents = plan.price_cents + (plan.interval_type === "YEARLY" ? extraAmountCents * 12 : extraAmountCents);

    let paymentResult: any;

    console.log(`[pagbank] user=${user.id} plan=${plan.name} method=${payment_method} total=${totalCents}`);

    if (payment_method === "PIX") {
      paymentResult = await createPixOrder(plan, customer, totalCents);
    } else if (payment_method === "BOLETO") {
      paymentResult = await createBoletoOrder(plan, customer, totalCents);
    } else if (payment_method === "CREDIT_CARD") {
      if (!card?.encrypted) {
        return new Response(JSON.stringify({ ok: false, error: "Dados do cartao criptografados sao obrigatorios." }), {
          status: 400,
          headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
        });
      }
      paymentResult = await createCardOrder(plan, customer, card, totalCents);
    } else {
      return new Response(JSON.stringify({ ok: false, error: "Metodo de pagamento invalido." }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      });
    }

    // Período da assinatura
    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    // Status inicial: cartão aprovado imediatamente se charge PAID, outros pendente
    const isCardPaid = payment_method === "CREDIT_CARD" &&
      (paymentResult.status === "PAID" || paymentResult.status === "AUTHORIZED");

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        pagbank_subscription_id: paymentResult.order_id ?? null,
        status: isCardPaid ? "ACTIVE" : "PENDING",
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

    await supabaseAdmin.from("payments").insert({
      user_id: user.id,
      subscription_id: subscription.id,
      type: "SUBSCRIPTION",
      amount_cents: totalCents,
      status: isCardPaid ? "PAID" : "PENDING",
      payment_method,
      pagbank_charge_id: paymentResult.order_id ?? null,
      description: `Assinatura Plano ${plan.name}`,
    });

    console.log(`[pagbank] sucesso! subscription=${subscription.id}`);

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
