import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toZonedTime } from "date-fns-tz";

import { Badge } from "../components/ui/badge";
import { Loader2, LogOut, User, Trash2, Calendar as CalendarIcon, Clock, MessageCircle, Users, Pencil, Plus, X, Save, ClipboardList, Crown, CreditCard } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";

const MORNING_SLOTS = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30"];
const AFTERNOON_SLOTS = ["14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
const EVENING_SLOTS = ["18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30"];
const TIMEZONE = "America/Sao_Paulo";

type Dependent = {
  relationship: string;
  full_name: string;
  cpf: string;
  phone: string;
  email: string;
};

const RELATIONSHIP_OPTIONS = [
  { value: "ESPOSA", label: "Esposa" },
  { value: "MARIDO", label: "Marido" },
  { value: "FILHO", label: "Filho" },
  { value: "FILHA", label: "Filha" },
  { value: "PAI", label: "Pai" },
  { value: "MAE", label: "Mãe" },
];

const createEmptyDependent = (): Dependent => ({
  relationship: "FILHO",
  full_name: "",
  cpf: "",
  phone: "",
  email: "",
});

const normalizeDependents = (raw: any): Dependent[] => {
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try { return JSON.parse(raw); } catch { return []; }
  }
  return [];
};

export const Agenda = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Tab state
  const [activeTab, setActiveTab] = useState("agendar");

  // Scheduling state
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [attendanceType, setAttendanceType] = useState<string>("local");
  const [specialty, setSpecialty] = useState<string>("Dentista");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingHours, setLoadingHours] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [appointmentAction, setAppointmentAction] = useState<{id: string, date: string, time: string, actionType: 'delete' | 'reschedule'} | null>(null);
  const [myAppointments, setMyAppointments] = useState<any[]>([]);

  // Appointment editing
  const [editingAppointment, setEditingAppointment] = useState<any | null>(null);
  const [editDate, setEditDate] = useState<Date | undefined>(undefined);
  const [editTime, setEditTime] = useState<string | null>(null);
  const [editType, setEditType] = useState<string>("local");
  const [editSpecialty, setEditSpecialty] = useState<string>("Dentista");
  const [editBookedSlots, setEditBookedSlots] = useState<string[]>([]);
  const [loadingEditSlots, setLoadingEditSlots] = useState(false);

  const SPECIALTIES = ["Dentista", "Psicologia", "Nutrição", "Exame de Vista"];

  // Dependents state
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loadingDependents, setLoadingDependents] = useState(false);
  const [savingDependents, setSavingDependents] = useState(false);
  const [editingDepIndex, setEditingDepIndex] = useState<number | null>(null);
  const [editingDep, setEditingDep] = useState<Dependent | null>(null);
  const [showAddDependent, setShowAddDependent] = useState(false);
  const [newDependent, setNewDependent] = useState<Dependent>(createEmptyDependent());
  const [deleteDepIndex, setDeleteDepIndex] = useState<number | null>(null);
  const [accountType, setAccountType] = useState<string>("");

  // Calculate current time in Brasilia
  const nowInSP = toZonedTime(new Date(), TIMEZONE);
  const todayStringSP = format(nowInSP, 'yyyy-MM-dd');
  const selectedDateStr = date ? format(date, 'yyyy-MM-dd') : '';

  // ──── FETCH FUNCTIONS ────

  const fetchMyAppointments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
      .order('time', { ascending: true });

    if (!error && data) setMyAppointments(data);
  }, [user]);

  const fetchDependents = useCallback(async () => {
    if (!user) return;
    setLoadingDependents(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('dependents, account_type')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setDependents(normalizeDependents(data.dependents));
      setAccountType(data.account_type || user.user_metadata?.account_type || "");
    }
    setLoadingDependents(false);
  }, [user]);

  // ──── EFFECTS ────

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
        setBookedSlots(data.map(app => app.time ? app.time.substring(0, 5) : ''));
      }
      setLoadingHours(false);
      setSelectedTime(null);
    };
    fetchBookedSlots();
  }, [date, myAppointments]);

  useEffect(() => { fetchMyAppointments(); }, [fetchMyAppointments, isSubmitting]);
  useEffect(() => { fetchDependents(); }, [fetchDependents]);

  // Fetch available slots when editing an appointment
  useEffect(() => {
    if (!editDate || !editingAppointment) return;
    const fetchEditSlots = async () => {
      setLoadingEditSlots(true);
      const dateStr = format(editDate, 'yyyy-MM-dd');
      const { data, error } = await supabase
        .from('appointments')
        .select('time, id')
        .eq('date', dateStr);

      if (!error && data) {
        // Exclude the current appointment's time from booked list
        setEditBookedSlots(
          data
            .filter(app => app.id !== editingAppointment.id)
            .map(app => app.time ? app.time.substring(0, 5) : '')
        );
      }
      setLoadingEditSlots(false);
    };
    fetchEditSlots();
  }, [editDate, editingAppointment]);

  // ──── HANDLERS: SCHEDULING ────

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

    const { data: profile } = await supabase
      .from('profiles')
      .select('phone, full_name')
      .eq('id', user.id)
      .single();

    const patientPhone = profile?.phone || user.user_metadata?.phone || '';
    const patientName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Paciente';

    const { error } = await supabase
      .from('appointments')
      .insert([{
        user_id: user.id,
        date: dateStr,
        time: selectedTime,
        type: attendanceType,
        specialty: specialty,
        patient_name: patientName,
        phone: patientPhone,
      }]);

    if (error) {
      if (error.code === '23505') {
        toast.error("Este horário acabou de ser agendado por outra pessoa.");
      } else {
        toast.error("Falha ao agendar: " + error.message);
      }
    } else {
      const whatsappMessage = window.encodeURIComponent(
        `Olá, sou ${patientName}. Confirmo meu agendamento de ${specialty} para o dia ${format(date, "dd/MM/yyyy")} às ${selectedTime}.`
      );
      const whatsappUrl = `https://wa.me/5567991747844?text=${whatsappMessage}`;

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
        toast.success("Consulta liberada. Escolha o novo horário na aba Agendar.");
        setActiveTab("agendar");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }

      setMyAppointments(myAppointments.filter(a => a.id !== appointmentAction.id));

      if (date && format(date, 'yyyy-MM-dd') === appointmentAction.date) {
        setBookedSlots(bookedSlots.filter(t => t !== appointmentAction.time));
      }

      if (app?.phone && app.phone !== 'Não informado') {
        supabase.functions
          .invoke('notify-whatsapp', {
            body: {
              action: appointmentAction.actionType === 'delete' ? 'cancel' : 'reschedule',
              phone: app.phone,
              patientName: app.patient_name,
              date: appointmentAction.date,
              time: appointmentAction.time,
            },
          })
          .catch(() => {});
      }
    }

    setDeletingId(null);
    setAppointmentAction(null);
  };

  // ──── HANDLERS: EDIT APPOINTMENT ────

  const openEditAppointment = (app: any) => {
    const [year, month, day] = app.date.split('-').map(Number);
    setEditingAppointment(app);
    setEditDate(new Date(year, month - 1, day));
    setEditTime(app.time?.substring(0, 5) || app.time);
    setEditType(app.type || "local");
    setEditSpecialty(app.specialty || "Dentista");
  };

  const handleSaveAppointment = async () => {
    if (!editingAppointment || !editDate || !editTime) {
      toast.error("Selecione data e horário.");
      return;
    }

    setIsSubmitting(true);
    const dateStr = format(editDate, 'yyyy-MM-dd');

    const { error } = await supabase
      .from('appointments')
      .update({
        date: dateStr,
        time: editTime,
        type: editType,
        specialty: editSpecialty,
      })
      .eq('id', editingAppointment.id);

    if (error) {
      if (error.code === '23505') {
        toast.error("Este horário já está ocupado.");
      } else {
        toast.error("Erro ao atualizar: " + error.message);
      }
    } else {
      toast.success("Agendamento atualizado com sucesso!");
      setEditingAppointment(null);
      fetchMyAppointments();
    }
    setIsSubmitting(false);
  };

  // ──── HANDLERS: DEPENDENTS ────

  const saveDependentsToSupabase = async (updatedDeps: Dependent[]) => {
    if (!user) return false;
    setSavingDependents(true);
    const { error } = await supabase
      .from('profiles')
      .update({ dependents: updatedDeps })
      .eq('id', user.id);

    setSavingDependents(false);
    if (error) {
      toast.error("Erro ao salvar dependentes: " + error.message);
      return false;
    }
    return true;
  };

  const handleAddDependent = async () => {
    if (!newDependent.full_name.trim() || !newDependent.cpf.trim()) {
      toast.error("Preencha pelo menos o nome e CPF do dependente.");
      return;
    }
    const updated = [...dependents, newDependent];
    const ok = await saveDependentsToSupabase(updated);
    if (ok) {
      setDependents(updated);
      setNewDependent(createEmptyDependent());
      setShowAddDependent(false);
      toast.success("Dependente adicionado com sucesso!");
    }
  };

  const handleSaveEditDependent = async () => {
    if (editingDepIndex === null || !editingDep) return;
    if (!editingDep.full_name.trim() || !editingDep.cpf.trim()) {
      toast.error("Nome e CPF são obrigatórios.");
      return;
    }
    const updated = dependents.map((d, i) => i === editingDepIndex ? editingDep : d);
    const ok = await saveDependentsToSupabase(updated);
    if (ok) {
      setDependents(updated);
      setEditingDepIndex(null);
      setEditingDep(null);
      toast.success("Dependente atualizado!");
    }
  };

  const handleDeleteDependent = async () => {
    if (deleteDepIndex === null) return;
    const updated = dependents.filter((_, i) => i !== deleteDepIndex);
    const ok = await saveDependentsToSupabase(updated);
    if (ok) {
      setDependents(updated);
      setDeleteDepIndex(null);
      toast.success("Dependente removido.");
    }
  };

  // ──── HELPERS ────

  const isPastHour = (timeStr: string) => {
    if (selectedDateStr !== todayStringSP) return false;
    const [h, m] = timeStr.split(':').map(Number);
    const currentH = nowInSP.getHours();
    const currentM = nowInSP.getMinutes();
    return h < currentH || (h === currentH && m <= currentM);
  };

  const isTimeBooked = (time: string) => bookedSlots.includes(time) || isPastHour(time);

  const isEditTimePast = (timeStr: string) => {
    if (!editDate) return false;
    const editDateStr = format(editDate, 'yyyy-MM-dd');
    if (editDateStr !== todayStringSP) return false;
    const [h, m] = timeStr.split(':').map(Number);
    return h < nowInSP.getHours() || (h === nowInSP.getHours() && m <= nowInSP.getMinutes());
  };

  const isEditTimeBooked = (time: string) => editBookedSlots.includes(time) || isEditTimePast(time);

  const getRelationshipLabel = (value: string) =>
    RELATIONSHIP_OPTIONS.find(r => r.value === value)?.label || value;

  const isTitular = accountType === "TITULAR";

  // ──── RENDER: TIME SLOTS (reusable) ────

  const renderTimeSlots = (slots: string[], checkFn: (t: string) => boolean, selected: string | null, onSelect: (t: string) => void) => (
    <div className="grid grid-cols-3 gap-2">
      {slots.map((time) => {
        const disabled = checkFn(time);
        return (
          <Button
            key={time}
            variant={selected === time ? "default" : "outline"}
            className={`h-10 text-xs font-semibold rounded-md border-slate-200 ${selected === time ? 'bg-[#1E3A8A] text-white shadow-md' : 'hover:border-[#1E3A8A] hover:bg-blue-50/50'} ${disabled ? 'hidden' : ''}`}
            disabled={disabled}
            onClick={() => onSelect(time)}
          >
            {time}
          </Button>
        );
      })}
    </div>
  );

  // ──── MAIN RENDER ────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="container mx-auto max-w-5xl px-4 h-16 flex items-center justify-between">
          <div className="font-bold text-[#1E3A8A] text-xl font-royalmed">RoyalMed Health</div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/planos")}
              className="text-[#dde400] hover:text-blue-700 hover:bg-blue-50 hidden sm:inline-flex"
            >
              <Crown className="h-4 w-4 mr-1.5" />
              Planos
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/minha-assinatura")}
              className="text-[#1E3A8A] hover:bg-blue-50 hidden sm:inline-flex"
            >
              <CreditCard className="h-4 w-4 mr-1.5" />
              Assinatura
            </Button>
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

      {/* Tabs Navigation */}
      <main className="container mx-auto max-w-6xl px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-12 bg-white border shadow-sm">
            <TabsTrigger value="agendar" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold transition-all">
              <CalendarIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Agendar</span>
            </TabsTrigger>
            <TabsTrigger value="agendamentos" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold transition-all">
              <ClipboardList className="h-4 w-4" />
              <span className="hidden sm:inline">Meus Agendamentos</span>
            </TabsTrigger>
            <TabsTrigger value="dependentes" className="flex items-center gap-2 data-[state=active]:bg-[#1E3A8A] data-[state=active]:text-white font-semibold transition-all">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Dependentes</span>
            </TabsTrigger>
          </TabsList>

          {/* ═══════════════════════════════ TAB 1: AGENDAR ═══════════════════════════════ */}
          <TabsContent value="agendar">
            <div className="grid gap-8 md:grid-cols-12">
              <div className="md:col-span-8 flex flex-col gap-8">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Calendar Card */}
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

                  {/* Time Slots Card */}
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
                            {renderTimeSlots(MORNING_SLOTS, isTimeBooked, selectedTime, setSelectedTime)}
                          </div>
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[10px] text-slate-400 tracking-wider mb-3">
                              <span className="w-8 h-[1px] bg-slate-200"></span>
                              PERÍODO DA TARDE
                            </h4>
                            {renderTimeSlots(AFTERNOON_SLOTS, isTimeBooked, selectedTime, setSelectedTime)}
                          </div>
                          <div>
                            <h4 className="flex items-center gap-2 font-bold text-[10px] text-slate-400 tracking-wider mb-3">
                              <span className="w-8 h-[1px] bg-slate-200"></span>
                              PERÍODO NOTURNO
                            </h4>
                            {renderTimeSlots(EVENING_SLOTS, isTimeBooked, selectedTime, setSelectedTime)}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Confirmation Banner */}
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
                          <div className="flex flex-col gap-3 pt-2">
                            <div className="flex justify-center md:justify-start gap-3">
                              <select
                                value={specialty}
                                onChange={(e) => setSpecialty(e.target.value)}
                                className="text-sm px-4 py-2 rounded-lg font-bold bg-white text-[#1E3A8A] shadow-lg focus:outline-none cursor-pointer"
                              >
                                {SPECIALTIES.map(spec => (
                                  <option key={spec} value={spec}>{spec}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex justify-center md:justify-start gap-3">
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

              {/* Quick View: My Appointments Sidebar */}
              <div className="md:col-span-4">
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle className="text-lg">Próximos Agendamentos</CardTitle>
                    <CardDescription>
                      {myAppointments.length > 0
                        ? `${myAppointments.length} agendamento(s)`
                        : "Nenhum agendamento"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {myAppointments.length === 0 ? (
                      <div className="text-center py-8 text-sm text-slate-500">
                        Você não tem nenhum agendamento futuro.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myAppointments.slice(0, 5).map((app) => (
                          <div key={app.id} className="p-3 border rounded-lg bg-white shadow-sm flex items-center justify-between gap-2 hover:border-slate-300 transition-colors">
                            <div>
                              <span className="font-bold text-sm text-slate-800">{app.date.split('-').reverse().join('/')}</span>
                              <span className="text-xs text-[#1E3A8A] ml-2">{app.time?.substring(0, 5)}</span>
                            </div>
                            <Badge variant="outline" className="text-[10px] capitalize">{app.type === 'telemedicina' ? 'Tele' : 'Local'}</Badge>
                          </div>
                        ))}
                        {myAppointments.length > 5 && (
                          <Button variant="link" size="sm" className="w-full text-[#1E3A8A]" onClick={() => setActiveTab("agendamentos")}>
                            Ver todos ({myAppointments.length})
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════════════════════════ TAB 2: MEUS AGENDAMENTOS ═══════════════════════════════ */}
          <TabsContent value="agendamentos">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <ClipboardList className="h-5 w-5 text-[#1E3A8A]" />
                      Meus Agendamentos
                    </CardTitle>
                    <CardDescription>{myAppointments.length} agendamento(s) encontrado(s)</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab("agendar")} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Agendamento
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {myAppointments.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Nenhum agendamento</p>
                    <p className="text-sm mt-1">Clique em "Novo Agendamento" para começar.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {myAppointments.map((app) => {
                      const isPast = app.date < todayStringSP;
                      return (
                        <div
                          key={app.id}
                          className={`p-5 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md ${isPast ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-[#1E3A8A]/10 rounded-lg p-3 text-center min-w-[60px]">
                              <span className="block text-lg font-bold text-[#1E3A8A]">{app.date.split('-')[2]}</span>
                              <span className="block text-[10px] font-medium text-slate-500 uppercase">
                                {format(new Date(app.date + 'T12:00:00'), 'MMM', { locale: ptBR })}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-800">
                                  {app.specialty || "Geral"} - {format(new Date(app.date + 'T12:00:00'), "EEEE", { locale: ptBR })}
                                </span>
                                <span className="text-[#1E3A8A] font-bold">{app.time?.substring(0, 5)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-[10px] capitalize">
                                  {app.type === 'telemedicina' ? '📱 Telemedicina' : '🏥 Presencial'}
                                </Badge>
                                <Badge className={`text-[10px] ${isPast ? 'bg-slate-200 text-slate-600' : 'bg-green-100 text-green-700'} border-none`}>
                                  {isPast ? 'Realizada' : 'Agendado'}
                                </Badge>
                              </div>
                            </div>
                          </div>

                          {!isPast && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs font-medium text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-blue-50"
                                onClick={() => openEditAppointment(app)}
                              >
                                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                                Editar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 text-xs font-medium text-rose-600 border-rose-200 hover:bg-rose-50"
                                disabled={deletingId === app.id}
                                onClick={() => setAppointmentAction({id: app.id, date: app.date, time: app.time, actionType: 'delete'})}
                              >
                                {deletingId === app.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1.5" />}
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ═══════════════════════════════ TAB 3: DEPENDENTES ═══════════════════════════════ */}
          <TabsContent value="dependentes">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Users className="h-5 w-5 text-[#1E3A8A]" />
                      Meus Dependentes
                    </CardTitle>
                    <CardDescription>
                      {isTitular
                        ? `${dependents.length} dependente(s) cadastrado(s)`
                        : "Gerencie seus dependentes de primeiro grau"}
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => { setNewDependent(createEmptyDependent()); setShowAddDependent(true); }}
                    className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
                    disabled={savingDependents}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingDependents ? (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  </div>
                ) : dependents.length === 0 ? (
                  <div className="text-center py-16 text-slate-500">
                    <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg font-medium">Nenhum dependente</p>
                    <p className="text-sm mt-1">Adicione familiares de primeiro grau para gerenciá-los aqui.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {dependents.map((dep, index) => (
                      <div key={index} className="p-5 border rounded-xl bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-all">
                        <div className="flex items-center gap-4">
                          <div className="bg-amber-100 rounded-full p-3 text-center min-w-[48px] min-h-[48px] flex items-center justify-center">
                            <span className="text-lg">👤</span>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{dep.full_name}</p>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-[10px]">
                                {getRelationshipLabel(dep.relationship)}
                              </Badge>
                              {dep.cpf && (
                                <span className="text-xs text-slate-400">CPF: {dep.cpf}</span>
                              )}
                              {dep.phone && (
                                <span className="text-xs text-slate-400">📱 {dep.phone}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs text-[#1E3A8A] border-[#1E3A8A]/30 hover:bg-blue-50"
                            onClick={() => { setEditingDepIndex(index); setEditingDep({ ...dep }); }}
                            disabled={savingDependents}
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1.5" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs text-rose-600 border-rose-200 hover:bg-rose-50"
                            onClick={() => setDeleteDepIndex(index)}
                            disabled={savingDependents}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Remover
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* ═══════════════════════════════ MODALS ═══════════════════════════════ */}

      {/* Cancel/Reschedule Confirmation Dialog */}
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
              <span className="block bg-blue-50 border border-blue-200 text-[#dde400] p-3 rounded-md text-sm font-medium mt-4">
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

      {/* Edit Appointment Dialog */}
      <Dialog open={!!editingAppointment} onOpenChange={(open) => !open && setEditingAppointment(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#1E3A8A]" />
              Editar Agendamento
            </DialogTitle>
            <DialogDescription>Altere a data, horário ou tipo de atendimento.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Date picker */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Data</Label>
              <div className="flex justify-center">
                <Calendar
                  mode="single"
                  selected={editDate}
                  onSelect={setEditDate}
                  disabled={(d) => {
                    const dStr = format(d, 'yyyy-MM-dd');
                    return dStr < todayStringSP || d.getDay() === 0 || d.getDay() === 6;
                  }}
                  locale={ptBR}
                  className="p-0 pointer-events-auto"
                />
              </div>
            </div>

            {/* Time slots */}
            {editDate && (
              <div>
                <Label className="text-sm font-semibold mb-2 block">Horário</Label>
                {loadingEditSlots ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">MANHÃ</p>
                      {renderTimeSlots(MORNING_SLOTS, isEditTimeBooked, editTime, setEditTime)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">TARDE</p>
                      {renderTimeSlots(AFTERNOON_SLOTS, isEditTimeBooked, editTime, setEditTime)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-2">NOITE</p>
                      {renderTimeSlots(EVENING_SLOTS, isEditTimeBooked, editTime, setEditTime)}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Specialty */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Especialidade</Label>
              <select
                value={editSpecialty}
                onChange={(e) => setEditSpecialty(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-lg font-semibold border-2 border-slate-200 text-slate-700 bg-white focus:border-[#1E3A8A] focus:outline-none transition-all cursor-pointer"
              >
                <option value="Dentista">Dentista</option>
                <option value="Psicologia">Psicologia</option>
                <option value="Nutrição">Nutrição</option>
                <option value="Exame de Vista">Exame de Vista</option>
              </select>
            </div>

            {/* Attendance type */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Tipo de Atendimento</Label>
              <div className="flex gap-3">
                <button
                  onClick={() => setEditType('local')}
                  className={`flex-1 text-sm px-4 py-3 rounded-lg font-semibold border-2 transition-all ${editType === 'local' ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  🏥 Presencial
                </button>
                <button
                  onClick={() => setEditType('telemedicina')}
                  className={`flex-1 text-sm px-4 py-3 rounded-lg font-semibold border-2 transition-all ${editType === 'telemedicina' ? 'border-[#1E3A8A] bg-[#1E3A8A]/5 text-[#1E3A8A]' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}
                >
                  📱 Telemedicina
                </button>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingAppointment(null)}>Cancelar</Button>
            <Button
              onClick={handleSaveAppointment}
              disabled={isSubmitting || !editDate || !editTime}
              className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dependent Dialog */}
      <Dialog open={showAddDependent} onOpenChange={(open) => !open && setShowAddDependent(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-[#1E3A8A]" />
              Adicionar Dependente
            </DialogTitle>
            <DialogDescription>Preencha os dados do novo dependente.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Parentesco</Label>
              <select
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={newDependent.relationship}
                onChange={(e) => setNewDependent({ ...newDependent, relationship: e.target.value })}
              >
                {RELATIONSHIP_OPTIONS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>Nome Completo *</Label>
              <Input value={newDependent.full_name} onChange={(e) => setNewDependent({ ...newDependent, full_name: e.target.value })} placeholder="Nome do dependente" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>CPF *</Label>
                <Input value={newDependent.cpf} onChange={(e) => setNewDependent({ ...newDependent, cpf: e.target.value })} placeholder="000.000.000-00" />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input value={newDependent.phone} onChange={(e) => setNewDependent({ ...newDependent, phone: e.target.value })} placeholder="(00) 90000-0000" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={newDependent.email} onChange={(e) => setNewDependent({ ...newDependent, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDependent(false)}>Cancelar</Button>
            <Button onClick={handleAddDependent} disabled={savingDependents} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              {savingDependents ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dependent Dialog */}
      <Dialog open={editingDepIndex !== null && !!editingDep} onOpenChange={(open) => { if (!open) { setEditingDepIndex(null); setEditingDep(null); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-5 w-5 text-[#1E3A8A]" />
              Editar Dependente
            </DialogTitle>
          </DialogHeader>
          {editingDep && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Parentesco</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editingDep.relationship}
                  onChange={(e) => setEditingDep({ ...editingDep, relationship: e.target.value })}
                >
                  {RELATIONSHIP_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>Nome Completo *</Label>
                <Input value={editingDep.full_name} onChange={(e) => setEditingDep({ ...editingDep, full_name: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>CPF *</Label>
                  <Input value={editingDep.cpf} onChange={(e) => setEditingDep({ ...editingDep, cpf: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={editingDep.phone} onChange={(e) => setEditingDep({ ...editingDep, phone: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={editingDep.email} onChange={(e) => setEditingDep({ ...editingDep, email: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingDepIndex(null); setEditingDep(null); }}>Cancelar</Button>
            <Button onClick={handleSaveEditDependent} disabled={savingDependents} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
              {savingDependents ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dependent Confirmation */}
      <AlertDialog open={deleteDepIndex !== null} onOpenChange={(open) => !open && setDeleteDepIndex(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Dependente</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <span className="font-bold">{deleteDepIndex !== null ? dependents[deleteDepIndex]?.full_name : ''}</span> da sua lista de dependentes? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteDependent} className="bg-rose-600 hover:bg-rose-700">
              Sim, remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
