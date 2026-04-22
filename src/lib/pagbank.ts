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

const PAGBANK_API_URL = "https://api.pagseguro.com";
const PAGBANK_TOKEN   = import.meta.env.VITE_PAGBANK_TOKEN ?? "";

async function pagbankFetch(path: string, body: object) {
  const res = await fetch(`${PAGBANK_API_URL}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAGBANK_TOKEN}`,
      "Content-Type": "application/json;charset=UTF-8",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error_messages?.[0]?.description ?? data?.message ?? "Erro no PagBank";
    throw new Error(msg);
  }
  return data;
}

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
  const cleanCpf = params.customer.tax_id.replace(/\D/g, "");
  const refId = `royalmed_${Date.now()}`;

  let pagbankResult: any;

  // ── PIX ──────────────────────────────────────────────
  if (params.paymentMethod === "PIX") {
    const result = await pagbankFetch("/orders", {
      reference_id: refId,
      customer: { name: params.customer.name, email: params.customer.email, tax_id: cleanCpf },
      items: [{ reference_id: params.planId, name: "Plano RoyalMed Health", quantity: 1, unit_amount: params.totalCents }],
      qr_codes: [{ amount: { value: params.totalCents }, expiration_date: new Date(Date.now() + 30 * 60 * 1000).toISOString() }],
    });
    const qrCode = result.qr_codes?.[0];
    pagbankResult = {
      order_id: result.id,
      pix: {
        qr_code: qrCode?.text,
        qr_code_image: qrCode?.links?.find((l: any) => l.media === "image/png")?.href,
        expiration: qrCode?.expiration_date,
      },
    };

  // ── BOLETO ──────────────────────────────────────────
  } else if (params.paymentMethod === "BOLETO") {
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const result = await pagbankFetch("/orders", {
      reference_id: refId,
      customer: { name: params.customer.name, email: params.customer.email, tax_id: cleanCpf },
      items: [{ reference_id: params.planId, name: "Plano RoyalMed Health", quantity: 1, unit_amount: params.totalCents }],
      charges: [{
        reference_id: `charge_${Date.now()}`,
        description: "Assinatura RoyalMed Health",
        amount: { value: params.totalCents, currency: "BRL" },
        payment_method: {
          type: "BOLETO",
          boleto: {
            due_date: dueDate,
            instruction_lines: { line_1: "Pagamento processado pela RoyalMed Health", line_2: "Nao receber apos o vencimento" },
            holder: { name: params.customer.name, tax_id: cleanCpf, email: params.customer.email,
              address: { country: "Brasil", region: "SP", region_code: "SP", city: "Sao Paulo", postal_code: "01310100", street: "Avenida Paulista", number: "1", locality: "Centro" },
            },
          },
        },
      }],
    });
    const charge = result.charges?.[0];
    const boleto = charge?.payment_method?.boleto;
    pagbankResult = {
      order_id: result.id,
      charge_id: charge?.id,
      boleto: {
        barcode: boleto?.barcode,
        formatted_barcode: boleto?.formatted_barcode,
        due_date: boleto?.due_date,
        pdf_link: charge?.links?.find((l: any) => l.media === "application/pdf")?.href,
      },
    };

  // ── CARTÃO ──────────────────────────────────────────
  } else if (params.paymentMethod === "CREDIT_CARD") {
    const result = await pagbankFetch("/orders", {
      reference_id: refId,
      customer: { name: params.customer.name, email: params.customer.email, tax_id: cleanCpf },
      items: [{ reference_id: params.planId, name: "Plano RoyalMed Health", quantity: 1, unit_amount: params.totalCents }],
      charges: [{
        reference_id: `charge_${Date.now()}`,
        description: "Assinatura RoyalMed Health",
        amount: { value: params.totalCents, currency: "BRL" },
        payment_method: {
          type: "CREDIT_CARD",
          installments: 1,
          capture: true,
          card: {
            encrypted: params.card!.encrypted,
            security_code: params.card!.security_code,
            holder: { name: params.card!.holder_name },
            store: false,
          },
        },
      }],
    });
    const charge = result.charges?.[0];
    pagbankResult = {
      order_id: result.id,
      charge_id: charge?.id,
      card_status: charge?.status,
    };

  } else {
    throw new Error(`Método de pagamento inválido: ${params.paymentMethod}`);
  }

  // ── SALVAR NO SUPABASE via função leve (sem bloqueio) ──
  const { data, error } = await supabase.functions.invoke("pagbank-save-order", {
    body: {
      plan_id: params.planId,
      payment_method: params.paymentMethod,
      extra_dependents: params.extraDependentsCount,
      total_cents: params.totalCents,
      ...pagbankResult,
    },
  });

  if (error) throw error;
  return data;
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
