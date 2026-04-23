import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../hooks/useSubscription";
import {
  fetchPlans,
  formatCurrency,
  calculateMonthlyPrice,
  calculateMonthlyWithDependents,
  calculateTotalWithDependents,
  getDiscountPercentage,
  type Plan,
} from "../lib/pagbank";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Slider } from "../components/ui/slider";
import {
  Crown,
  Check,
  ArrowRight,
  Users,
  Stethoscope,
  Shield,
  Sparkles,
  ChevronLeft,
  Loader2,
  Star,
} from "lucide-react";

export const Planos = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasSubscription, isActive } = useSubscription();
  const [searchParams] = useSearchParams();
  const isEmbed = searchParams.get("embed") === "true";
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [dependentsCount, setDependentsCount] = useState(0);
  const [realDependentsCount, setRealDependentsCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPlans();
        setPlans(data);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Get real dependents count from profile
  useEffect(() => {
    if (!user) return;
    const loadProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("dependents")
        .eq("id", user.id)
        .single();
      if (data?.dependents) {
        const deps = Array.isArray(data.dependents) ? data.dependents : [];
        setRealDependentsCount(deps.length);
        setDependentsCount(deps.length);
      }
    };
    loadProfile();
  }, [user]);

  const monthlyPlan = plans.find((p) => p.interval_type === "MONTHLY");
  const yearlyPlan = plans.find((p) => p.interval_type === "YEARLY");
  const discount = monthlyPlan && yearlyPlan ? getDiscountPercentage(monthlyPlan, yearlyPlan) : 10;

  const features = [
    { icon: Stethoscope, text: "Consultas presenciais e telemedicina" },
    { icon: Users, text: `Até 3 dependentes gratuitos` },
    { icon: Shield, text: "Acesso completo à plataforma" },
    { icon: Sparkles, text: "Agendamento prioritário" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  if (isActive) {
    navigate("/minha-assinatura");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-[#dde400]/5">
      {/* Header */}
      {!isEmbed && (
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-10">
          <div className="container mx-auto max-w-6xl px-4 h-16 flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Voltar</span>
            </button>
            <div className="font-bold text-[#1E3A8A] text-xl font-royalmed">RoyalMed Health</div>
            <div className="w-20" />
          </div>
        </header>
      )}

      <main className="container mx-auto max-w-5xl px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#dde400]/10 text-[#dde400] px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <Crown className="h-4 w-4" />
            Planos RoyalMed Health
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-cinzel mb-4">
            Planos
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-2">
            Informações sobre planos e pacotes
          </p>
          <p className="text-lg text-slate-800 font-semibold max-w-2xl mx-auto mb-8">
            (67) 9142-7016
          </p>
        </div>

        {/* Dependents Calculator */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-[#1E3A8A]" />
                  <span className="font-semibold text-slate-800">Dependentes</span>
                </div>
                <Badge
                  variant="outline"
                  className={`font-bold ${
                    dependentsCount > 3
                      ? "text-[#dde400] border-[#dde400]/30 bg-[#dde400]/10"
                      : "text-green-600 border-green-300 bg-green-50"
                  }`}
                >
                  {dependentsCount <= 3 ? "Grátis" : `+${formatCurrency((dependentsCount - 3) * 2490)}/mês`}
                </Badge>
              </div>
              <Slider
                value={[dependentsCount]}
                onValueChange={(v) => setDependentsCount(v[0])}
                max={10}
                min={0}
                step={1}
                className="mb-3"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>0</span>
                <span className="font-medium text-slate-700">{dependentsCount} dependente(s)</span>
                <span>10</span>
              </div>
              {dependentsCount > 3 && (
                <p className="text-xs text-[#dde400] mt-3 bg-[#dde400]/10 rounded-lg px-3 py-2">
                  ⚠️ A partir do 4º dependente, cada um custa{" "}
                  <strong>{formatCurrency(2490)}/mês</strong> adicional.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          {monthlyPlan && (
            <Card className="relative border-2 border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white overflow-hidden group">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-cinzel text-slate-800">Mensal</CardTitle>
                <CardDescription>Flexibilidade sem compromisso longo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <a 
                    href="https://pag.ae/81HWCZXnM" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group/price transition-colors cursor-pointer inline-block"
                    title="Pagar mensalidade base diretamente no PagBank"
                  >
                    <div className="flex items-baseline gap-1 group-hover/price:text-[#1E3A8A]">
                      <span className="text-4xl font-bold text-slate-900 transition-colors group-hover/price:text-[#1E3A8A]">
                        {formatCurrency(calculateMonthlyWithDependents(monthlyPlan, dependentsCount))}
                      </span>
                      <span className="text-slate-500">/mês</span>
                    </div>
                  </a>
                  {dependentsCount > 3 && (
                    <p className="text-xs text-slate-500 mt-1">
                      Base {formatCurrency(monthlyPlan.price_cents)} + {dependentsCount - 3} dep. extra(s)
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      {f.text}
                    </div>
                  ))}
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    </div>
                    Consulta avulsa: {formatCurrency(monthlyPlan.consultation_price_cents)}
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold bg-slate-800 hover:bg-slate-900"
                  onClick={() => window.open("https://pag.ae/81HWCZXnM", "_blank")}
                >
                  Assinar Mensal
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Yearly Plan */}
          {yearlyPlan && (
            <Card className="relative border-2 border-[#dde400] shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 bg-gradient-to-br from-white to-[#dde400]/5 overflow-hidden group">
              {/* Best Value Badge */}
              <div className="absolute top-0 right-0">
                <div className="bg-[#dde400] text-[#092952] text-xs font-bold px-4 py-1.5 rounded-bl-xl flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  MELHOR CUSTO
                </div>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-cinzel text-slate-800">Anual</CardTitle>
                <CardDescription>
                  Economize{" "}
                  <span className="text-[#dde400] font-bold">{discount}%</span>{" "}
                  com o plano anual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <a 
                    href="https://pag.ae/81HWE8wVs" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group/price transition-colors cursor-pointer inline-block"
                    title="Pagar anuidade base diretamente no PagBank"
                  >
                    <div className="flex items-baseline gap-1 group-hover/price:text-[#1E3A8A]">
                      <span className="text-4xl font-bold text-slate-900 transition-colors group-hover/price:text-[#1E3A8A]">
                        {formatCurrency(calculateMonthlyWithDependents(yearlyPlan, dependentsCount))}
                      </span>
                      <span className="text-slate-500">/mês</span>
                    </div>
                  </a>
                  <p className="text-sm text-slate-500 mt-1">
                    Total anual:{" "}
                    <strong>{formatCurrency(calculateTotalWithDependents(yearlyPlan, dependentsCount))}</strong>
                  </p>
                  {monthlyPlan && (
                    <p className="text-xs text-green-600 font-semibold mt-1">
                      Economia de{" "}
                      {formatCurrency(
                        calculateTotalWithDependents(monthlyPlan, dependentsCount) * 12 -
                          calculateTotalWithDependents(yearlyPlan, dependentsCount)
                      )}
                      /ano
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  {features.map((f, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                      <div className="h-6 w-6 rounded-full bg-[#dde400]/10 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3.5 w-3.5 text-[#dde400]" />
                      </div>
                      {f.text}
                    </div>
                  ))}
                  <div className="flex items-center gap-3 text-sm text-slate-700">
                    <div className="h-6 w-6 rounded-full bg-[#dde400]/10 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3.5 w-3.5 text-[#dde400]" />
                    </div>
                    Consulta avulsa: {formatCurrency(yearlyPlan.consultation_price_cents)}
                  </div>
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold bg-[#dde400] hover:bg-[#c9d000] text-[#092952] shadow-lg shadow-[#dde400]/20"
                  onClick={() => window.open("https://pag.ae/81HWE8wVs", "_blank")}
                >
                  <Crown className="h-4 w-4 mr-2" />
                  Assinar Anual
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Consultation Info */}
        <div className="max-w-4xl mx-auto mt-12">
          <Card className="border-none bg-[#1E3A8A]/5 shadow-none">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-[#1E3A8A]/10 flex items-center justify-center flex-shrink-0">
                <Stethoscope className="h-6 w-6 text-[#1E3A8A]" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">Consultas Avulsas</p>
                <p className="text-sm text-slate-600">
                  Cada consulta tem um custo adicional de{" "}
                  <strong className="text-[#1E3A8A]">R$ 69,90</strong>, cobrado
                  no momento do agendamento. Aceitos: PIX, Boleto e Cartão.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
