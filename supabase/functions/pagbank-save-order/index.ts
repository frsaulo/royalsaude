import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL    = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY    = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_TOKEN   = Deno.env.get("PAGBANK_TOKEN") ?? "";
const PAGBANK_API_URL = "https://api.pagseguro.com";

// ── Chama a API do PagBank ────────────────────────────────────────────────────
async function pagbankFetch(path: string, body: object) {
  const res = await fetch(`${PAGBANK_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error_messages?.[0]?.description ?? data?.message ?? "Erro no PagBank";
    throw new Error(`PagBank ${res.status}: ${msg}`);
  }
  return data;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // ── Autenticação do usuário ────────────────────────────────────────────────
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
      total_cents,
      customer,   // { name, email, tax_id }
      card,       // { encrypted, holder_name, security_code }  — só para CREDIT_CARD
    } = body;

    if (!plan_id || !payment_method || !total_cents || !customer) {
      throw new Error("Campos obrigatórios ausentes.");
    }

    // ── Busca plano ───────────────────────────────────────────────────────────
    const { data: plan, error: planError } = await supabaseAdmin
      .from("plans").select("*").eq("id", plan_id).single();
    if (planError || !plan) throw new Error("Plano não encontrado.");

    const refId    = `royalmed_${Date.now()}`;
    const cleanCpf = customer.tax_id.replace(/\D/g, "");

    let pagbankResult: Record<string, any> = {};
    let chargeId: string | null = null;
    let orderId: string | null  = null;

    // ══════════════════════════════════════════════════════════════════════════
    // PIX
    // ══════════════════════════════════════════════════════════════════════════
    if (payment_method === "PIX") {
      const result = await pagbankFetch("/orders", {
        reference_id: refId,
        customer: { name: customer.name, email: customer.email, tax_id: cleanCpf },
        items: [{ reference_id: plan_id, name: "Plano RoyalMed Health", quantity: 1, unit_amount: total_cents }],
        qr_codes: [{
          amount: { value: total_cents },
          expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        }],
      });

      orderId = result.id;
      const qrCode = result.qr_codes?.[0];
      pagbankResult = {
        pix: {
          qr_code:       qrCode?.text,
          qr_code_image: qrCode?.links?.find((l: any) => l.media === "image/png")?.href,
          expiration:    qrCode?.expiration_date,
        },
      };

    // ══════════════════════════════════════════════════════════════════════════
    // BOLETO
    // ══════════════════════════════════════════════════════════════════════════
    } else if (payment_method === "BOLETO") {
      const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
      const result = await pagbankFetch("/orders", {
        reference_id: refId,
        customer: { name: customer.name, email: customer.email, tax_id: cleanCpf },
        items: [{ reference_id: plan_id, name: "Plano RoyalMed Health", quantity: 1, unit_amount: total_cents }],
        charges: [{
          reference_id: `charge_${Date.now()}`,
          description: "Assinatura RoyalMed Health",
          amount: { value: total_cents, currency: "BRL" },
          payment_method: {
            type: "BOLETO",
            boleto: {
              due_date: dueDate,
              instruction_lines: {
                line_1: "Pagamento processado pela RoyalMed Health",
                line_2: "Nao receber apos o vencimento",
              },
              holder: {
                name: customer.name, tax_id: cleanCpf, email: customer.email,
                address: {
                  country: "Brasil", region: "SP", region_code: "SP",
                  city: "Sao Paulo", postal_code: "01310100",
                  street: "Avenida Paulista", number: "1", locality: "Centro",
                },
              },
            },
          },
        }],
      });

      orderId  = result.id;
      const charge = result.charges?.[0];
      chargeId = charge?.id ?? null;
      const boleto = charge?.payment_method?.boleto;
      pagbankResult = {
        boleto: {
          barcode:           boleto?.barcode,
          formatted_barcode: boleto?.formatted_barcode,
          due_date:          boleto?.due_date,
          pdf_link:          charge?.links?.find((l: any) => l.media === "application/pdf")?.href,
        },
      };

    // ══════════════════════════════════════════════════════════════════════════
    // CARTÃO
    // ══════════════════════════════════════════════════════════════════════════
    } else if (payment_method === "CREDIT_CARD") {
      if (!card?.encrypted) throw new Error("Dados do cartão não fornecidos.");

      const result = await pagbankFetch("/orders", {
        reference_id: refId,
        customer: { name: customer.name, email: customer.email, tax_id: cleanCpf },
        items: [{ reference_id: plan_id, name: "Plano RoyalMed Health", quantity: 1, unit_amount: total_cents }],
        charges: [{
          reference_id: `charge_${Date.now()}`,
          description: "Assinatura RoyalMed Health",
          amount: { value: total_cents, currency: "BRL" },
          payment_method: {
            type: "CREDIT_CARD",
            installments: 1,
            capture: true,
            card: {
              encrypted:     card.encrypted,
              security_code: card.security_code,
              holder:        { name: card.holder_name },
              store:         false,
            },
          },
        }],
      });

      orderId  = result.id;
      const charge = result.charges?.[0];
      chargeId = charge?.id ?? null;
      pagbankResult = { card_status: charge?.status };

    } else {
      throw new Error(`Método de pagamento inválido: ${payment_method}`);
    }

    // ── Salvar assinatura no Supabase ─────────────────────────────────────────
    const periodEnd = plan.interval_type === "YEARLY"
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const isCardPaid = payment_method === "CREDIT_CARD" &&
      (pagbankResult.card_status === "PAID" || pagbankResult.card_status === "AUTHORIZED");

    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: user.id,
        plan_id: plan.id,
        pagbank_subscription_id: orderId,
        status: isCardPaid ? "ACTIVE" : "PENDING",
        payment_method,
        current_period_start: new Date().toISOString(),
        current_period_end:   periodEnd,
        extra_dependents_count: extra_dependents,
        monthly_total_cents:   total_cents,
        updated_at:            new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (subError) {
      console.error("[pagbank-save-order] Erro ao salvar subscription:", subError);
      throw new Error("Falha ao salvar assinatura no banco de dados.");
    }

    await supabaseAdmin.from("payments").insert({
      user_id:          user.id,
      subscription_id:  subscription.id,
      type:             "SUBSCRIPTION",
      amount_cents:     total_cents,
      status:           isCardPaid ? "PAID" : "PENDING",
      payment_method,
      pagbank_charge_id: chargeId ?? orderId,
      description:      `Assinatura Plano ${plan.name}`,
    });

    return new Response(
      JSON.stringify({ ok: true, subscription_id: subscription.id, order_id: orderId, ...pagbankResult }),
      { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("[pagbank-save-order] Erro:", err.message);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
