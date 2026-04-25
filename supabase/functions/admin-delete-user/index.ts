
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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

    console.log(`[AdminDelete] Request from: ${requester.email} (${requester.id})`);

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

    const { userId } = await req.json();
    if (!userId) throw new Error("User ID is required");

    console.log(`[AdminDelete] Deleting user: ${userId}`);

    // Step 1: Delete from profiles first (avoids FK constraint issues)
    const { error: profileErr } = await adminClient
      .from("profiles")
      .delete()
      .eq("id", userId);

    if (profileErr) {
      console.warn(`[AdminDelete] Profile delete warning: ${profileErr.message}`);
    }

    // Step 2: Delete related subscriptions and payments
    await adminClient.from("subscriptions").delete().eq("user_id", userId);
    await adminClient.from("payments").delete().eq("user_id", userId);

    // Step 3: Delete from auth.users via Admin API
    const { error: authDeleteErr } = await adminClient.auth.admin.deleteUser(userId);

    if (authDeleteErr) {
      console.error(`[AdminDelete] Auth API delete failed: ${authDeleteErr.message}`);
      
      // Step 3b: SQL fallback — force delete from auth schema directly
      const { error: sqlErr } = await adminClient.rpc("admin_force_delete_user", {
        target_user_id: userId,
      });

      if (sqlErr) {
        console.error(`[AdminDelete] SQL fallback also failed: ${sqlErr.message}`);
        throw new Error(`Could not delete from Auth: ${authDeleteErr.message}`);
      }
      console.log("[AdminDelete] Deleted via SQL fallback.");
    }

    console.log(`[AdminDelete] User ${userId} deleted successfully.`);

    return new Response(
      JSON.stringify({ success: true, message: "Usuário excluído com sucesso" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error: any) {
    console.error("[AdminDelete] Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
