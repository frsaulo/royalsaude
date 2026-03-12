import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Trash2, Users, Search, Calendar as CalendarIcon, Phone, MapPin, MonitorPlay, Loader2, LogOut, Mail, Clock, RefreshCw, ShieldAlert } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";

export const AdminDashboard = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // States for Reschedule Modal
  const [rescheduleData, setRescheduleData] = useState<{ id: string, date: string, time: string, patientName: string } | null>(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [isRescheduling, setIsRescheduling] = useState(false);

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
      
      // Busca todos os agendamentos isolados
      const { data: appointmentsData, error: appError } = await supabase
        .from('appointments')
        .select(`*`)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (appError) throw appError;
      
      // Busca todos os profiles para mesclar o CPF de forma blindada contra erros de Schema
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, cpf, phone, email');
        
      const appointmentsWithProfiles = (appointmentsData || []).map(app => {
         const userProfile = profilesData?.find(p => p.id === app.user_id);
         return {
            ...app,
            profiles: userProfile || null
         };
      });

      setAppointments(appointmentsWithProfiles);
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

  const handleReschedule = async () => {
    if (!rescheduleData || !newDate || !newTime) {
      toast.error("Preencha a nova data e o novo horário.");
      return;
    }
    
    setIsRescheduling(true);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ date: newDate, time: newTime })
        .eq('id', rescheduleData.id);

      if (error) {
        if (error.code === '23505') throw new Error("Atenção: Este horário já contém uma consulta para este dia. Escolha outro.");
        throw error;
      }
      
      toast.success("Consulta remarcada com sucesso!");
      setRescheduleData(null);
      setNewDate("");
      setNewTime("");
      fetchAppointments();
    } catch (err: any) {
      toast.error(err.message || "Erro ao remarcar a consulta.");
    } finally {
      setIsRescheduling(false);
    }
  };

  // Filtrar baseados no text search (Nome do paciente, telefone ou CPF ou Email)
  const filteredAppointments = appointments.filter(app => {
    const term = searchTerm.toLowerCase();
    const actualName = app.patient_name !== 'Paciente Cadastrado' ? app.patient_name : (app.profiles?.full_name || 'Paciente Cadastrado');
    const patientName = actualName?.toLowerCase() || '';
    const phone = app.phone?.toLowerCase() || '';
    const dateStr = app.date ? format(parseISO(app.date), "dd/MM/yyyy") : '';
    
    // Extende busca para a tabela profiles colada nela.
    const realCpf = app.profiles?.cpf?.toLowerCase() || '';
    const realEmail = app.profiles?.email?.toLowerCase() || '';

    return patientName.includes(term) || 
           phone.includes(term) || 
           dateStr.includes(term) ||
           realCpf.includes(term) ||
           realEmail.includes(term);
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
                           <CardTitle className="text-lg font-bold text-slate-800">
                             {app.patient_name !== 'Paciente Cadastrado' ? app.patient_name : (app.profiles?.full_name || 'Paciente Cadastrado')}
                           </CardTitle>
                           <CardDescription className="font-medium text-blue-600 mt-1 flex items-center gap-1.5">
                               <CalendarIcon className="w-4 h-4" />
                               {format(parseISO(app.date), "dd 'de' MMMM, yyyy", { locale: ptBR })} às {app.time?.substring(0, 5) || app.time}
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
                        {app.profiles?.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                <Mail className="w-4 h-4 text-slate-400" /> E-mail: 
                                <span className="font-medium text-slate-900 break-all">{app.profiles.email}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Phone className="w-4 h-4 text-slate-400" /> WhatsApp: 
                            <span className="font-medium text-slate-900">{app.profiles?.phone || app.phone}</span>
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

                     <div className="flex justify-between items-center pt-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 flex-1"
                          onClick={() => {
                            setRescheduleData({
                              id: app.id,
                              date: app.date,
                              time: app.time?.substring(0, 5) || app.time,
                              patientName: app.patient_name !== 'Paciente Cadastrado' ? app.patient_name : (app.profiles?.full_name || 'Paciente Cadastrado')
                            });
                          }}
                        >
                          <RefreshCw className="w-4 h-4 mr-2" /> Remarcar
                        </Button>

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 flex-1">
                              <Trash2 className="w-4 h-4 mr-2" /> Excluir
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

      <Dialog open={!!rescheduleData} onOpenChange={(open) => {
        if (!open) {
          setRescheduleData(null);
          setNewDate("");
          setNewTime("");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remarcar Consulta</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-sm text-slate-500">
              Você está remarcando a consulta de <strong>{rescheduleData?.patientName}</strong>, originalmente marcada para dia <span className="font-medium text-blue-600">{rescheduleData?.date ? format(parseISO(rescheduleData.date), "dd/MM/yyyy") : ''} às {rescheduleData?.time}</span>.
            </p>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4" /> Nova Data
                </label>
                <Input 
                  type="date" 
                  value={newDate} 
                  onChange={(e) => setNewDate(e.target.value)}
                  min={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Novo Horário
                </label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                >
                  <option value="" disabled>Selecione um horário</option>
                  <option value="08:00">08:00</option>
                  <option value="08:30">08:30</option>
                  <option value="09:00">09:00</option>
                  <option value="09:30">09:30</option>
                  <option value="10:00">10:00</option>
                  <option value="10:30">10:30</option>
                  <option value="11:00">11:00</option>
                  <option value="11:30">11:30</option>
                  <option value="12:00">12:00</option>
                  <option value="14:00">14:00</option>
                  <option value="14:30">14:30</option>
                  <option value="15:00">15:00</option>
                  <option value="15:30">15:30</option>
                  <option value="16:00">16:00</option>
                  <option value="16:30">16:30</option>
                  <option value="17:00">17:00</option>
                  <option value="17:30">17:30</option>
                  <option value="18:00">18:00</option>
                </select>
              </div>
            </div>
          </div>
          <DialogFooter>
             <Button variant="outline" onClick={() => setRescheduleData(null)}>
               Cancelar
             </Button>
             <Button onClick={handleReschedule} disabled={isRescheduling} className="bg-blue-600 hover:bg-blue-700">
                {isRescheduling ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Confirmar Remarcação
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
