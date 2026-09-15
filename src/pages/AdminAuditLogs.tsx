import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { getCurrentAdmin, type AdminActor } from "../lib/audit";
import { 
  ShieldCheck, 
  Search, 
  ArrowLeft, 
  Loader2, 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Filter, 
  RotateCcw, 
  Eye, 
  CheckCircle2, 
  Edit, 
  Trash2, 
  KeyRound, 
  Tag, 
  AlertCircle,
  Activity,
  Layers
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../components/ui/dialog";

interface AuditLog {
  id: string;
  created_at: string;
  actor_id: string | null;
  actor_name: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_name: string | null;
  details: Record<string, any>;
}

const actionLabels: Record<string, { label: string; color: string; icon: any }> = {
  CADASTRO_USUARIO: { label: "Novo Usuário", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  EDICAO_USUARIO: { label: "Edição de Usuário", color: "bg-amber-50 text-amber-700 border-amber-200", icon: Edit },
  CADASTRO_DEPENDENTE: { label: "Novo Dependente", color: "bg-teal-50 text-teal-700 border-teal-200", icon: CheckCircle2 },
  EDICAO_DEPENDENTE: { label: "Edição de Dependente", color: "bg-yellow-50 text-yellow-700 border-yellow-200", icon: Edit },
  ALTERACAO_SENHA: { label: "Redefinição de Senha", color: "bg-blue-50 text-blue-700 border-blue-200", icon: KeyRound },
  EXCLUSAO_USUARIO: { label: "Exclusão de Usuário", color: "bg-red-50 text-red-700 border-red-200", icon: Trash2 },
  EXCLUSAO_DEPENDENTE: { label: "Exclusão de Dependente", color: "bg-rose-50 text-rose-700 border-rose-200", icon: Trash2 },
  BLOQUEIO_GLOBAL_AGENDA: { label: "Bloqueio de Agenda", color: "bg-slate-100 text-slate-800 border-slate-300", icon: Calendar },
  EXCLUSAO_BLOQUEIO_AGENDA: { label: "Desbloqueio de Agenda", color: "bg-blue-50 text-blue-700 border-blue-200", icon: Calendar },
  REMARCACAO_CONSULTA: { label: "Remarcação de Consulta", color: "bg-sky-50 text-sky-700 border-sky-200", icon: Clock },
  CANCELAMENTO_CONSULTA: { label: "Cancelamento de Consulta", color: "bg-red-50 text-red-700 border-red-200", icon: AlertCircle },
  CRIACAO_CUPOM: { label: "Criação de Cupom", color: "bg-green-50 text-green-700 border-green-200", icon: Tag },
  EXCLUSAO_CUPOM: { label: "Exclusão de Cupom", color: "bg-red-50 text-red-700 border-red-200", icon: Trash2 },
  ATIVACAO_CUPOM: { label: "Ativação de Cupom", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Tag },
  DESATIVACAO_CUPOM: { label: "Desativação de Cupom", color: "bg-slate-50 text-slate-700 border-slate-200", icon: Tag },
};

const formatDateTime = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

export const AdminAuditLogs = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAdmin, setCurrentAdmin] = useState<AdminActor | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedActor, setSelectedActor] = useState("ALL");
  const [selectedAction, setSelectedAction] = useState("ALL");
  const [selectedPeriod, setSelectedPeriod] = useState("ALL");

  // Modal de Detalhes
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchLogs();
  }, []);

  const checkAdminAndFetchLogs = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/admin");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_admin")
        .eq("id", session.user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        navigate("/admin");
        toast.error("Acesso negado.");
        return;
      }

      const adminName = profile.full_name || session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Administrador";
      setCurrentAdmin({
        id: session.user.id,
        name: adminName,
        email: profile.email || session.user.email || ""
      });

      fetchLogs();
    } catch (error: any) {
      console.error("Erro na verificação de admin:", error);
      navigate("/admin");
    }
  };

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(300);

      if (error) throw error;
      setLogs(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar logs de auditoria: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Extrair lista de atores únicos para o dropdown
  const uniqueActors = Array.from(
    new Set(logs.map(l => l.actor_name || l.actor_email).filter(Boolean))
  );

  // Filtragem dos logs
  const filteredLogs = logs.filter(log => {
    // 1. Busca textual
    const term = searchTerm.toLowerCase();
    const actorMatch = log.actor_name?.toLowerCase().includes(term) || log.actor_email?.toLowerCase().includes(term);
    const targetMatch = log.target_name?.toLowerCase().includes(term) || log.target_id?.toLowerCase().includes(term);
    const actionMatch = log.action?.toLowerCase().includes(term) || (actionLabels[log.action]?.label || "").toLowerCase().includes(term);
    const detailsMatch = JSON.stringify(log.details || {}).toLowerCase().includes(term);

    if (searchTerm.trim() && !actorMatch && !targetMatch && !actionMatch && !detailsMatch) {
      return false;
    }

    // 2. Filtro por Ator
    if (selectedActor !== "ALL") {
      const actorKey = log.actor_name || log.actor_email;
      if (actorKey !== selectedActor) return false;
    }

    // 3. Filtro por Tipo de Ação
    if (selectedAction !== "ALL") {
      if (selectedAction === "USUARIOS" && !log.action.includes("USUARIO") && !log.action.includes("DEPENDENTE")) return false;
      if (selectedAction === "SENHA" && log.action !== "ALTERACAO_SENHA") return false;
      if (selectedAction === "AGENDA" && !log.action.includes("AGENDA") && !log.action.includes("CONSULTA")) return false;
      if (selectedAction === "CUPOM" && !log.action.includes("CUPOM")) return false;
    }

    // 4. Filtro por Período
    if (selectedPeriod !== "ALL") {
      const logDate = new Date(log.created_at).getTime();
      const now = Date.now();
      if (selectedPeriod === "TODAY" && now - logDate > 24 * 60 * 60 * 1000) return false;
      if (selectedPeriod === "7DAYS" && now - logDate > 7 * 24 * 60 * 60 * 1000) return false;
      if (selectedPeriod === "30DAYS" && now - logDate > 30 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

  // Estatísticas rápidas
  const totalLogs = logs.length;
  const logsToday = logs.filter(l => Date.now() - new Date(l.created_at).getTime() < 24 * 60 * 60 * 1000).length;
  const userChanges = logs.filter(l => l.action.includes("USUARIO") || l.action.includes("DEPENDENTE")).length;
  const passwordChanges = logs.filter(l => l.action === "ALTERACAO_SENHA").length;

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedActor("ALL");
    setSelectedAction("ALL");
    setSelectedPeriod("ALL");
  };

  const hasActiveFilters = searchTerm !== "" || selectedActor !== "ALL" || selectedAction !== "ALL" || selectedPeriod !== "ALL";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
        <p className="text-white text-lg">Carregando relatório de auditoria...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")} className="text-slate-300 hover:text-white">
                <ArrowLeft className="w-5 h-5" />
             </Button>
             <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  Relatório de Auditoria
                </h1>
                <p className="text-xs text-slate-400">Rastreamento completo das ações administrativas</p>
             </div>
          </div>

          <div className="flex items-center gap-3">
            {currentAdmin && (
              <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 rounded-full px-3.5 py-1.5 shadow-xs">
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                    {currentAdmin.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900 animate-pulse" />
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{currentAdmin.name}</span>
                    <span className="text-[10px] bg-blue-500/20 text-blue-300 font-mono px-1.5 py-0.5 rounded border border-blue-500/30">Super Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">{currentAdmin.email}</div>
                </div>
              </div>
            )}

            <Button variant="ghost" onClick={() => navigate("/admin-dashboard")} className="text-slate-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              <span className="hidden sm:block">Voltar ao Painel</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 py-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total de Registros</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{totalLogs}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Activity className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Ações nas últimas 24h</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{logsToday}</p>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <Clock className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Cadastros & Edições</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{userChanges}</p>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Edit className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Senhas Redefinidas</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{passwordChanges}</p>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <KeyRound className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome do administrador, usuário alterado, ação ou detalhes..."
                className="pl-10 h-11 border-slate-200 bg-slate-50/50 focus:bg-white transition-all text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 font-medium text-slate-500">
                <Filter className="w-3.5 h-3.5" />
                <span>Filtrar por:</span>
              </div>

              {/* Filtro de Superusuário */}
              <select
                aria-label="Filtrar por Superusuário"
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={selectedActor}
                onChange={(e) => setSelectedActor(e.target.value)}
              >
                <option value="ALL">Todos os Superusuários</option>
                {uniqueActors.map(actor => (
                  <option key={actor} value={actor}>{actor}</option>
                ))}
              </select>

              {/* Filtro de Categoria de Ação */}
              <select
                aria-label="Filtrar por Categoria"
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
              >
                <option value="ALL">Todas as Categorias</option>
                <option value="USUARIOS">Usuários & Dependentes</option>
                <option value="SENHA">Redefinições de Senha</option>
                <option value="AGENDA">Agenda & Consultas</option>
                <option value="CUPOM">Cupons de Desconto</option>
              </select>

              {/* Filtro por Período */}
              <select
                aria-label="Filtrar por Período"
                className="h-9 px-3 rounded-lg border border-slate-200 bg-white text-xs font-medium text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="ALL">Todo o Histórico</option>
                <option value="TODAY">Últimas 24 Horas</option>
                <option value="7DAYS">Últimos 7 Dias</option>
                <option value="30DAYS">Últimos 30 Dias</option>
              </select>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 h-9 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  Limpar Filtros
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <span className="text-slate-500">Eventos Encontrados:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
                {filteredLogs.length}
              </span>
            </div>
          </div>
        </div>

        {/* Tabela de Eventos */}
        {filteredLogs.length === 0 ? (
          <Card className="p-12 text-center">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Nenhum evento de auditoria encontrado para os filtros selecionados.</p>
            <p className="text-slate-400 text-xs mt-1">Conforme os superusuários realizarem alterações na plataforma, elas serão listadas aqui.</p>
          </Card>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data / Hora</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Superusuário</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ação</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário / Alvo Afetado</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Resumo</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLogs.map((log) => {
                    const actionInfo = actionLabels[log.action] || {
                      label: log.action,
                      color: "bg-slate-100 text-slate-700 border-slate-200",
                      icon: Activity
                    };
                    const IconComponent = actionInfo.icon;

                    return (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 text-xs text-slate-600 font-mono whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                              {(log.actor_name || "A").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 text-xs">
                                {log.actor_name || "Administrador"}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {log.actor_email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${actionInfo.color}`}>
                            <IconComponent className="w-3.5 h-3.5" />
                            {actionInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900 text-xs">
                            {log.target_name || "N/A"}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Tipo: {log.target_type}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                          {log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${String(v)}`).slice(0, 3).join(" • ") : "Sem dados adicionais"}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveLog(log)}
                            className="text-blue-700 hover:bg-blue-50 border-blue-200 text-xs h-8 px-2.5"
                          >
                            <Eye className="w-3.5 h-3.5 mr-1" />
                            Ver Dados
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Log */}
      <Dialog open={!!activeLog} onOpenChange={(open) => !open && setActiveLog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Detalhes da Ação de Auditoria
            </DialogTitle>
            <DialogDescription>
              Registro imutável arquivado no Supabase em {activeLog && formatDateTime(activeLog.created_at)}.
            </DialogDescription>
          </DialogHeader>

          {activeLog && (
            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Superusuário</span>
                  <span className="font-semibold text-slate-800 text-xs">{activeLog.actor_name}</span>
                  <span className="text-slate-500 font-mono block text-[10px]">{activeLog.actor_email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ação Executada</span>
                  <span className="font-semibold text-slate-800 text-xs">{activeLog.action}</span>
                  <span className="text-slate-500 block text-[10px]">Alvo: {activeLog.target_name || activeLog.target_type}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Dados e Alterações (JSON):</span>
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(activeLog.details, null, 2)}
                </pre>
              </div>

              <div className="text-[10px] text-slate-400 font-mono">
                Log ID: {activeLog.id}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button onClick={() => setActiveLog(null)} className="bg-[#1E3A8A] text-white">
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
