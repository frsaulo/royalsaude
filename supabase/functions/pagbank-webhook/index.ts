import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PAGBANK_EMAIL = Deno.env.get("PAGBANK_EMAIL") ?? "ronaldo.grupogold@icloud.com";
const PAGBANK_TOKEN = Deno.env.get("PAGBANK_TOKEN") ?? "e82e3dba-0dd7-4ba1-8afd-0feec510ca1c038248324d9a86eb68c57216168cba2f27ab-c6a0-499f-8e4b-fac05bad286b";

const IS_SANDBOX = true; // Deve ser igual ao das outras funções

// Consulta detalhes de uma transação PagSeguro v2 a partir do notificationCode
async function fetchTransactionByNotification(code: string) {
  const baseUrl = IS_SANDBOX 
    ? "https://ws.sandbox.pagseguro.uol.com.br/v3/transactions/notifications"
    : "https://ws.pagseguro.uol.com.br/v3/transactions/notifications";
    
  const url = `${baseUrl}/${code}?email=${encodeURIComponent(PAGBANK_EMAIL)}&token=${PAGBANK_TOKEN}`;

  const res = await fetch(url, {
    headers: { "Accept": "application/vnd.pagseguro.com.br.v3+xml;charset=ISO-8859-1" },
  });

  const text = await res.text();
  console.log(`[pagbank-webhook] Consulta transação v2 (${res.status}): ${text.slice(0, 500)}`);

  if (!res.ok) throw new Error(`PagSeguro ${res.status}: ${text}`);
  return text;
}

// Extrai campo do XML por tag
function extractXml(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>([^<]*)<\/${tag}>`));
  return m?.[1]?.trim() ?? "";
}

// Mapeia status numérico do PagSeguro v2 para status interno
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

  const ok = () => new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

  try {
    const admin = createClient(SUPABASE_URL, SUPABASE_KEY);
    const contentType = req.headers.get("content-type") ?? "";

    // 1. Tratamento para API V3 (JSON) - Usado em Planos/Assinaturas
    if (contentType.includes("application/json")) {
      const body = await req.json().catch(() => ({}));
      console.log("[pagbank-webhook] Payload V3 (JSON) recebido:", JSON.stringify(body));

      const refId       = body.reference_id || body.reference;
      const orderStatus = body.status || (body.charges?.[0]?.status);
      const chargeId    = body.id || (body.charges?.[0]?.id);
      const payType     = body.charges?.[0]?.payment_method?.type ?? null;

      if (refId && orderStatus) {
        const statusMap: Record<string, { subStatus: string; payStatus: string }> = {
          "PAID":       { subStatus: "ACTIVE",    payStatus: "PAID"    },
          "COMPLETED":  { subStatus: "ACTIVE",    payStatus: "PAID"    },
          "AUTHORIZED": { subStatus: "ACTIVE",    payStatus: "PAID"    },
          "DECLINED":   { subStatus: "SUSPENDED", payStatus: "FAILED"  },
          "CANCELED":   { subStatus: "CANCELLED", payStatus: "FAILED"  },
          "CANCELLED":  { subStatus: "CANCELLED", payStatus: "FAILED"  },
          "REFUNDED":   { subStatus: "CANCELLED", payStatus: "REFUNDED"},
        };
        
        const { subStatus, payStatus } = statusMap[orderStatus] ?? { subStatus: "PENDING", payStatus: "PENDING" };

        console.log(`[pagbank-webhook] V3 Processando: ref=${refId} status=${orderStatus} -> sub=${subStatus}`);

        // Atualiza Assinatura
        const { error: subErr } = await admin.from("subscriptions")
          .update({ 
            status: subStatus, 
            payment_method: payType, 
            updated_at: new Date().toISOString() 
          })
          .eq("pagbank_subscription_id", refId);
        
        if (subErr) console.error("[pagbank-webhook] Erro ao atualizar assinatura:", subErr.message);

        // Atualiza Pagamento
        const { error: payErr } = await admin.from("payments")
          .update({ 
            status: payStatus, 
            payment_method: payType, 
            pagbank_charge_id: chargeId, // Atualiza com o ID real do PagBank
            updated_at: new Date().toISOString() 
          })
          .eq("pagbank_charge_id", refId); // Busca pelo ID temporário (reference_id)
        
        if (payErr) console.error("[pagbank-webhook] Erro ao atualizar pagamento:", payErr.message);
      }
      return ok();
    }

    // 2. Tratamento para API V2 (Form-encoded) - Usado em Agendamentos
    let notificationCode = "";
    let notificationType = "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      notificationCode = params.get("notificationCode") ?? "";
      notificationType = params.get("notificationType") ?? "";
      console.log(`[pagbank-webhook] v2 Notificação recebida — code=${notificationCode} type=${notificationType}`);
    }

    if (!notificationCode || notificationType !== "transaction") {
      return ok();
    }

    // Consulta detalhes da transação v2
    const xml     = await fetchTransactionByNotification(notificationCode);
    const refId   = extractXml(xml, "reference");
    const statusC = extractXml(xml, "status");
    const payType = extractXml(xml, "type"); 

    if (!refId) {
      console.warn("[pagbank-webhook] <reference> ausente no XML");
      return ok();
    }

    const payTypeMap: Record<string, string> = {
      "1": "BOLETO", "2": "CREDIT_CARD", "3": "DEBIT_CARD", "7": "PIX",
    };

    const { subStatus, payStatus } = mapStatus(statusC);
    const paymentMethod = payTypeMap[payType] ?? null;

    console.log(`[pagbank-webhook] v2 ref=${refId} statusCode=${statusC} → sub=${subStatus}`);

    await admin.from("subscriptions")
      .update({ status: subStatus, payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("pagbank_subscription_id", refId);

    const { data: payment } = await admin.from("payments")
      .update({ status: payStatus, payment_method: paymentMethod, updated_at: new Date().toISOString() })
      .eq("pagbank_charge_id", refId)
      .select("appointment_id")
      .single();

    if (payment?.appointment_id && payStatus === "PAID") {
      await admin.from("appointments")
        .update({ status: "CONFIRMED", updated_at: new Date().toISOString() })
        .eq("id", payment.appointment_id);
    }

    return ok();

  } catch (err: any) {
    console.error("[pagbank-webhook] Erro:", err.message);
    return ok(); // Sempre 200 para evitar retentativas infinitas do PagSeguro
  }
});
