import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log(`[AdminCreateUser] Request from: ${requester.email} (${requester.id})`);

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

    const body = await req.json();
    const {
      email,
      password,
      fullName,
      cpf,
      phone,
      birthDate,
      address,
      planId,
      status = "ACTIVE"
    } = body;

    // Basic validations
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new Error("E-mail inválido.");
    }
    if (!password || typeof password !== "string" || password.length < 6) {
      throw new Error("A senha deve conter no mínimo 6 caracteres.");
    }
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      throw new Error("O nome completo é obrigatório.");
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const cleanCpf = cpf ? cpf.trim() : "";
    const cleanPhone = phone ? phone.trim() : "";
    const cleanAddress = address ? address.trim() : "";

    // Check if CPF already exists in profiles
    if (cleanCpf) {
      const { data: existingCpf } = await adminClient
        .from("profiles")
        .select("id, full_name")
        .eq("cpf", cleanCpf)
        .maybeSingle();

      if (existingCpf) {
        throw new Error(`Já existe um usuário cadastrado com este CPF (${existingCpf.full_name}).`);
      }
    }

    console.log(`[AdminCreateUser] Creating user in Auth: ${cleanEmail}`);

    // Create user in Supabase Auth
    const { data: newAuthData, error: createAuthErr } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: cleanFullName,
        cpf: cleanCpf,
        phone: cleanPhone,
      },
    });

    if (createAuthErr) {
      console.error(`[AdminCreateUser] Auth error:`, createAuthErr);
      if (createAuthErr.message.includes("already registered") || createAuthErr.message.includes("already been registered")) {
        throw new Error("Já existe uma conta cadastrada com este e-mail.");
      }
      throw new Error(`Erro ao criar usuário: ${createAuthErr.message}`);
    }

    const newUserId = newAuthData.user.id;
    console.log(`[AdminCreateUser] Created Auth user with ID: ${newUserId}`);

    // Upsert into profiles table
    const { error: profileErr } = await adminClient
      .from("profiles")
      .upsert({
        id: newUserId,
        full_name: cleanFullName,
        cpf: cleanCpf,
        phone: cleanPhone,
        email: cleanEmail,
        address: cleanAddress,
        birth_date: birthDate || null,
        created_at: new Date().toISOString(),
      });

    if (profileErr) {
      console.error(`[AdminCreateUser] Profile upsert error:`, profileErr);
    }

    // Determine plan to attach
    let targetPlanId = planId;
    if (!targetPlanId) {
      const { data: defaultPlan } = await adminClient
        .from("plans")
        .select("id")
        .eq("active", true)
        .order("price_cents", { ascending: true })
        .limit(1)
        .maybeSingle();
      if (defaultPlan) {
        targetPlanId = defaultPlan.id;
      }
    }

    // Create active subscription without requiring payment
    if (targetPlanId) {
      console.log(`[AdminCreateUser] Creating subscription for plan: ${targetPlanId}`);
      const { error: subErr } = await adminClient
        .from("subscriptions")
        .insert({
          user_id: newUserId,
          plan_id: targetPlanId,
          status: status || "ACTIVE",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (subErr) {
        console.error(`[AdminCreateUser] Subscription insert error:`, subErr);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Usuário cadastrado com sucesso!",
        user: {
          id: newUserId,
          email: cleanEmail,
          full_name: cleanFullName,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[AdminCreateUser] Error:", message);
    return new Response(
      JSON.stringify({ error: message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
    );
  }
});
