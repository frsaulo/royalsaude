import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const PAGBANK_TOKEN    = Deno.env.get("PAGBANK_TOKEN");
const PAGBANK_BASE_URL = Deno.env.get("PAGBANK_API_URL") || "https://api.pagseguro.com";
const SUPABASE_URL     = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_KEY     = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

console.log("[pagbank-manage-subscription] Função iniciada");

async function pagbankRequest(path: string, method: string, body?: object) {
  if (!PAGBANK_TOKEN) {
    throw new Error("PAGBANK_TOKEN não configurado nos Secrets do Supabase.");
  }

  console.log(`[pagbankRequest] Rota: ${method} ${path}`);

  const res = await fetch(`${PAGBANK_BASE_URL}${path}`, {
    method,
    headers: {
      "Authorization": `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json;charset=UTF-8",
      "Accept": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  console.log(`[pagbankRequest] status: ${res.status}`);
  
  if (!res.ok) {
    console.error(`[pagbankRequest] API Error Body: ${text}`);
    let errorData;
    try {
      errorData = JSON.parse(text);
    } catch (_) {
      errorData = { message: text };
    }
    const msg = errorData?.error_messages?.[0]?.description ?? errorData?.message ?? "Erro desconhecido no PagBank";
    throw new Error(`[PagBank Erro]: ${msg}`);
  }

  if (text) {
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error(`[pagbankRequest] Erro ao processar JSON: ${text}`);
      return { ok: true };
    }
  }
  return { ok: true };
}

interface ManageSubscriptionBody {
  action: "cancel" | "pause" | "reactivate" | "CANCEL" | "PAUSE" | "REACTIVATE";
  subscription_id: string;
  reason?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader) {
      throw new Error("Não autorizado (Auth header missing)");
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Verify user by token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      throw new Error("Não foi possível autenticar o usuário.");
    }

    const body: ManageSubscriptionBody = await req.json();
    const action = body.action.toLowerCase();

    console.log(`[Manage] Ação: ${action} | SubID: ${body.subscription_id} | User: ${user.id}`);

    // Verify subscription belongs to user
    const { data: subscription, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .select("*, plan:plans(*)")
      .eq("id", body.subscription_id)
      .eq("user_id", user.id)
      .single();

    if (subError || !subscription) {
      throw new Error("Assinatura não encontrada ou não pertence ao usuário.");
    }

    let newStatus: string;
    if (action === "cancel") {
      newStatus = "CANCELLED";
      
      // If there's a PagBank subscription ID, try to cancel it there too
      if (subscription.pagbank_subscription_id) {
        try {
          console.log(`[Manage] Cancelando no PagBank: ${subscription.pagbank_subscription_id}`);
          // Note: PagBank subscription cancellation endpoint varies. 
          // Usually it's POST /subscriptions/{id}/cancel
          await pagbankRequest(`/subscriptions/${subscription.pagbank_subscription_id}/cancel`, "POST");
        } catch (pbError) {
          console.error("[Manage] Erro ao cancelar no PagBank (mas continuaremos com o cancelamento local):", pbError);
        }
      }
    } else if (action === "pause") {
      newStatus = "SUSPENDED";
    } else if (action === "reactivate") {
      newStatus = "ACTIVE";
    } else {
      throw new Error("Ação inválida");
    }

    const updateData: any = { 
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("subscriptions")
      .update(updateData)
      .eq("id", body.subscription_id)
      .select()
      .single();

    if (updateError) {
      throw new Error("Erro ao atualizar status no banco de dados.");
    }

    return new Response(JSON.stringify({
      ok: true,
      message: `Assinatura ${action === "cancel" ? "cancelada" : action === "pause" ? "pausada" : "reativada"} com sucesso.`,
      subscription: updated,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Manage] Erro:", err.message);
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 400,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }
});
