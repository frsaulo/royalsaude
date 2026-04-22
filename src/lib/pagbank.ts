import { supabase } from "./supabase";

// ═══════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════

export type PlanInterval = "MONTHLY" | "YEARLY";
export type SubscriptionStatus = "PENDING" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "EXPIRED";
export type PaymentMethod = "CREDIT_CARD" | "BOLETO" | "PIX";
export type PaymentType = "SUBSCRIPTION" | "CONSULTATION" | "DEPENDENT_FEE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  interval_type: PlanInterval;
  interval_value: number;
  free_dependents: number;
  extra_dependent_price_cents: number;
  consultation_price_cents: number;
  pagbank_plan_id: string | null;
  active: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  plan_id: string;
  pagbank_subscription_id: string | null;
  status: SubscriptionStatus;
  payment_method: PaymentMethod | null;
  current_period_start: string | null;
  current_period_end: string | null;
  extra_dependents_count: number;
  monthly_total_cents: number | null;
  created_at: string;
  updated_at: string;
  plan?: Plan;
}

export interface Payment {
  id: string;
  user_id: string;
  subscription_id: string | null;
  type: PaymentType;
  amount_cents: number;
  status: PaymentStatus;
  payment_method: PaymentMethod | null;
  pagbank_charge_id: string | null;
  appointment_id: string | null;
  description: string | null;
  created_at: string;
}

// ═══════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════

export const formatCurrency = (cents: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
};

export const calculateMonthlyPrice = (plan: Plan): number => {
  if (plan.interval_type === "YEARLY") {
    return Math.round(plan.price_cents / 12);
  }
  return plan.price_cents;
};

export const calculateTotalWithDependents = (
  plan: Plan,
  totalDependents: number
): number => {
  const extraDeps = Math.max(0, totalDependents - plan.free_dependents);
  const extraCost = extraDeps * plan.extra_dependent_price_cents;

  if (plan.interval_type === "YEARLY") {
    return plan.price_cents + extraCost * 12;
  }
  return plan.price_cents + extraCost;
};

export const calculateMonthlyWithDependents = (
  plan: Plan,
  totalDependents: number
): number => {
  const extraDeps = Math.max(0, totalDependents - plan.free_dependents);
  const extraCost = extraDeps * plan.extra_dependent_price_cents;
  return calculateMonthlyPrice(plan) + extraCost;
};

export const getDiscountPercentage = (monthlyPlan: Plan, yearlyPlan: Plan): number => {
  const monthlyTotal = monthlyPlan.price_cents * 12;
  const yearlyTotal = yearlyPlan.price_cents;
  return Math.round(((monthlyTotal - yearlyTotal) / monthlyTotal) * 100);
};

// ═══════════════════════════════════════════════════════
// API Calls (via Supabase)
// ═══════════════════════════════════════════════════════

export const fetchPlans = async (): Promise<Plan[]> => {
  const { data, error } = await supabase
    .from("plans")
    .select("*")
    .eq("active", true)
    .order("price_cents", { ascending: true });

  if (error) throw error;
  return data || [];
};

export const fetchUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, plan:plans(*)")
    .eq("user_id", userId)
    .in("status", ["ACTIVE", "PENDING"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const fetchUserPayments = async (userId: string): Promise<Payment[]> => {
  const { data, error } = await supabase
    .from("payments")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};


export const createSubscription = async (params: {
  planId: string;
  paymentMethod: PaymentMethod;
  extraDependentsCount: number;
  totalCents: number;
  customer: {
    name: string;
    email: string;
    tax_id: string;
  };
  card?: {
    encrypted: string;
    holder_name: string;
    security_code?: string;
  };
}): Promise<any> => {
  // Usa fetch direto para ter controle total sobre o response body,
  // incluindo mensagens de erro detalhadas retornadas pela edge function.
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData?.session?.access_token;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const res = await fetch(`${supabaseUrl}/functions/v1/pagbank-save-order`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": supabaseAnonKey,
      "Authorization": `Bearer ${token ?? supabaseAnonKey}`,
    },
    body: JSON.stringify({
      plan_id:          params.planId,
      payment_method:   params.paymentMethod,
      extra_dependents: params.extraDependentsCount,
      total_cents:      params.totalCents,
      customer:         params.customer,
      card:             params.card,
      origin_url:       window.location.origin,
    }),
  });

  const json = await res.json();

  // Propaga a mensagem de erro detalhada do servidor (ex: erro do PagSeguro)
  if (!res.ok || !json?.ok) {
    throw new Error(json?.error ?? `Erro ${res.status} ao processar pagamento.`);
  }

  return json;
};



export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  const { error } = await supabase.functions.invoke("pagbank-manage-subscription", {
    body: {
      subscription_id: subscriptionId,
      action: "CANCEL",
    },
  });

  if (error) throw error;
};

export const createPayment = async (params: {
  userId: string;
  subscriptionId?: string;
  type: PaymentType;
  amountCents: number;
  paymentMethod: PaymentMethod;
  appointmentId?: string;
  description?: string;
}): Promise<Payment> => {
  const { data, error } = await supabase
    .from("payments")
    .insert({
      user_id: params.userId,
      subscription_id: params.subscriptionId || null,
      type: params.type,
      amount_cents: params.amountCents,
      payment_method: params.paymentMethod,
      status: "PENDING",
      appointment_id: params.appointmentId || null,
      description: params.description || null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};
