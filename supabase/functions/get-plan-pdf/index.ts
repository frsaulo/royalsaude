import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Pegamos o corpo da requisição
    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return new Response(
        JSON.stringify({ error: "userId e planId são obrigatórios" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 1. Verificar se o usuário tem o plano ATIVO na tabela 'subscriptions'
    const { data: subscription, error: subError } = await supabaseClient
      .from("subscriptions")
      .select("status")
      .eq("user_id", userId)
      .eq("plan_id", planId)
      .eq("status", "ACTIVE")
      .single();

    if (subError || !subscription) {
      console.error("Erro na assinatura ou não encontrada:", subError);
      return new Response(
        JSON.stringify({ error: "Assinatura ativa não encontrada para este plano" }),
        { status: 403, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Buscar o PDF do Storage (Bucket: 'plans-pdfs')
    // O arquivo deve estar nomeado como '{planId}.pdf'
    const { data: file, error: fileError } = await supabaseClient.storage
      .from("plans-pdfs")
      .download(`${planId}.pdf`);

    if (fileError) {
      console.error("Erro ao baixar PDF:", fileError);
      return new Response(
        JSON.stringify({ error: "Arquivo PDF não encontrado no Storage" }),
        { status: 404, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Retornar o arquivo PDF
    return new Response(file, {
      headers: { 
        ...CORS_HEADERS, 
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="plano-${planId}.pdf"`
      },
    });

  } catch (err) {
    console.error("Erro interno:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno no servidor" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
