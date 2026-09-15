import { supabase } from "./supabase";

export interface AdminActor {
  id: string;
  name: string;
  email: string;
}

export interface AuditLogPayload {
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, any>;
}

let cachedAdmin: AdminActor | null = null;

export async function getCurrentAdmin(): Promise<AdminActor | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    if (cachedAdmin && cachedAdmin.id === session.user.id) {
      return cachedAdmin;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", session.user.id)
      .maybeSingle();

    const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Administrador";
    const email = profile?.email || session.user.email || "";

    cachedAdmin = {
      id: session.user.id,
      name,
      email,
    };

    return cachedAdmin;
  } catch (err) {
    console.warn("Erro ao buscar admin atual:", err);
    return null;
  }
}

export async function logAuditEvent(payload: AuditLogPayload): Promise<void> {
  try {
    const admin = await getCurrentAdmin();

    const { error } = await supabase.from("audit_logs").insert({
      actor_id: admin?.id || null,
      actor_name: admin?.name || "Sistema / Desconhecido",
      actor_email: admin?.email || "",
      action: payload.action,
      target_type: payload.targetType,
      target_id: payload.targetId || null,
      target_name: payload.targetName || null,
      details: payload.details || {},
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("Falha ao registrar log de auditoria:", error.message);
    }
  } catch (err) {
    console.warn("Exceção ao gravar auditoria:", err);
  }
}
