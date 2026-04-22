import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  fetchPlans,
  formatCurrency,
  calculateMonthlyWithDependents,
  calculateTotalWithDependents,
  createSubscription,
  type Plan,
  type PaymentMethod,
} from "../lib/pagbank";
import { supabase } from "../lib/supabase";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ChevronLeft,
  CreditCard,
  QrCode,
  FileText,
  Loader2,
  Lock,
  Check,
  Copy,
  Crown,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

// Tipos do SDK PagBank injetado via script
declare global {
  interface Window {
    PagSeguro: {
      encryptCard: (params: {
        publicKey: string;
        holder: string;
        number: string;
        expMonth: string;
        expYear: string;
        securityCode: string;
      }) => { encryptedCard: string; hasErrors: boolean; errors: any[] };
    };
  }
}

const PAGBANK_PUBLIC_KEY = import.meta.env.VITE_PAGBANK_PUBLIC_KEY ?? "";

function formatCpf(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length > 2) return digits.slice(0, 2) + "/" + digits.slice(2);
  return digits;
}

export const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { planId, dependentsCount = 0 } = (location.state as any) || {};

  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  // Customer info
  const [customerName, setCustomerName] = useState("");
  const [customerTaxId, setCustomerTaxId] = useState("");

  // Credit card form
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  // Payment data from API
  const [paymentData, setPaymentData] = useState<any>(null);

  // Carregar SDK PagBank
  useEffect(() => {
    const existingScript = document.getElementById("pagbank-sdk");
    if (existingScript) { setSdkReady(true); return; }

    const script = document.createElement("script");
    script.id = "pagbank-sdk";
    script.src = "https://assets.pagseguro.com.br/checkout-sdk/js/directpayment.min.js";
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => console.warn("SDK PagBank não carregou");
    document.head.appendChild(script);
  }, []);

  // Pré-preencher nome do usuário
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setCustomerName(user.user_metadata.full_name);
    }
  }, [user]);

  useEffect(() => {
    if (!planId) { navigate("/planos"); return; }
    const load = async () => {
      try {
        const data = await fetchPlans();
        const selected = data.find((p) => p.id === planId);
        if (selected) setPlan(selected);
        else navigate("/planos");
      } catch {
        toast.error("Erro ao carregar plano.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [planId, navigate]);

  const encryptCard = (): string | null => {
    if (!sdkReady || !window.PagSeguro) {
      toast.error("SDK de pagamento não carregado. Aguarde e tente novamente.");
      return null;
    }
    if (!PAGBANK_PUBLIC_KEY) {
      toast.error("Chave pública PagBank não configurada.");
      return null;
    }
    const [expMonth, expYear] = cardExpiry.split("/");
    const result = window.PagSeguro.encryptCard({
      publicKey: PAGBANK_PUBLIC_KEY,
      holder: cardName,
      number: cardNumber.replace(/\D/g, ""),
      expMonth: expMonth ?? "",
      expYear: expYear ? `20${expYear}` : "",
      securityCode: cardCvv,
    });
    if (result.hasErrors) {
      console.error("Erros no cartão:", result.errors);
      toast.error("Dados do cartão inválidos. Verifique e tente novamente.");
      return null;
    }
    return result.encryptedCard;
  };

  const handleSubmit = async () => {
    if (!user || !plan) return;

    const cpfDigits = customerTaxId.replace(/\D/g, "");
    if (cpfDigits.length !== 11) {
      toast.error("CPF inválido. Digite os 11 dígitos.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Informe seu nome completo.");
      return;
    }

    setProcessing(true);
    toast.info("Preparando ambiente de pagamento seguro…");

    try {
      const extraDependents = Math.max(0, dependentsCount - plan.free_dependents);
      const totalCents = calculateTotalWithDependents(plan, dependentsCount);
      const refId = `royalmed_${user.id}_${Date.now()}`;

      // Salva assinatura como PENDING diretamente no banco (sem chamar API PagBank)
      const periodEnd = plan.interval_type === "YEARLY"
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: sub, error: subErr } = await supabase.from("subscriptions").upsert({
        user_id:                 user.id,
        plan_id:                 plan.id,
        pagbank_subscription_id: refId,
        status:                  "PENDING",
        payment_method:          null,
        current_period_start:    new Date().toISOString(),
        current_period_end:      periodEnd,
        extra_dependents_count:  extraDependents,
        monthly_total_cents:     totalCents,
        updated_at:              new Date().toISOString(),
      }, { onConflict: "user_id" }).select().single();

      if (subErr) throw new Error("Erro ao registrar pedido: " + subErr.message);

      if (sub) {
        await supabase.from("payments").insert({
          user_id:           user.id,
          subscription_id:   sub.id,
          type:              "SUBSCRIPTION",
          amount_cents:      totalCents,
          status:            "PENDING",
          payment_method:    null,
          pagbank_charge_id: refId,
          description:       `Assinatura Plano ${plan.name}`,
        });
      }

      // Links de pagamento criados no painel do PagBank (Link de Pagamento)
      // ATENÇÃO: substitua LINK_MENSAL e LINK_ANUAL pelos códigos reais
      const PAGBANK_LINKS: Record<string, string> = {
        "eb626bd1-89d1-4900-855e-6b967aa74d37": "https://pagseguro.uol.com.br/c/LINK_MENSAL",
        "adb5469f-2ff6-414d-87d4-fb450563f1d2": "https://pagseguro.uol.com.br/c/LINK_ANUAL",
      };

      const paymentUrl = PAGBANK_LINKS[plan.id];

      if (!paymentUrl || paymentUrl.includes("LINK_")) {
        // Links ainda não configurados — redireciona para área da assinatura
        toast.success("Pedido registrado! Entre em contato para concluir o pagamento.");
        setTimeout(() => navigate("/minha-assinatura"), 2000);
        return;
      }

      toast.success("Redirecionando para o PagBank…");
      window.location.href = `${paymentUrl}?ref=${refId}`;
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "tente novamente."));
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  // ─── TELA DE SUCESSO ──────────────────────────────────────────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/30 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-none shadow-2xl">
          <CardContent className="p-8 text-center space-y-6">
            <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Check className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-cinzel">Pedido Recebido!</h2>
              <p className="text-slate-600 mt-2">
                Sua adesão ao plano <strong>{plan?.name}</strong> está sendo processada.
              </p>

              {/* PIX QR Code */}
              {paymentMethod === "PIX" && paymentData?.pix && (
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col items-center gap-4">
                  <p className="text-sm font-bold text-[#1E3A8A] uppercase tracking-wider">Escaneie o QR Code PIX</p>
                  {paymentData.pix.qr_code_image && (
                    <div className="bg-white p-4 rounded-xl shadow-md">
                      <img src={paymentData.pix.qr_code_image} alt="QR Code PIX" className="h-48 w-48" />
                    </div>
                  )}
                  <div className="w-full space-y-2">
                    <p className="text-xs text-slate-500 text-center font-medium">Copia e Cola:</p>
                    <div className="flex gap-2">
                      <Input readOnly value={paymentData.pix.qr_code ?? ""} className="text-xs font-mono bg-white h-10" />
                      <Button size="icon" variant="outline" onClick={() => {
                        navigator.clipboard.writeText(paymentData.pix.qr_code);
                        toast.success("Código PIX copiado!");
                      }}>
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">⏱ QR Code válido por 30 minutos</p>
                </div>
              )}

              {/* Boleto */}
              {paymentMethod === "BOLETO" && paymentData?.boleto && (
                <div className="mt-6 p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                  <p className="text-sm font-bold text-[#1E3A8A] text-center uppercase tracking-wider">Boleto Gerado</p>
                  <div className="flex flex-col gap-3">
                    {paymentData.boleto.pdf_link && (
                      <Button className="w-full bg-[#1E3A8A]" asChild>
                        <a href={paymentData.boleto.pdf_link} target="_blank" rel="noopener noreferrer">
                          <FileText className="h-4 w-4 mr-2" />
                          Baixar PDF do Boleto
                        </a>
                      </Button>
                    )}
                    {paymentData.boleto.formatted_barcode && (
                      <div className="space-y-1">
                        <p className="text-xs text-slate-500 font-medium">Linha Digitável:</p>
                        <div className="flex gap-2">
                          <Input readOnly value={paymentData.boleto.formatted_barcode} className="text-xs font-mono h-10 bg-white" />
                          <Button size="icon" variant="outline" onClick={() => {
                            navigator.clipboard.writeText(paymentData.boleto.formatted_barcode);
                            toast.success("Código copiado!");
                          }}>
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 text-center">
                    Vencimento: {paymentData.boleto.due_date} · Compensação em até 3 dias úteis.
                  </p>
                </div>
              )}

              {/* Cartão aprovado */}
              {paymentMethod === "CREDIT_CARD" && (
                <div className="mt-6 p-4 bg-green-50 rounded-xl flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600 shrink-0" />
                  <p className="text-sm text-green-800 text-left">
                    Assinatura ativada! A cobrança recorrente será feita automaticamente pelo PagBank.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <Button className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90" onClick={() => navigate("/minha-assinatura")}>
                Ver Minha Assinatura
              </Button>
              <Button variant="outline" onClick={() => navigate("/agenda")}>
                Ir para Agenda
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!plan) return null;

  const totalAmount = calculateTotalWithDependents(plan, dependentsCount);
  const monthlyAmount = calculateMonthlyWithDependents(plan, dependentsCount);
  const extraDeps = Math.max(0, dependentsCount - plan.free_dependents);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-slate-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <button onClick={() => navigate("/planos")} className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors">
            <ChevronLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Voltar aos Planos</span>
          </button>
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Lock className="h-4 w-4" />
            Pagamento Seguro · PagBank
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid md:grid-cols-5 gap-8">
          {/* Form */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 font-cinzel">Finalizar Assinatura</h1>
              <p className="text-slate-600 mt-1">Processamento seguro via PagBank</p>
            </div>

            {/* Dados do titular */}
            <Card className="border-none shadow-md overflow-hidden bg-white">
              <CardContent className="p-6 space-y-4">
                <h2 className="font-semibold text-slate-800">Dados do Titular</h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="custName">Nome Completo</Label>
                    <Input
                      id="custName"
                      placeholder="Nome do titular"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="taxId">CPF <span className="text-red-500">*</span></Label>
                    <Input
                      id="taxId"
                      placeholder="000.000.000-00"
                      value={customerTaxId}
                      onChange={(e) => setCustomerTaxId(formatCpf(e.target.value))}
                      maxLength={14}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Método de pagamento */}
            <Tabs value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
              <TabsList className="grid w-full grid-cols-3 h-12 bg-white border shadow-sm">
                <TabsTrigger value="PIX" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold">
                  <QrCode className="h-4 w-4" />PIX
                </TabsTrigger>
                <TabsTrigger value="BOLETO" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold">
                  <FileText className="h-4 w-4" />Boleto
                </TabsTrigger>
                <TabsTrigger value="CREDIT_CARD" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold">
                  <CreditCard className="h-4 w-4" />Cartão
                </TabsTrigger>
              </TabsList>

              {/* PIX */}
              <TabsContent value="PIX">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl">
                      <QrCode className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-semibold text-green-800">Pagamento Instantâneo</p>
                        <p className="text-sm text-green-600">QR Code gerado na hora · Confirmado em segundos</p>
                      </div>
                    </div>
                    <div className="text-center py-6">
                      <div className="inline-flex items-center justify-center h-48 w-48 bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300">
                        <div className="text-center">
                          <QrCode className="h-16 w-16 text-slate-400 mx-auto mb-2" />
                          <p className="text-xs text-slate-500">QR Code gerado após confirmar</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 text-center">
                      ⚠️ Para plano com PIX, a assinatura fica ativa após confirmação do pagamento.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Boleto */}
              <TabsContent value="BOLETO">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl">
                      <FileText className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-semibold text-blue-800">Boleto Bancário</p>
                        <p className="text-sm text-blue-600">Prazo de 3 dias úteis · Vencimento em 3 dias</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                      <p className="text-xs text-amber-700">A assinatura só é ativada após confirmação do pagamento (1–3 dias úteis).</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Cartão */}
              <TabsContent value="CREDIT_CARD">
                <Card className="border-none shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl">
                      <CreditCard className="h-8 w-8 text-indigo-600" />
                      <div>
                        <p className="font-semibold text-indigo-800">Cartão de Crédito</p>
                        <p className="text-sm text-indigo-600">Cobrança recorrente automática · Ativação imediata</p>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="cardNumber">Número do Cartão</Label>
                        <Input
                          id="cardNumber"
                          placeholder="0000 0000 0000 0000"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                          maxLength={19}
                          className="mt-1.5 font-mono"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cardName">Nome no Cartão</Label>
                        <Input
                          id="cardName"
                          placeholder="NOME COMO ESTÁ NO CARTÃO"
                          value={cardName}
                          onChange={(e) => setCardName(e.target.value.toUpperCase())}
                          className="mt-1.5"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cardExpiry">Validade</Label>
                          <Input
                            id="cardExpiry"
                            placeholder="MM/AA"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                            maxLength={5}
                            className="mt-1.5"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cardCvv">CVV</Label>
                          <Input
                            id="cardCvv"
                            placeholder="123"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            maxLength={4}
                            type="password"
                            className="mt-1.5"
                          />
                        </div>
                      </div>
                      {!sdkReady && (
                        <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                          <Loader2 className="h-4 w-4 text-amber-600 animate-spin shrink-0" />
                          <p className="text-xs text-amber-700">Carregando módulo de segurança do cartão…</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Button
              className="w-full h-14 text-lg font-bold bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] hover:from-[#1E3A8A]/90 hover:to-[#2563eb]/90 shadow-lg rounded-xl"
              onClick={handleSubmit}
              disabled={processing}
            >
              {processing ? (
                <><Loader2 className="h-5 w-5 mr-2 animate-spin" />Preparando pagamento…</>
              ) : (
                <><Lock className="h-4 w-4 mr-2" />Ir para Pagamento Seguro — {formatCurrency(totalAmount)}</>
              )}
            </Button>

            <p className="text-center text-xs text-slate-400">
              🔒 Você será redirecionado para o ambiente seguro do PagBank para concluir o pagamento.
            </p>
          </div>

          {/* Resumo */}
          <div className="md:col-span-2">
            <Card className="border-none shadow-lg sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-[#dde400]" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Plano {plan.name}</span>
                    <span className="font-semibold">{formatCurrency(plan.price_cents)}</span>
                  </div>
                  {extraDeps > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">{extraDeps} dependente(s) extra(s)</span>
                      <span className="font-semibold">
                        {plan.interval_type === "YEARLY"
                          ? formatCurrency(extraDeps * plan.extra_dependent_price_cents * 12)
                          : formatCurrency(extraDeps * plan.extra_dependent_price_cents)}
                      </span>
                    </div>
                  )}
                  <div className="border-t pt-3 flex justify-between">
                    <span className="font-bold text-slate-800">Total</span>
                    <div className="text-right">
                      <span className="font-bold text-lg text-[#1E3A8A]">{formatCurrency(totalAmount)}</span>
                      {plan.interval_type === "YEARLY" && (
                        <p className="text-xs text-slate-500">≈ {formatCurrency(monthlyAmount)}/mês</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-green-500" />Cancelamento a qualquer momento
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-green-500" />{plan.free_dependents} dependentes inclusos
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <Check className="h-3 w-3 text-green-500" />Consultas por {formatCurrency(plan.consultation_price_cents)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
                  <Lock className="h-3 w-3" />Seus dados estão protegidos
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};
