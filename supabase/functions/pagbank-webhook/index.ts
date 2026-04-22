import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const body  = await req.json();

    console.log("[pagbank-webhook] Payload recebido:", JSON.stringify(body));

    // PagBank envia: { charges: [{...}], reference_id, id, status }
    const refId        = body.reference_id;
    const orderStatus  = body.charges?.[0]?.status ?? body.status;
    const chargeId     = body.charges?.[0]?.id ?? body.id;
    const paymentType  = body.charges?.[0]?.payment_method?.type ?? null;

    if (!refId) throw new Error("reference_id ausente no webhook.");

    const statusMap: Record<string, string> = {
      PAID:        "ACTIVE",
      AUTHORIZED:  "ACTIVE",
      DECLINED:    "SUSPENDED",
      CANCELLED:   "CANCELLED",
      REFUNDED:    "CANCELLED",
    };

    const newSubStatus     = statusMap[orderStatus] ?? "PENDING";
    const newPaymentStatus = orderStatus === "PAID" || orderStatus === "AUTHORIZED" ? "PAID" : orderStatus ?? "PENDING";

    // Atualiza assinatura
    await admin.from("subscriptions")
      .update({
        status:         newSubStatus,
        payment_method: paymentType,
        updated_at:     new Date().toISOString(),
      })
      .eq("pagbank_subscription_id", refId);

    // Atualiza pagamento
    await admin.from("payments")
      .update({
        status:            newPaymentStatus,
        payment_method:    paymentType,
        pagbank_charge_id: chargeId,
        updated_at:        new Date().toISOString(),
      })
      .eq("pagbank_charge_id", refId);

    console.log(`[pagbank-webhook] ref=${refId} orderStatus=${orderStatus} → sub=${newSubStatus}`);

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[pagbank-webhook] Erro:", err.message);
    // Retorna 200 mesmo em erro para o PagBank não retentar infinitamente
    return new Response(JSON.stringify({ received: true, error: err.message }), {
      status: 200,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
