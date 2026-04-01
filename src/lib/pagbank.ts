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
  userId: string;
  planId: string;
  paymentMethod: PaymentMethod;
  extraDependentsCount: number;
  monthlyTotalCents: number;
}): Promise<Subscription> => {
  const now = new Date();
  const periodEnd = new Date(now);

  // Buscar plano para determinar período
  const { data: plan } = await supabase
    .from("plans")
    .select("interval_type")
    .eq("id", params.planId)
    .single();

  if (plan?.interval_type === "YEARLY") {
    periodEnd.setFullYear(periodEnd.getFullYear() + 1);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: params.userId,
      plan_id: params.planId,
      payment_method: params.paymentMethod,
      status: "PENDING",
      extra_dependents_count: params.extraDependentsCount,
      monthly_total_cents: params.monthlyTotalCents,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
    })
    .select("*, plan:plans(*)")
    .single();

  if (error) throw error;
  return data;
};

export const cancelSubscription = async (subscriptionId: string): Promise<void> => {
  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "CANCELLED" })
    .eq("id", subscriptionId);

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
