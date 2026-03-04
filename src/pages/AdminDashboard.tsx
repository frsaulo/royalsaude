import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Users, Search, Calendar as CalendarIcon, Phone, MapPin, MonitorPlay, Loader2, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";

export const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchData();
  }, [navigate]);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin");
        return;
      }

      // Verifica perfil real
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile?.is_admin) {
        await supabase.auth.signOut();
        navigate("/admin");
        toast.error("Acesso negado.");
        return;
      }

      // Se passou, carrega todos agendamentos
      fetchAppointments();
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/admin");
    }
  };

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      
      // Busca todos cruzando com profiles preenchendo cpf se ter
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          profiles:user_id(full_name, cpf, phone)
        `)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar agendamentos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setAppointments(prev => prev.filter(app => app.id !== id));
      toast.success("Agendamento excluído com sucesso.");
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin");
    toast.success("Logout administrativo realizado.");
  };

  // Filtrar baseados no text search (Nome do paciente, telefone ou CPF ou Email)
  const filteredAppointments = appointments.filter(app => {
    const term = searchTerm.toLowerCase();
    const patientName = app.patient_name?.toLowerCase() || '';
    const phone = app.phone?.toLowerCase() || '';
    const dateStr = app.date ? format(parseISO(app.date), "dd/MM/yyyy") : '';
    
    // Extende busca para a tabela profiles colada nela.
    const realCpf = app.profiles?.cpf?.toLowerCase() || '';
    const realFullName = app.profiles?.full_name?.toLowerCase() || '';

    return patientName.includes(term) || 
           phone.includes(term) || 
           dateStr.includes(term) ||
           realCpf.includes(term) ||
           realFullName.includes(term);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
        <p className="text-white text-lg">Carregando painel de controle...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Admin Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="bg-red-500/20 p-2 rounded-full hidden sm:block">
               <ShieldAlert className="w-6 h-6 text-red-500" />
             </div>
             <div>
                <h1 className="text-xl font-bold">Painel Master</h1>
                <p className="text-xs text-slate-400">Gerenciamento Interno (Royal Saúde)</p>
             </div>
          </div>
          
          <Button variant="ghost" onClick={handleLogout} className="text-slate-300 hover:text-white hover:bg-slate-800">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:block">Sair do Painel</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 py-8">
        
        {/* Painel TÃ­tulo e Stats */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-end mb-8">
            <div>
               <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
                 <Users className="w-8 h-8 text-blue-600" />
                 Todos os Agendamentos
               </h2>
               <p className="text-slate-500 mt-1">
                 Você está visualizando todo o banco de dados. Tenha cuidado ao deletar registros de pacientes.
               </p>
            </div>
            
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar paciente, CPF, telefone ou data..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>

        {/* Lista/Cards Dashboard */}
        {filteredAppointments.length === 0 ? (
             <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-100">
             <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
             <p className="text-slate-500 text-lg">Nenhum agendamento encontrado no sistema.</p>
           </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredAppointments.map((app) => (
                <Card key={app.id} className="relative overflow-hidden hover:shadow-md transition-shadow border-slate-200">
                  <div className={`absolute top-0 left-0 w-1 h-full ${app.type === 'telemedicina' ? 'bg-purple-500' : 'bg-blue-500'}`}></div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                           <CardTitle className="text-lg font-bold text-slate-800">{app.patient_name}</CardTitle>
                           <CardDescription className="font-medium text-blue-600 mt-1 flex items-center gap-1.5">
                               <CalendarIcon className="w-4 h-4" />
                               {format(parseISO(app.date), "dd 'de' MMMM, yyyy", { locale: ptBR })} às {app.time}
                           </CardDescription>
                        </div>

                        {app.type === 'telemedicina' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <MonitorPlay className="w-3.5 h-3.5" /> Telemedicina
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <MapPin className="w-3.5 h-3.5" /> Presencial
                          </span>
                        )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     <div className="bg-slate-50 p-3 rounded-lg space-y-2 mt-2 border border-slate-100">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" /> WhatsApp: 
                            <span className="font-medium text-slate-900">{app.phone}</span>
                        </div>
                        {app.profiles?.cpf && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Users className="w-4 h-4 text-slate-400" /> CPF: 
                                <span className="font-medium text-slate-900">{app.profiles.cpf}</span>
                            </div>
                        )}
                         <div className="text-xs text-slate-400 pt-2 border-t border-slate-200 mt-2">
                            Criado em: {format(new Date(app.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                            <br/> ID Banco: <span className="font-mono text-[10px]">{app.id.split('-')[0]}...</span>
                        </div>
                     </div>

                     <div className="flex justify-end pt-2">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100">
                              <Trash2 className="w-4 h-4 mr-2" /> Cancelar Agendamento / Excluir
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Zona de Perigo!</AlertDialogTitle>
                              <AlertDialogDescription>
                                Você está prestes a forçar o cancelamento da consulta de <strong>{app.patient_name}</strong> dia {format(parseISO(app.date), "dd/MM/yyyy")} às {app.time}.
                                Esta ação não poderá ser desfeita. Tem certeza?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar atrás</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(app.id)} className="bg-red-600 hover:bg-red-700">
                                Sim, excluir agora
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                     </div>
                  </CardContent>
                </Card>
             ))}
          </div>
        )}
      </main>

    </div>
  );
};
import { ShieldAlert } from "lucide-react";
