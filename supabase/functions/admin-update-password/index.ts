import { createClient } from "@supabase/supabase-js";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

    // Client for verifying the requester's identity (uses their JWT)
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    });

    // Admin client with full permissions (service role)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing Authorization header");

    // Verify requester identity
    const {
      data: { user: requester },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !requester) {
      throw new Error("Unauthorized: Could not verify requester");
    }

    console.log(`[AdminUpdatePassword] Request from: ${requester.email} (${requester.id})`);

    // Check admin flag in profiles table
    const { data: adminData, error: adminError } = await adminClient
      .from("profiles")
      .select("is_admin")
      .eq("id", requester.id)
      .maybeSingle();

    if (adminError) throw new Error("Internal Server Error checking permissions");
    if (!adminData || !adminData.is_admin) {
      throw new Error("Forbidden: Requester is not an admin");
    }

    const { userId, newPassword } = await req.json();
    if (!userId) throw new Error("User ID is required");
    if (!newPassword || newPassword.length < 6) throw new Error("A senha deve ter no mínimo 6 caracteres.");

    console.log(`[AdminUpdatePassword] Updating password for user: ${userId}`);

    // Update password via Auth Admin API
    const { error: authUpdateErr } = await adminClient.auth.admin.updateUserById(userId, {
      password: newPassword,
    });

    if (authUpdateErr) {
      console.error(`[AdminUpdatePassword] Auth API update failed: ${authUpdateErr.message}`);
      throw new Error(`Erro ao atualizar senha no Auth: ${authUpdateErr.message}`);
    }

    console.log(`[AdminUpdatePassword] Password for user ${userId} updated successfully.`);

    return new Response(
      JSON.stringify({ success: true, message: "Senha atualizada com sucesso!" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AdminUpdatePassword] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
