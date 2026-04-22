import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_EMAIL = Deno.env.get("PAGBANK_EMAIL") ?? "";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "";

// Consulta detalhes de uma transação PagSeguro v2 a partir do notificationCode
async function fetchTransactionByNotification(code: string) {
  const url = `https://ws.pagseguro.uol.com.br/v3/transactions/notifications/${code}?email=${encodeURIComponent(PAGBANK_EMAIL)}&token=${PAGBANK_TOKEN}`;

  const res = await fetch(url, {
    headers: { "Accept": "application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1" },
  });

  const text = await res.text();
  console.log(`[pagbank-webhook] Consulta transação (${res.status}): ${text.slice(0, 500)}`);

  if (!res.ok) throw new Error(`PagSeguro ${res.status}: ${text}`);
  return text;
}

// Extrai campo do XML por tag
function extractXml(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return m?.[1]?.trim() ?? "";
}

// Mapeia status numérico do PagSeguro v2 para status interno
// Referência: https://dev.pagseguro.uol.com.br/v1/docs/pagamento-transacao-consultando
function mapStatus(statusCode: string): { subStatus: string; payStatus: string } {
  const map: Record<string, { subStatus: string; payStatus: string }> = {
    "1": { subStatus: "PENDING",   payStatus: "PENDING" }, // Aguardando pagamento
    "2": { subStatus: "PENDING",   payStatus: "PENDING" }, // Em análise
    "3": { subStatus: "ACTIVE",    payStatus: "PAID"    }, // Paga
    "4": { subStatus: "ACTIVE",    payStatus: "PAID"    }, // Disponível
    "5": { subStatus: "PENDING",   payStatus: "PENDING" }, // Em disputa
    "6": { subStatus: "CANCELLED", payStatus: "REFUNDED"}, // Devolvida
    "7": { subStatus: "CANCELLED", payStatus: "FAILED"  }, // Cancelada
    "8": { subStatus: "CANCELLED", payStatus: "FAILED"  }, // Debitado
    "9": { subStatus: "SUSPENDED", payStatus: "FAILED"  }, // Retenção temporária
  };
  return map[statusCode] ?? { subStatus: "PENDING", payStatus: "PENDING" };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });

  // Sempre responde 200 — PagSeguro retenta se receber outro código
  const ok = () => new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const contentType = req.headers.get("content-type") ?? "";

    let notificationCode = "";
    let notificationType = "";

    // PagSeguro v2 envia application/x-www-form-urlencoded
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      notificationCode = params.get("notificationCode") ?? "";
      notificationType = params.get("notificationType") ?? "";
      console.log(`[pagbank-webhook] v2 form-encoded — code=${notificationCode} type=${notificationType}`);
    } else {
      // Fallback: tenta JSON (API v3 moderna, caso ainda seja chamada)
      const body = await req.json().catch(() => ({}));
      console.log("[pagbank-webhook] Payload JSON recebido:", JSON.stringify(body));

      const refId       = body.reference_id;
      const orderStatus = body.charges?.[0]?.status ?? body.status;
      const chargeId    = body.charges?.[0]?.id ?? body.id;
      const payType     = body.charges?.[0]?.payment_method?.type ?? null;

      if (refId && orderStatus) {
        const statusMap: Record<string, { subStatus: string; payStatus: string }> = {
          PAID:        { subStatus: "ACTIVE",    payStatus: "PAID"    },
          AUTHORIZED:  { subStatus: "ACTIVE",    payStatus: "PAID"    },
          DECLINED:    { subStatus: "SUSPENDED", payStatus: "FAILED"  },
          CANCELLED:   { subStatus: "CANCELLED", payStatus: "FAILED"  },
          REFUNDED:    { subStatus: "CANCELLED", payStatus: "REFUNDED"},
        };
        const { subStatus, payStatus } = statusMap[orderStatus] ?? { subStatus: "PENDING", payStatus: "PENDING" };

        await admin.from("subscriptions").update({ status: subStatus, payment_method: payType, updated_at: new Date().toISOString() }).eq("pagbank_subscription_id", refId);
        await admin.from("payments").update({ status: payStatus, payment_method: payType, pagbank_charge_id: chargeId, updated_at: new Date().toISOString() }).eq("pagbank_charge_id", refId);
        console.log(`[pagbank-webhook] JSON ref=${refId} → sub=${subStatus}`);
      }
      return ok();
    }

    if (!notificationCode || notificationType !== "transaction") {
      console.log("[pagbank-webhook] Notificação ignorada — tipo:", notificationType);
      return ok();
    }

    // Consulta detalhes da transação
    const xml     = await fetchTransactionByNotification(notificationCode);
    const refId   = extractXml(xml, "reference");
    const statusC = extractXml(xml, "status");
    const payType = extractXml(xml, "type"); // tipo de pagamento: 1=boleto, 2=cartão, 3=débito, 7=pix

    if (!refId) {
      console.warn("[pagbank-webhook] <reference> ausente no XML");
      return ok();
    }

    const payTypeMap: Record<string, string> = {
      "1": "BOLETO",
      "2": "CREDIT_CARD",
      "3": "DEBIT_CARD",
      "7": "PIX",
    };

    const { subStatus, payStatus } = mapStatus(statusC);
    const paymentMethod = payTypeMap[payType] ?? null;

    console.log(`[pagbank-webhook] ref=${refId} statusCode=${statusC} → sub=${subStatus} pay=${payStatus} method=${paymentMethod}`);

    await admin.from("subscriptions")
      .update({ status: subStatus, payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("pagbank_subscription_id", refId);

    await admin.from("payments")
      .update({ status: payStatus, payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("pagbank_charge_id", refId);

    return ok();

  } catch (err: any) {
    console.error("[pagbank-webhook] Erro:", err.message);
    return ok(); // Sempre 200 para evitar retentativas infinitas do PagSeguro
  }
});
