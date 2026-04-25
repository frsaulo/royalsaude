import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept, prefer",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
// Hardcoded para teste conforme solicitado
const PAGBANK_TOKEN = "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";

const IS_SANDBOX = true; 

const PAGBANK_EMAIL = "ronaldo.grupogold@icloud.com";

const PAGSEGURO_API_URL = IS_SANDBOX 
  ? "https://ws.sandbox.pagseguro.uol.com.br/v2/checkout"
  : "https://ws.pagseguro.uol.com.br/v2/checkout";

const PAGSEGURO_CHECKOUT_URL = IS_SANDBOX
  ? "https://sandbox.pagseguro.uol.com.br/v2/checkout"
  : "https://pagseguro.uol.com.br/v2/checkout";

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
  let name = params.senderName.trim();
  
  // O PagSeguro exige nome com pelo menos 2 palavras e sem caracteres especiais
  if (!name.includes(" ")) name = `${name} Cliente`;
  name = name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z\s]/g, "");

  console.log(`[pagbank-save-order] Criando checkout V2: ${params.itemDescription} - R$ ${amount}`);

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

  const res = await fetch(PAGSEGURO_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=ISO-8859-1",
      "Accept": "application/xml",
    },
    body: body.toString(),
  });

  const text = await res.text();
  
  if (!res.ok) {
    console.error("[pagbank-save-order] Erro bruto PagSeguro:", text);
    // Extrai as mensagens de erro do XML
    const errorMatches = text.matchAll(/<message>([^<]+)<\/message>/g);
    const errors = Array.from(errorMatches).map(m => m[1]);
    const errorMsg = errors.length > 0 ? errors.join(" | ") : "Erro desconhecido no PagBank";
    
    throw new Error(`PagSeguro: ${errorMsg}`);
  }

  const match = text.match(/<code>([^<]+)<\/code>/);
  if (!match?.[1]) throw new Error(`Código de checkout não encontrado na resposta do PagSeguro.`);

  return `${PAGSEGURO_CHECKOUT_URL}?code=${match[1]}`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Não autorizado.");

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const jwt = authHeader.split(" ").pop() ?? "";
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const userId = payload.sub;

    if (!userId) throw new Error("Usuário não identificado.");

    const bodyParams = await req.json();
    console.log("[pagbank-save-order] Payload recebido:", JSON.stringify(bodyParams));
    
    const { plan_id, total_cents, extra_dependents = 0, origin_url } = bodyParams;

    // Busca dados do plano
    const { data: plan, error: planErr } = await admin.from("plans").select("*").eq("id", plan_id).single();
    if (planErr || !plan) throw new Error("Plano não encontrado.");

    // Busca dados do perfil do usuário
    const { data: profile } = await admin.from("profiles").select("full_name").eq("id", userId).single();

    const refId = `sub_${userId.substring(0,8)}_${Date.now()}`;
    const baseUrl = origin_url || "https://royalsaude.com.br";

    // NO SANDBOX: O e-mail do comprador NÃO PODE ser o mesmo do vendedor
    // Se o usuário estiver usando o e-mail ronaldo.grupogold@icloud.com (vendedor), 
    // mudamos o comprador para um e-mail de teste genérico.
    let senderEmail = bodyParams.customer?.email || "cliente@teste.com.br";
    if (IS_SANDBOX && senderEmail.toLowerCase() === PAGBANK_EMAIL.toLowerCase()) {
      senderEmail = "c31804257124195159424@sandbox.pagseguro.com.br"; // E-mail de comprador padrão de sandbox
    } else if (IS_SANDBOX && !senderEmail.includes("@")) {
      senderEmail = "cliente@teste.com.br";
    }

    const checkoutUrl = await createV2Checkout({
      reference: refId,
      itemDescription: `Assinatura ${plan.name} - RoyalMed`,
      amountCents: total_cents || plan.price_cents,
      senderEmail: senderEmail,
      senderName: profile?.full_name || bodyParams.customer?.name || "Cliente RoyalMed",
      redirectUrl: `${baseUrl}/pagamento-confirmado?ref=${refId}`,
      notificationUrl: `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
    });

    // Registra a intenção de assinatura no banco
    const { error: upsertErr } = await admin.from("subscriptions").upsert({
      user_id: userId,
      plan_id: plan.id,
      pagbank_subscription_id: refId,
      status: "PENDING",
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30*24*60*60*1000).toISOString(),
      extra_dependents_count: extra_dependents,
      monthly_total_cents: total_cents || plan.price_cents,
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });

    if (upsertErr) console.error("[pagbank-save-order] Erro ao salvar sub:", upsertErr);

    return new Response(JSON.stringify({ ok: true, payment_url: checkoutUrl }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[pagbank-save-order] Erro na execução:", err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});

