import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchUserSubscription,
  fetchPlans,
  fetchUserPayments,
  type Subscription,
  type Plan,
  type Payment,
} from "../lib/pagbank";

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [sub, plansList, paymentsList] = await Promise.all([
        fetchUserSubscription(user.id),
        fetchPlans(),
        fetchUserPayments(user.id),
      ]);

      setSubscription(sub);
      setPlans(plansList);
      setPayments(paymentsList);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados da assinatura");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isActive = subscription?.status === "ACTIVE";
  const isPending = subscription?.status === "PENDING";
  const hasSubscription = !!subscription && subscription.status !== "CANCELLED";

  return {
    subscription,
    plans,
    payments,
    loading,
    error,
    isActive,
    isPending,
    hasSubscription,
    refresh: loadData,
  };
};
