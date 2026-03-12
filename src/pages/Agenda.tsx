import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import { Loader2, LogOut, User, Trash2, Calendar as CalendarIcon, Clock, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";

const MORNING_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];



const TIMEZONE = "America/Sao_Paulo";

export const Agenda = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();


  
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<string>("local");
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [appointmentAction, setAppointmentAction] = useState<{id: string, date: string, time: string, actionType: 'delete' | 'reschedule'} | null>(null);

  const [myAppointments, setMyAppointments] = useState<any[]>([]);

  // Calculate current time in Brasilia
  const nowInSP = toZonedTime(new Date(), TIMEZONE);
  const todayStringSP = format(nowInSP, 'yyyy-MM-dd');
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';

  // Fetch booked slots when date changes
  useEffect(() => {
    if (!date) return;
    
    const fetchBookedSlots = async () => {
      setLoadingHours(true);
      const dateStr = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('appointments')
        .select('time')
        .eq('date', dateStr);

      if (error) {
        toast.error("Erro ao buscar horários: " + error.message);
      } else {
        const booked = data.map(app => {
          return app.time ? app.time.substring(0, 5) : '';
        });
        setBookedSlots(booked);
      }
      setLoadingHours(false);
      setSelectedTime(null);
    };

    fetchBookedSlots();
  }, [date, myAppointments]);

  // Fetch my appointments
  useEffect(() => {
    if (!user) return;

    const fetchMyAppointments = async () => {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (!error && data) {
        setMyAppointments(data);
      }
    };

    fetchMyAppointments();
  }, [user, isSubmitting]);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const handleCreateAppointment = async () => {
    if (!user || !date || !selectedTime) {
      toast.error("Por favor, selecione uma data e horário.");
      return;
    }

    setIsSubmitting(true);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Busca o telefone e nome na tabela profiles (fonte correta dos dados do paciente)
    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', user.id)
      .single();

    const patientPhone = profile?.phone || user.user_metadata?.phone || '';
    const patientName  = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Paciente';

    const { error } = await supabase
      .from('appointments')
      .insert([
        {
          user_id: user.id,
          date: dateStr,
          time: selectedTime,
          type: attendanceType,
          patient_name: patientName,
          phone: patientPhone,
        }
      ]);

    if (error) {
      if (error.code === '23505') {
        toast.error("Este horário acabou de ser agendado por outra pessoa.");
      } else {
        toast.error("Falha ao agendar: " + error.message);
      }
    } else {
      const whatsappMessage = window.encodeURIComponent(
        `Olá, sou ${user.user_metadata?.full_name || user.email}. Confirmo meu agendamento para o dia ${format(date, "dd/MM/yyyy")} às ${selectedTime}.`
      );
      const whatsappUrl = `https://wa.me/5535991823126?text=${whatsappMessage}`;
      
      toast.success(
        <div className="flex flex-col gap-2">
          <span>Agendamento confirmado!</span>
          <Button size="sm" variant="outline" className="bg-green-600 text-white border-none hover:bg-green-700" onClick={() => window.open(whatsappUrl, '_blank')}>
            <MessageCircle className="h-4 w-4 mr-2" /> Confirmar no WhatsApp
          </Button>
        </div>,
        { duration: 8000 }
      );
      
      setBookedSlots([...bookedSlots, selectedTime]);
      setSelectedTime(null);
    }
    
    setIsSubmitting(false);
  };

  const executeAction = async () => {
    if (!appointmentAction) return;

    // Busca os dados completos do agendamento (para ter o telefone)
    const app = myAppointments.find(a => a.id === appointmentAction.id);

    setDeletingId(appointmentAction.id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentAction.id);

    if (error) {
      toast.error(`Erro ao ${appointmentAction.actionType === 'delete' ? 'cancelar' : 'remarcar'}: ` + error.message);
    } else {
      if (appointmentAction.actionType === 'delete') {
        toast.success("Agendamento cancelado com sucesso!");
      } else {
        toast.success("Consulta liberada. Escolha o novo horário na agenda.");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setMyAppointments(myAppointments.filter(a => a.id !== appointmentAction.id));

      if (date && format(date, 'yyyy-MM-dd') === appointmentAction.date) {
        setBookedSlots(bookedSlots.filter(t => t !== appointmentAction.time));
      }

      // Envia WhatsApp de cancelamento ou remarcação (não bloqueia a UI)
      if (app?.phone && app.phone !== 'Não informado') {
        fetch(
          'https://bxkwonqrflctvbjskhmj.supabase.co/functions/v1/notify-whatsapp',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: appointmentAction.actionType === 'delete' ? 'cancel' : 'reschedule',
              phone: app.phone,
              patientName: app.patient_name,
              date: appointmentAction.date,
              time: appointmentAction.time,
            }),
          }
        ).catch(() => { /* silencioso — não impede o fluxo */ });
      }
    }

    setDeletingId(null);
    setAppointmentAction(null);
  };

  const isPastHour = (timeStr: string) => {
    if (selectedDateStr !== todayStringSP) return false;
    
    const [h, m] = timeStr.split(':').map(Number);
    const currentH = nowInSP.getHours();
    const currentM = nowInSP.getMinutes();
    
    if (h < currentH) return true;
    if (h === currentH && m <= currentM) return true;
    
    return false;
  };

  const isTimeBooked = (time: string) => bookedSlots.includes(time) || isPastHour(time);

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-[#1E3A8A] text-xl">Royal Saúde</div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-600 hidden md:inline-flex items-center gap-2">
              <User className="h-4 w-4" />
              {user?.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-6xl px-4 py-8 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 flex flex-col gap-8">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="shadow-lg border-none">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-[#1E3A8A]" />
                  <CardTitle className="text-lg">Escolha o Dia</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center pt-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => {
                    const dStr = format(d, 'yyyy-MM-dd');
                    return dStr < todayStringSP || d.getDay() === 0 || d.getDay() === 6;
                  }}
                  locale={ptBR}
                  className="p-0 pointer-events-auto"
                />
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#1E3A8A]" />
                  <CardTitle className="text-lg">Horários Livres</CardTitle>
                </div>
                <CardDescription className="capitalize">
                  {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!date ? (
                  <div className="h-40 flex flex-col items-center justify-center text-slate-400 gap-2 border-2 border-dashed rounded-lg border-slate-100">
                    <CalendarIcon className="h-8 w-8 opacity-20" />
                    <span className="text-sm">Aguardando Data</span>
                  </div>
                ) : loadingHours ? (
                  <div className="h-40 flex items-center justify-center text-slate-400">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-[10px] text-slate-400 tracking-wider mb-3">
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                        PERÍODO DA MANHÃ
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {MORNING_SLOTS.map((time) => {
                          const isBooked = isTimeBooked(time);
                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`h-10 text-xs font-semibold rounded-md border-slate-200 ${selectedTime === time ? 'bg-[#1E3A8A] text-white shadow-md' : 'hover:border-[#1E3A8A] hover:bg-blue-50/50'} ${isBooked ? 'hidden' : ''}`}
                              disabled={isBooked}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <h4 className="flex items-center gap-2 font-bold text-[10px] text-slate-400 tracking-wider mb-3">
                        <span className="w-8 h-[1px] bg-slate-200"></span>
                        PERÍODO DA TARDE
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {AFTERNOON_SLOTS.map((time) => {
                          const isBooked = isTimeBooked(time);
                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`h-10 text-xs font-semibold rounded-md border-slate-200 ${selectedTime === time ? 'bg-[#1E3A8A] text-white shadow-md' : 'hover:border-[#1E3A8A] hover:bg-blue-50/50'} ${isBooked ? 'hidden' : ''}`}
                              disabled={isBooked}
                              onClick={() => setSelectedTime(time)}
                            >
                              {time}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {selectedTime && date && (
            <Card className="border-none bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] text-white overflow-hidden shadow-xl">
              <CardContent className="p-0">
                <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="space-y-3 text-center md:text-left">
                    <Badge className="bg-white/20 text-white border-none hover:bg-white/30 backdrop-blur-sm px-3">
                      Resumo da Escolha
                    </Badge>
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-medium pt-2">
                      <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {format(date, "dd/MM/yyyy")}
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-full">
                        <Clock className="h-3.5 w-3.5" />
                        {selectedTime}
                      </div>
                    </div>
                    
                    <div className="flex justify-center md:justify-start gap-3 pt-2">
                      <button 
                        onClick={() => setAttendanceType('local')}
                        className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${attendanceType === 'local' ? 'bg-white text-[#1E3A8A] shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        Presencial
                      </button>
                      <button 
                        onClick={() => setAttendanceType('telemedicina')}
                        className={`text-xs px-4 py-2 rounded-lg font-bold transition-all ${attendanceType === 'telemedicina' ? 'bg-white text-[#1E3A8A] shadow-lg' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        Telemedicina
                      </button>
                    </div>
                  </div>
                  
                  <div className="w-full md:w-auto">
                    <Button 
                      size="lg" 
                      className="w-full md:w-64 bg-[#10b981] hover:bg-[#059669] text-white font-bold h-16 shadow-lg rounded-xl text-lg group"
                      onClick={handleCreateAppointment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                      Confirmar Agora
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-4">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Meus Agendamentos</CardTitle>
            </CardHeader>
            <CardContent>
              {myAppointments.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  Você não tem nenhum agendamento futuro.
                </div>
              ) : (
                <div className="space-y-4">
                  {myAppointments.map((app) => (
                    <div key={app.id} className="p-4 border rounded-lg bg-white shadow-sm flex flex-col gap-2 relative group hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-800">{app.date.split('-').reverse().join('/')}</span>
                        <div className="flex items-center gap-2">
                          {app.type && (
                            <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded-full uppercase">
                              {app.type === 'telemedicina' ? 'Telemedicina' : 'Local'}
                            </span>
                          )}
                          <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full uppercase">
                            Agendado
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                          Horário: <span className="text-[#1E3A8A]">{app.time?.substring(0, 5) || app.time}</span>
                        </span>
                        
                        {/* Botões de Ação */}
                        <div className="flex items-center gap-2">
                          <Button 
                             variant="outline" 
                             size="sm"
                             className="h-8 text-xs font-medium text-[#1E3A8A] border-[#1E3A8A] hover:bg-blue-50"
                             disabled={deletingId === app.id}
                             onClick={() => setAppointmentAction({id: app.id, date: app.date, time: app.time, actionType: 'reschedule'})}
                             title="Remarcar Consulta"
                          >
                            Remarcar
                          </Button>
                          <Button 
                             variant="ghost" 
                             size="icon"
                             className="h-8 w-8 text-rose-500 hover:bg-rose-100 hover:text-rose-600"
                             disabled={deletingId === app.id}
                             onClick={() => setAppointmentAction({id: app.id, date: app.date, time: app.time, actionType: 'delete'})}
                             title="Cancelar Agendamento"
                          >
                            {deletingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={!!appointmentAction} onOpenChange={(open) => !open && setAppointmentAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {appointmentAction?.actionType === 'reschedule' ? 'Remarcar Consulta' : 'Cancelar Agendamento'}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <span className="block">
                {appointmentAction?.actionType === 'reschedule' 
                  ? 'Para remarcar, primeiro precisaremos cancelar esta consulta. Confirma a liberação do horário no dia '
                  : 'Tem certeza que deseja cancelar sua consulta marcada para o dia '}
                <span className="font-bold">{appointmentAction?.date.split('-').reverse().join('/')}</span> às <span className="font-bold">{appointmentAction?.time?.substring(0, 5) || appointmentAction?.time}</span>?
                {appointmentAction?.actionType === 'delete' && ' Esta ação não pode ser desfeita.'}
              </span>
              
              <span className="block bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md text-sm font-medium mt-4">
                Aviso: O prazo para cancelar ou remarcar sem custos é de no mínimo 24h de antecedência. Em caso de prazo inferior, será cobrada uma nova consulta.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction} className={appointmentAction?.actionType === 'delete' ? "bg-rose-600 hover:bg-rose-700" : "bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"}>
              {appointmentAction?.actionType === 'reschedule' ? 'Sim, remarcar' : 'Sim, cancelar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

