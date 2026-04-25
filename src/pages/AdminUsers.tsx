import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Loader2, 
  LogOut, 
  ShieldAlert, 
  Edit, 
  Trash2, 
  ChevronLeft,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Plus,
  UserPlus,
  ArrowLeft
} from "lucide-react";
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
  DialogDescription,
} from "../components/ui/dialog";
import { Badge } from "../components/ui/badge";
import { Label } from "../components/ui/label";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  ACTIVE: { label: "Ativa", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  PENDING: { label: "Pendente", color: "bg-yellow-100 text-yellow-700 border-yellow-200", icon: Clock },
  SUSPENDED: { label: "Suspensa", color: "bg-red-100 text-red-700 border-red-200", icon: AlertTriangle },
  CANCELLED: { label: "Cancelada", color: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
  EXPIRED: { label: "Expirada", color: "bg-slate-100 text-slate-600 border-slate-200", icon: XCircle },
};

const relationshipLabelMap: Record<string, string> = {
  ESPOSA: "Esposa",
  MARIDO: "Marido",
  FILHO: "Filho",
  FILHA: "Filha",
  PAI: "Pai",
  MAE: "Mãe",
  TITULAR: "Titular",
};

interface Profile {
  id: string;
  full_name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  account_type: string;
  dependents: any[];
  created_at: string;
  subscriptions: any[];
  appointment_count?: number;
}

interface FlattenedUser {
  id: string; // titular id
  isDependent: boolean;
  dependentIndex?: number;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  type: string;
  relationship: string;
  subscriptionStatus: string;
  titularName?: string;
  appointmentsCount: number;
}

export const AdminUsers = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [flattenedUsers, setFlattenedUsers] = useState<FlattenedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<FlattenedUser | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDependentDialogOpen, setIsAddDependentDialogOpen] = useState(false);
  const [targetTitularId, setTargetTitularId] = useState<string | null>(null);
  const [newDependent, setNewDependent] = useState({
    full_name: "",
    cpf: "",
    relationship: "FILHO",
    email: "",
    phone: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    checkAdminAndFetchData();
  }, []);

  const checkAdminAndFetchData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/admin");
        return;
      }

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

      fetchData();
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/admin");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles excluding admins
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Busca assinaturas ordenadas pela mais recente
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('user_id, status, created_at')
        .order('created_at', { ascending: false });

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
      } else {
        console.log(`Fetched ${subsData?.length || 0} subscriptions for admin mapping`);
      }

      // Create a map: pega sempre a assinatura mais recente (dados já ordenados por created_at DESC)
      const subMap = new Map();
      (subsData || []).forEach(s => {
        // Só guarda o primeiro encontrado (mais recente) para cada user_id
        if (!subMap.has(s.user_id)) {
          subMap.set(s.user_id, (s.status || "NONE").toUpperCase());
        }
      });
      
      console.log('Francisco status mapping:', subMap.get('e41eaacc-93d0-46ee-a0c3-05209b7fa268'));

      // Fetch appointment counts
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('user_id, patient_name');

      if (appointmentsError) throw appointmentsError;

      // Flatten data: Titulars + Dependents
      const allUsers: FlattenedUser[] = [];

      (profilesData || []).forEach((p: any) => {
        const subStatus = subMap.get(p.id) || "NONE";
        const titularAppointments = appointmentsData?.filter(a => a.user_id === p.id && (a.patient_name === 'Paciente Cadastrado' || a.patient_name === p.full_name)).length || 0;

        // Add Titular
        allUsers.push({
          id: p.id,
          isDependent: false,
          name: p.full_name || "Sem Nome",
          cpf: p.cpf || "Sem CPF",
          phone: p.phone || "Sem Telefone",
          email: p.email || "Sem E-mail",
          address: p.address || "",
          type: "TITULAR",
          relationship: "TITULAR",
          subscriptionStatus: subStatus,
          appointmentsCount: titularAppointments
        });

        // Add Dependents
        const dependents = Array.isArray(p.dependents) ? p.dependents : [];
        dependents.forEach((d: any, index: number) => {
          const depAppointments = appointmentsData?.filter(a => a.user_id === p.id && a.patient_name === d.full_name).length || 0;
          allUsers.push({
            id: p.id, // uses titular id for reference
            isDependent: true,
            dependentIndex: index,
            name: d.full_name || "Sem Nome",
            cpf: d.cpf || "Sem CPF",
            phone: d.phone || p.phone || "Sem Telefone",
            email: d.email || p.email || "Sem E-mail",
            address: p.address || "", // inherits titular address
            type: "DEPENDENTE",
            relationship: d.relationship || "DEPENDENTE",
            subscriptionStatus: subStatus, // inherits titular subscription
            titularName: p.full_name,
            appointmentsCount: depAppointments
          });
        });
      });

      setFlattenedUsers(allUsers);
    } catch (error: any) {
      toast.error("Erro ao carregar dados: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDependent = (titularId: string) => {
    setTargetTitularId(titularId);
    setNewDependent({
      full_name: "",
      cpf: "",
      relationship: "FILHO",
      email: "",
      phone: ""
    });
    setIsAddDependentDialogOpen(true);
  };

  const saveNewDependent = async () => {
    if (!targetTitularId || !newDependent.full_name) return;
    setIsSaving(true);
    try {
      const { data: pData } = await supabase
        .from('profiles')
        .select('dependents')
        .eq('id', targetTitularId)
        .single();
      
      const currentDependents = Array.isArray(pData?.dependents) ? pData.dependents : [];
      const updatedDependents = [...currentDependents, newDependent];

      const { error } = await supabase
        .from('profiles')
        .update({ dependents: updatedDependents })
        .eq('id', targetTitularId);

      if (error) throw error;

      toast.success("Dependente adicionado com sucesso!");
      setIsAddDependentDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao adicionar dependente: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (user: FlattenedUser) => {
    setEditingUser(user);
    setIsEditDialogOpen(true);
  };

  const handleSaveUser = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      if (editingUser.isDependent) {
        // Update dependent in JSONB
        const { data: pData } = await supabase
          .from('profiles')
          .select('dependents')
          .eq('id', editingUser.id)
          .single();
        
        if (pData) {
          const newDependents = [...(pData.dependents || [])];
          if (editingUser.dependentIndex !== undefined) {
            newDependents[editingUser.dependentIndex] = {
              ...newDependents[editingUser.dependentIndex],
              full_name: editingUser.name,
              cpf: editingUser.cpf,
              phone: editingUser.phone,
              email: editingUser.email,
              relationship: editingUser.relationship
            };

            const { error } = await supabase
              .from('profiles')
              .update({ dependents: newDependents })
              .eq('id', editingUser.id);
            
            if (error) throw error;
          }
        }
      } else {
        // Update titular profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: editingUser.name,
            cpf: editingUser.cpf,
            phone: editingUser.phone,
            email: editingUser.email,
            address: editingUser.address
          })
          .eq('id', editingUser.id);
        
        if (error) throw error;

        // Upsert subscription status (funciona mesmo se não existir ainda)
        const { data: existingSub } = await supabase
          .from('subscriptions')
          .select('id')
          .eq('user_id', editingUser.id)
          .maybeSingle();

        if (existingSub) {
          // Atualiza assinatura existente
          const { error: subError } = await supabase
            .from('subscriptions')
            .update({ status: editingUser.subscriptionStatus, updated_at: new Date().toISOString() })
            .eq('user_id', editingUser.id);
          if (subError) console.warn("Erro ao atualizar status:", subError.message);
        } else if (editingUser.subscriptionStatus !== "NONE") {
          // Cria assinatura manual quando não existe nenhuma
          const { error: insertError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: editingUser.id,
              status: editingUser.subscriptionStatus,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          if (insertError) console.warn("Erro ao criar assinatura:", insertError.message);
        }
      }

      toast.success("Usuário atualizado com sucesso!");
      setIsEditDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (user: FlattenedUser) => {
    try {
      if (user.isDependent) {
        // Remove from JSONB
        const { data: pData } = await supabase
          .from('profiles')
          .select('dependents')
          .eq('id', user.id)
          .single();
        
        if (pData) {
          const newDependents = pData.dependents.filter((_: any, i: number) => i !== user.dependentIndex);
          const { error } = await supabase
            .from('profiles')
            .update({ dependents: newDependents })
            .eq('id', user.id);
          if (error) throw error;
        }
      } else {
        // Call Edge Function to delete from Auth and Profiles
        const { data, error } = await supabase.functions.invoke('admin-delete-user', {
          body: { userId: user.id }
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);
      }

      toast.success("Usuário removido com sucesso.");
      fetchData();
    } catch (error: any) {
      toast.error("Erro ao remover: " + error.message);
    }
  };

  const filteredUsers = flattenedUsers.filter(u => {
    const term = searchTerm.toLowerCase();
    return u.name.toLowerCase().includes(term) || 
           u.cpf.toLowerCase().includes(term) || 
           u.email.toLowerCase().includes(term) ||
           (u.titularName?.toLowerCase().includes(term) || '');
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-white mb-4" />
        <p className="text-white text-lg">Carregando base de usuários...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => navigate("/admin-dashboard")} className="text-slate-300 hover:text-white">
                <ChevronLeft className="w-6 h-6" />
             </Button>
             <div>
                <h1 className="text-xl font-bold">Gestão de Usuários</h1>
                <p className="text-xs text-slate-400">Base de dados RoyalMed</p>
             </div>
          </div>
          
          <Button variant="ghost" onClick={() => navigate("/admin-dashboard")} className="text-slate-300 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            <span className="hidden sm:block">Voltar ao Painel</span>
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Buscar por nome, CPF ou e-mail..."
              className="pl-10 h-12 shadow-sm border-slate-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total de Registros</p>
                <p className="text-2xl font-bold text-slate-900">{filteredUsers.length}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredUsers.length === 0 ? (
            <Card className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhum usuário encontrado com os termos da busca.</p>
            </Card>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Usuário</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">CPF</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo / Vínculo</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Assinatura</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Contato</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Consultas</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUsers.map((user, idx) => {
                      const sub = statusConfig[user.subscriptionStatus] || { label: "Sem Plano", color: "bg-slate-100 text-slate-500", icon: XCircle };
                      return (
                        <tr key={`${user.id}-${user.name}-${idx}`} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            {user.isDependent && (
                              <div className="text-[10px] text-slate-500">Titular: {user.titularName}</div>
                            )}
                            <div className="text-[10px] text-slate-400 mt-1 max-w-[200px] truncate">
                               <MapPin className="w-3 h-3 inline mr-1" />
                               {user.address || "Sem endereço cadastrado"}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                            {user.cpf}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className={user.isDependent ? "bg-purple-50 text-purple-700 border-purple-100" : "bg-blue-50 text-blue-700 border-blue-100"}>
                              {relationshipLabelMap[user.relationship] || user.relationship}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${sub.color}`}>
                              <sub.icon className="w-3 h-3 mr-1" />
                              {sub.label}
                            </div>
                          </td>
                          <td className="px-6 py-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Phone className="w-3 h-3 text-slate-400" /> {user.phone}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <Mail className="w-3 h-3 text-slate-400" /> {user.email}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-1.5">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="font-bold text-slate-900">{user.appointmentsCount}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEdit(user)} title="Editar" className="text-blue-600 hover:bg-blue-50">
                                <Edit className="w-4 h-4" />
                              </Button>
                              {!user.isDependent && (
                                <Button variant="ghost" size="icon" onClick={() => handleAddDependent(user.id)} title="Novo Dependente" className="text-green-600 hover:bg-green-50">
                                  <UserPlus className="w-4 h-4" />
                                </Button>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Excluir Usuário</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Você tem certeza que deseja remover <strong>{user.name}</strong>?
                                      Esta ação removerá o acesso desta pessoa ao sistema.
                                      {!user.isDependent && <p className="text-red-600 mt-2 font-bold">AVISO: Ao excluir um titular, todos os seus dependentes também poderão perder o acesso.</p>}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteUser(user)} className="bg-red-600 hover:bg-red-700">
                                      Confirmar Exclusão
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Dados do Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações cadastrais abaixo.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome Completo</Label>
                <Input 
                  value={editingUser?.name || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, name: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input 
                  value={editingUser?.cpf || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, cpf: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input 
                  value={editingUser?.phone || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, phone: e.target.value} : null)}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>E-mail</Label>
                <Input 
                  value={editingUser?.email || ""} 
                  onChange={(e) => setEditingUser(prev => prev ? {...prev, email: e.target.value} : null)}
                />
              </div>
              {!editingUser?.isDependent && (
                <>
                  <div className="space-y-2 col-span-2">
                    <Label>Endereço Completo</Label>
                    <Input 
                      value={editingUser?.address || ""} 
                      onChange={(e) => setEditingUser(prev => prev ? {...prev, address: e.target.value} : null)}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Status da Assinatura</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editingUser?.subscriptionStatus}
                      onChange={(e) => setEditingUser(prev => prev ? {...prev, subscriptionStatus: e.target.value} : null)}
                    >
                      <option value="NONE">Sem Plano</option>
                      <option value="ACTIVE">Ativa</option>
                      <option value="PENDING">Pendente</option>
                      <option value="SUSPENDED">Suspensa</option>
                      <option value="CANCELLED">Cancelada</option>
                      <option value="EXPIRED">Expirada</option>
                    </select>
                  </div>
                </>
              )}
              {editingUser?.isDependent && (
                 <div className="space-y-2 col-span-2">
                    <Label>Parentesco</Label>
                    <select
                      className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editingUser.relationship}
                      onChange={(e) => setEditingUser(prev => prev ? {...prev, relationship: e.target.value} : null)}
                    >
                      <option value="ESPOSA">ESPOSA</option>
                      <option value="MARIDO">MARIDO</option>
                      <option value="FILHO">FILHO</option>
                      <option value="FILHA">FILHA</option>
                      <option value="PAI">PAI</option>
                      <option value="MAE">MÃE</option>
                    </select>
                 </div>
              )}
            </div>
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
               Cancelar
             </Button>
             <Button onClick={handleSaveUser} disabled={isSaving} className="bg-[#1E3A8A] hover:bg-[#1E3A8A]/90">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Salvar Alterações
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dependent Dialog */}
      <Dialog open={isAddDependentDialogOpen} onOpenChange={setIsAddDependentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Dependente</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo dependente para este titular.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input 
                value={newDependent.full_name} 
                onChange={(e) => setNewDependent(prev => ({...prev, full_name: e.target.value}))}
                placeholder="Nome do dependente"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CPF</Label>
                <Input 
                  value={newDependent.cpf} 
                  onChange={(e) => setNewDependent(prev => ({...prev, cpf: e.target.value}))}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label>Parentesco</Label>
                <select
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={newDependent.relationship}
                  onChange={(e) => setNewDependent(prev => ({...prev, relationship: e.target.value}))}
                >
                  <option value="FILHO">FILHO</option>
                  <option value="FILHA">FILHA</option>
                  <option value="ESPOSA">ESPOSA</option>
                  <option value="MARIDO">MARIDO</option>
                  <option value="PAI">PAI</option>
                  <option value="MAE">MÃE</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>E-mail (Opcional)</Label>
              <Input 
                value={newDependent.email} 
                onChange={(e) => setNewDependent(prev => ({...prev, email: e.target.value}))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label>Telefone (Opcional)</Label>
              <Input 
                value={newDependent.phone} 
                onChange={(e) => setNewDependent(prev => ({...prev, phone: e.target.value}))}
                placeholder="(00) 00000-0000"
              />
            </div>
          </div>

          <DialogFooter>
             <Button variant="outline" onClick={() => setIsAddDependentDialogOpen(false)}>
               Cancelar
             </Button>
             <Button onClick={saveNewDependent} disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Adicionar Dependente
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
