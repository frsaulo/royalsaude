import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import {
  formatCurrency,
  cancelSubscription,
  type Payment,
} from "../lib/pagbank";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Crown,
  CreditCard,
  QrCode,
  FileText,
  Calendar,
  Users,
  ChevronLeft,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE: { label: "Ativa", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  PENDING: { label: "Pendente", color: "bg-[#2566af]/10 text-[#2566af] border-[#2566af]/20", icon: Clock },
  SUSPENDED: { label: "Suspensa", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  CANCELLED: { label: "Cancelada", color: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
  EXPIRED: { label: "Expirada", color: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
};

const paymentMethodIcon: Record<string, any> = {
  CREDIT_CARD: CreditCard,
  PIX: QrCode,
  BOLETO: FileText,
};

const paymentMethodLabel: Record<string, string> = {
  CREDIT_CARD: "Cartão de Crédito",
  PIX: "PIX",
  BOLETO: "Boleto",
};

const paymentStatusBadge: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Pendente", className: "bg-[#2566af]/10 text-[#2566af]" },
  PAID: { label: "Pago", className: "bg-green-100 text-green-700" },
  FAILED: { label: "Falhou", className: "bg-red-100 text-red-700" },
  REFUNDED: { label: "Reembolsado", className: "bg-slate-100 text-slate-600" },
};

export const MinhaAssinatura = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { subscription, payments, loading, refresh, hasSubscription } = useSubscription();
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!subscription) return;
    setCancelling(true);
    try {
      await cancelSubscription(subscription.id);
      toast.success("Assinatura cancelada com sucesso.");
      refresh();
    } catch (err: any) {
      toast.error("Erro ao cancelar: " + (err.message || "tente novamente"));
    } finally {
      setCancelling(false);
      setShowCancelDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  const status = subscription ? statusConfig[subscription.status] || statusConfig.PENDING : null;
  const plan = subscription?.plan;
  const MethodIcon = subscription?.payment_method
    ? paymentMethodIcon[subscription.payment_method]
    : CreditCard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => navigate("/agenda")}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar</span>
          </button>
          <div className="font-bold text-[#1E3A8A] text-xl font-royalmed">RoyalMed Health</div>
          <div className="w-20" />
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8 space-y-8">
        <h1 className="text-2xl font-bold text-slate-900 font-cinzel">Minha Assinatura</h1>

        {!hasSubscription ? (
          /* No subscription */
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 text-center space-y-6">
              <div className="h-20 w-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <Crown className="h-10 w-10 text-slate-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-800">Você ainda não tem uma assinatura</h2>
                <p className="text-slate-600 mt-2">
                  Assine um plano para ter acesso completo a consultas e telemedicina.
                </p>
              </div>
              <Button
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
                onClick={() => navigate("/planos")}
              >
                <Crown className="h-4 w-4 mr-2" />
                Ver Planos
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Subscription Card */}
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Crown className="h-8 w-8 text-[#2566af]" />
                    <div>
                      <h2 className="text-xl font-bold font-cinzel">
                        Plano {plan?.name || "Royal"}
                      </h2>
                      <p className="text-blue-200 text-sm">
                        {plan?.interval_type === "YEARLY" ? "Assinatura Anual" : "Assinatura Mensal"}
                      </p>
                    </div>
                  </div>
                  {status && (
                    <Badge className={`${status.color} border font-semibold px-3 py-1`}>
                      <status.icon className="h-3.5 w-3.5 mr-1.5" />
                      {status.label}
                    </Badge>
                  )}
                </div>
              </div>

              <CardContent className="p-6 space-y-6">
                <div className="grid sm:grid-cols-3 gap-6">
                  {/* Monthly Amount */}
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Valor Mensal</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {subscription?.monthly_total_cents
                        ? formatCurrency(subscription.monthly_total_cents)
                        : "—"}
                    </p>
                  </div>

                  {/* Payment Method */}
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Pagamento</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <MethodIcon className="h-5 w-5 text-[#1E3A8A]" />
                      <span className="font-semibold text-slate-800">
                        {subscription?.payment_method
                          ? paymentMethodLabel[subscription.payment_method]
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Next Billing */}
                  <div className="text-center sm:text-left">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Próx. Cobrança</p>
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <Calendar className="h-5 w-5 text-[#1E3A8A]" />
                      <span className="font-semibold text-slate-800">
                        {subscription?.current_period_end
                          ? format(new Date(subscription.current_period_end), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Dependents Info */}
                {(subscription?.extra_dependents_count || 0) > 0 && (
                  <div className="flex items-center gap-3 p-4 bg-[#2566af]/10 rounded-xl">
                    <Users className="h-5 w-5 text-[#2566af]" />
                    <div>
                      <p className="font-semibold text-[#2566af] text-sm">
                        {subscription!.extra_dependents_count} dependente(s) extra(s)
                      </p>
                      <p className="text-xs text-[#2566af]">
                        Custo adicional de {formatCurrency(subscription!.extra_dependents_count * 2490)}/mês
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-2">
                  <Button variant="outline" onClick={() => navigate("/planos")}>
                    Mudar Plano
                  </Button>
                  {subscription?.status !== "CANCELLED" && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => setShowCancelDialog(true)}
                    >
                      Cancelar Assinatura
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment History */}
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-[#1E3A8A]" />
                  Histórico de Pagamentos
                </CardTitle>
                <CardDescription>
                  {payments.length} pagamento(s) registrado(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum pagamento registrado.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {payments.map((payment: Payment) => {
                      const pStatus = paymentStatusBadge[payment.status] || paymentStatusBadge.PENDING;
                      const PMethodIcon = payment.payment_method
                        ? paymentMethodIcon[payment.payment_method] || CreditCard
                        : CreditCard;
                      return (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-4 border rounded-xl hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                              <PMethodIcon className="h-5 w-5 text-slate-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm text-slate-800">
                                {payment.description || payment.type}
                              </p>
                              <p className="text-xs text-slate-500">
                                {format(new Date(payment.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="font-bold text-slate-900">
                              {formatCurrency(payment.amount_cents)}
                            </span>
                            <Badge className={`${pStatus.className} border-none text-[10px]`}>
                              {pStatus.label}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>

      {/* Cancel Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Cancelar Assinatura
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos
              benefícios do plano ao final do período atual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Sim, Cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
