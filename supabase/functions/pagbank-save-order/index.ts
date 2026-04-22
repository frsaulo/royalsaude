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

  // Validação básica de nome (PagSeguro v2 exige nome e sobrenome)
  let name = params.senderName.trim();
  if (!name.includes(" ")) {
    name = `${name} Cliente`; // Adiciona um sobrenome genérico se faltar
  }

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
    senderName:       name,
    redirectURL:      params.redirectUrl,
    notificationURL:  params.notificationUrl,
  });

  console.log(`[pagbank-save-order] Chamando PagSeguro v2. Email: ${PAGBANK_EMAIL}, Amount: ${amount}`);

  // Para garantir ISO-8859-1 em ambientes Deno, às vezes é necessário tratar o body manualmente
  // mas o Header costuma ser suficiente se o texto for simples.
  const res = await fetch(PAGSEGURO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1",
      "Accept": "application/xml",
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
    console.log("[pagbank-save-order] Authorization Header:", authHeader ? "Presente (Bearer ...)" : "AUSENTE");

    console.log("[pagbank-save-order] URL:", SUPABASE_URL);
    console.log("[pagbank-save-order] KEY length:", SUPABASE_KEY.length);
    
    if (!authHeader) {
      console.error("[pagbank-save-order] Erro: Header Authorization não enviado.");
      return new Response(JSON.stringify({ ok: false, error: "Token de autorização ausente." }), {
        status: 401,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const jwt = authHeader.split(" ").pop() ?? "";
    
    console.log("[pagbank-save-order] Validando JWT. Tamanho:", jwt.length);
    
    // Tenta decodificar o JWT para ver informações básicas (sem validar assinatura ainda)
    try {
      const payloadBase64 = jwt.split(".")[1];
      if (payloadBase64) {
        const payload = JSON.parse(atob(payloadBase64));
        console.log("[pagbank-save-order] JWT Payload - aud:", payload.aud, "role:", payload.role, "exp:", new Date(payload.exp * 1000).toISOString());
      }
    } catch (e) {
      console.error("[pagbank-save-order] Erro ao decodificar payload do JWT:", e.message);
    }

    const { data: { user }, error: authErr } = await admin.auth.getUser(jwt);
    
    if (authErr || !user) {
      console.error("[pagbank-save-order] ERRO DE AUTENTICAÇÃO DETALHADO:");
      console.error(" - Nome:", authErr?.name);
      console.error(" - Mensagem:", authErr?.message);
      console.error(" - Status:", (authErr as any)?.status);
      
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "Sessão inválida ou e-mail não confirmado.",
        details: authErr?.message || "User not found",
        hint: "Verifique se o e-mail foi confirmado ou se o login expirou."
      }), {
        status: 401,
        headers: { ...CORS, "Content-Type": "application/json" },
      });
    }

    // Verifica se o e-mail está confirmado para log
    if (!user.email_confirmed_at) {
      console.warn("[pagbank-save-order] AVISO: Usuário com e-mail não confirmado:", user.email);
    }

    console.log("[pagbank-save-order] Usuário OK:", user.id);

    console.log(`[pagbank-save-order] Usuário autenticado: ${user.id} (${user.email})`);

    const { plan_id, total_cents, extra_dependents = 0, customer, origin_url } = await req.json();

    if (!plan_id || !total_cents || !customer?.email) throw new Error("Dados incompletos (plan_id, total_cents ou email).");

    // Limpa o CPF/CNPJ para enviar apenas números
    const cleanTaxId = customer.tax_id ? customer.tax_id.replace(/\D/g, "") : "";
    
    console.log(`[pagbank-save-order] Iniciando para user=${user.id}. CPF Limpo: ${cleanTaxId}`);

    // ── Busca plano ──────────────────────────────────────────────────────────
    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error(`Plano não encontrado: ${plan_id}`);

    const refId   = `royalmed_${user.id}_${Date.now()}`;
    const baseUrl = (origin_url && origin_url !== "null") ? origin_url : "https://royalsaude.com.br";

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
