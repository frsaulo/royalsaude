import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";
const PAGBANK_EMAIL = Deno.env.get("PAGBANK_EMAIL") ?? "ronaldo.grupogold@icloud.com";

const IS_SANDBOX = true; // Mude para false para produção

const PAGSEGURO_API_URL      = IS_SANDBOX 
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
  if (!name.includes(" ")) name = `${name} Cliente`;

  const body = new URLSearchParams({
    email:            PAGBANK_EMAIL,
    token:            PAGBANK_TOKEN,
    currency:         "BRL",
    itemId1:          "0002", // ID fixo para consulta
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
  if (!res.ok) throw new Error(`PagSeguro ${res.status}: ${text}`);

  const match = text.match(/<code>([^<]+)<\/code>/);
  if (!match?.[1]) throw new Error(`Código de checkout não encontrado.`);

  return match[1];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) throw new Error("Não autorizado");

    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const jwt = authHeader.split(" ").pop() ?? "";
    const payload = JSON.parse(atob(jwt.split(".")[1]));
    const userId = payload.sub;

    const { appointment_id, origin_url } = await req.json();
    if (!appointment_id) throw new Error("appointment_id é obrigatório");

    // 1. Busca agendamento e perfil do usuário
    const { data: appointment, error: appErr } = await admin
      .from("appointments")
      .select("*, profiles!inner(*)")
      .eq("id", appointment_id)
      .single();

    if (appErr || !appointment) throw new Error("Agendamento não encontrado.");

    // 2. Busca plano ativo do usuário para saber o preço da consulta
    const { data: sub, error: subErr } = await admin
      .from("subscriptions")
      .select("plans(*)")
      .eq("user_id", userId)
      .eq("status", "ACTIVE")
      .single();

    // Se não tiver plano ativo, preço padrão (ex: R$ 99,90) ou erro?
    // O usuário disse "conforme as regras dos meus planos", então vamos seguir o plano.
    const consultationPrice = sub?.plans?.consultation_price_cents ?? 6990; 

    const refId = `appointment_${appointment_id}_${Date.now()}`;
    const baseUrl = (origin_url && origin_url !== "null") ? origin_url : "https://royalsaude.com.br";

    // 3. Cria checkout
    const checkoutCode = await createV2Checkout({
      reference:       refId,
      itemDescription: `Consulta ${appointment.specialty} - RoyalMed`,
      amountCents:     consultationPrice,
      senderEmail:     appointment.profiles.email || "cliente@exemplo.com",
      senderName:      appointment.profiles.full_name || "Cliente",
      redirectUrl:     `${baseUrl}/agenda?success=true`,
      notificationUrl: `${SUPABASE_URL}/functions/v1/pagbank-webhook`,
    });

    const paymentUrl = `${PAGSEGURO_CHECKOUT_URL}#${checkoutCode}`;

    // 4. Registra tentativa de pagamento
    await admin.from("payments").insert({
      user_id: userId,
      appointment_id: appointment_id,
      type: "CONSULTATION",
      amount_cents: consultationPrice,
      status: "PENDING",
      pagbank_charge_id: refId,
      description: `Consulta ${appointment.specialty}`,
    });

    return new Response(JSON.stringify({ ok: true, payment_url: paymentUrl }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
