import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGBANK_TOKEN    = Deno.env.get("PAGBANK_TOKEN");
const PAGBANK_BASE_URL = "https://api.pagseguro.com";
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

console.log("[pagbank-create-subscription] Função iniciada");

async function pagbankRequest(path: string, method: string, body?: object) {
  if (!PAGBANK_TOKEN) {
    throw new Error("PAGBANK_TOKEN não configurado nos Secrets do Supabase.");
  }

  const maskedToken = `${PAGBANK_TOKEN.substring(0, 5)}...${PAGBANK_TOKEN.substring(PAGBANK_TOKEN.length - 5)}`;
  console.log(`[pagbankRequest] Rota: ${method} ${path} | Token: ${maskedToken} (Tamanho: ${PAGBANK_TOKEN.length})`);

  const res = await fetch(`${PAGBANK_BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json",
      "User-Agent": "RoyalMed-Integration/1.0",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch {
    console.error(`[pagbankRequest] Resposta NÃO-JSON do PagBank (HTTP ${res.status}):`, text.slice(0, 500));
    throw new Error(`PagBank bloqueou a requisição ou retornou formato inválido (HTTP ${res.status}). Detalhes no console do Supabase.`);
  }

  if (!res.ok) {
    console.error(`[pagbankRequest] Erro da API (${res.status}):`, JSON.stringify(data, null, 2));
    const msg = data?.error_messages?.[0]?.description ?? data?.message ?? "Erro desconhecido retornado pelo PagBank";
    const code = data?.error_messages?.[0]?.code ?? res.status;
    throw new Error(`[PagBank Erro ${code}]: ${msg}`);
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

// ─── CARTÃO ───────────────────────────
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      throw new Error("Usuário não autenticado no Supabase (Auth header missing)");
    }

    const supabaseClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: { headers: { Authorization: authHeader } }
    });
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      throw new Error("Não foi possível autenticar o usuário na sessão.");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const body = await req.json();
    const { plan_id, payment_method, extra_dependents = 0, customer, card } = body;

    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans")
      .select("*")
      .eq("id", plan_id)
      .single();

    if (planError || !plan) {
      throw new Error("Plano selecionado não foi encontrado no banco de dados.");
    }

    const extraAmountCents = Math.max(0, extra_dependents) * (plan.extra_dependent_price_cents ?? 2490);
    const totalCents = plan.price_cents + (plan.interval_type === "YEARLY" ? extraAmountCents * 12 : extraAmountCents);

    let paymentResult: any;

    if (payment_method === "PIX") {
      paymentResult = await createPixOrder(plan, customer, totalCents);
    } else if (payment_method === "BOLETO") {
      paymentResult = await createBoletoOrder(plan, customer, totalCents);
    } else if (payment_method === "CREDIT_CARD") {
      paymentResult = await createCardOrder(plan, customer, card, totalCents);
    } else {
      throw new Error(`Método de pagamento inválido: ${payment_method}`);
    }

    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

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
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (subError) {
      console.error("[supabase] Erro ao salvar subscription:", subError);
      throw new Error("Falha ao salvar assinatura no banco de dados.");
    }

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

    return new Response(JSON.stringify({ ok: true, subscription_id: subscription.id, ...paymentResult }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    // Retornamos 400 Bad Request em vez de 500 para exibir o erro corretamente pro usuário
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});

