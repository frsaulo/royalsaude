import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";
import { Button } from "../components/ui/button";
import { Calendar } from "../components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
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
import { toast } from "sonner";
import { Loader2, LogOut, User, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Horários de atendimento base (8h as 12 e 14h as 18)
const MORNING_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00"];
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00"];

const TIMEZONE = "America/Sao_Paulo";

export const Agenda = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<string>("local");
  
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{id: string, date: string, time: string} | null>(null);

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
        const booked = data.map(app => app.time);
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
    if (!user || !date || !selectedTime) return;

    setIsSubmitting(true);
    const dateStr = format(date, 'yyyy-MM-dd');

    const { error } = await supabase
      .from('appointments')
      .insert([
        { 
          user_id: user.id, 
          date: dateStr, 
          time: selectedTime,
          status: 'agendado',
          type: attendanceType
        }
      ]);

    if (error) {
      if (error.code === '23505') { // unique violation
        toast.error("Este horário acabou de ser agendado por outra pessoa.");
      } else {
        toast.error("Falha ao agendar: " + error.message);
      }
    } else {
      toast.success(`Agendamento confirmado para ${format(date, "dd/MM/yyyy")} às ${selectedTime}`);
      setBookedSlots([...bookedSlots, selectedTime]);
      setSelectedTime(null);
    }
    
    setIsSubmitting(false);
  };

  const executeDelete = async () => {
    if (!appointmentToDelete) return;

    setDeletingId(appointmentToDelete.id);
    const { error } = await supabase
      .from('appointments')
      .delete()
      .eq('id', appointmentToDelete.id);

    if (error) {
      toast.error("Erro ao cancelar o agendamento: " + error.message);
    } else {
      toast.success("Agendamento cancelado com sucesso!");
      setMyAppointments(myAppointments.filter(app => app.id !== appointmentToDelete.id));
      
      // If we just deleted a slot from the currently viewed date, we should unbook it locally
      if (date && format(date, 'yyyy-MM-dd') === appointmentToDelete.date) {
        setBookedSlots(bookedSlots.filter(time => time !== appointmentToDelete.time));
      }
    }
    setDeletingId(null);
    setAppointmentToDelete(null);
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

      <main className="container mx-auto max-w-5xl px-4 py-8 grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 flex flex-col gap-8">
          <div className="flex flex-col md:flex-row gap-6">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Escolha o Dia</CardTitle>
                <CardDescription>Selecione a data para seu atendimento</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center pb-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  disabled={(d) => {
                    const dStr = format(d, 'yyyy-MM-dd');
                    return dStr < todayStringSP || d.getDay() === 0 || d.getDay() === 6;
                  }}
                  locale={ptBR}
                  className="rounded-md border shadow-sm w-fit"
                />
              </CardContent>
            </Card>

            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Horários Livres</CardTitle>
                <CardDescription>
                  {date ? format(date, "EEEE, d 'de' MMMM", { locale: ptBR }) : "Selecione uma data"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!date ? (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                    Aguardando Data
                  </div>
                ) : loadingHours ? (
                  <div className="h-40 flex items-center justify-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-sm text-slate-500 mb-3">MANHÃ (8h às 12h)</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {MORNING_SLOTS.map((time) => {
                          const isBooked = isTimeBooked(time);
                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`w-full ${selectedTime === time ? 'bg-[#1E3A8A]' : ''} ${isBooked ? 'opacity-30 cursor-not-allowed hidden' : ''}`}
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
                      <h4 className="font-medium text-sm text-slate-500 mb-3">TARDE (14h às 18h)</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {AFTERNOON_SLOTS.map((time) => {
                          const isBooked = isTimeBooked(time);
                          return (
                            <Button
                              key={time}
                              variant={selectedTime === time ? "default" : "outline"}
                              className={`w-full ${selectedTime === time ? 'bg-[#1E3A8A]' : ''} ${isBooked ? 'opacity-30 cursor-not-allowed hidden' : ''}`}
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
            <Card className="border-[#1E3A8A] bg-blue-50/50">
              <CardContent className="p-6 flex flex-col items-start justify-between gap-4">
                <div className="w-full">
                  <h3 className="font-bold text-slate-800 text-lg">Revisão do Agendamento</h3>
                  <p className="text-slate-600 mb-4">
                    Data: <span className="font-medium text-[#1E3A8A]">{format(date, "dd/MM/yyyy")}</span> às <span className="font-medium text-[#1E3A8A]">{selectedTime}</span>
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 mb-2">
                    <label className="flex items-center justify-center text-center gap-2 cursor-pointer p-3 border rounded-md bg-white flex-1 hover:border-[#1E3A8A] transition-colors" style={{borderColor: attendanceType === 'local' ? '#1E3A8A' : '', borderWidth: attendanceType === 'local' ? '2px' : '1px'}}>
                      <input type="radio" value="local" checked={attendanceType === 'local'} onChange={(e) => setAttendanceType(e.target.value)} className="hidden" />
                      <span className={`font-semibold ${attendanceType === 'local' ? 'text-[#1E3A8A]' : 'text-slate-500'}`}>Local (Clínica)</span>
                    </label>
                    <label className="flex items-center justify-center text-center gap-2 cursor-pointer p-3 border rounded-md bg-white flex-1 hover:border-[#1E3A8A] transition-colors" style={{borderColor: attendanceType === 'telemedicina' ? '#1E3A8A' : '', borderWidth: attendanceType === 'telemedicina' ? '2px' : '1px'}}>
                      <input type="radio" value="telemedicina" checked={attendanceType === 'telemedicina'} onChange={(e) => setAttendanceType(e.target.value)} className="hidden" />
                      <span className={`font-semibold ${attendanceType === 'telemedicina' ? 'text-[#1E3A8A]' : 'text-slate-500'}`}>Remoto (Telemedicina)</span>
                    </label>
                  </div>
                </div>
                <Button 
                  size="lg" 
                  className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                  onClick={handleCreateAppointment}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Confirmar Agendamento
                </Button>
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
                            {app.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm font-medium text-slate-600 flex items-center gap-1">
                          Horário: <span className="text-[#1E3A8A]">{app.time}</span>
                        </span>
                        
                        {/* Botão de Excluir / Cancelar */}
                        <Button 
                           variant="ghost" 
                           size="icon"
                           className="h-8 w-8 text-rose-500 hover:bg-rose-100 hover:text-rose-600 opacity-80"
                           disabled={deletingId === app.id}
                           onClick={() => setAppointmentToDelete({id: app.id, date: app.date, time: app.time})}
                           title="Cancelar Agendamento"
                        >
                          {deletingId === app.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <AlertDialog open={!!appointmentToDelete} onOpenChange={(open) => !open && setAppointmentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar Agendamento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja cancelar sua consulta marcada para o dia{" "}
              <span className="font-bold">{appointmentToDelete?.date.split('-').reverse().join('/')}</span> às <span className="font-bold">{appointmentToDelete?.time}</span>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={executeDelete} className="bg-rose-600 hover:bg-rose-700">
              Sim, cancelar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

