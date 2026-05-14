import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Tag, Trash2, ArrowLeft, Loader2, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
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

interface Coupon {
  id: string;
  code: string;
  type: "fixed" | "percentage";
  value: number;
  active: boolean;
  created_at: string;
}

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"fixed" | "percentage">("percentage");
  const [newValue, setNewValue] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', session.user.id)
        .single();

      if (!profile?.is_admin) {
        await supabase.auth.signOut();
        navigate("/admin");
        toast.error("Acesso negado.");
        return;
      }

      fetchCoupons();
    } catch (error) {
      console.error("Auth check failed:", error);
      navigate("/admin");
    }
  };

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCoupons(data || []);
    } catch (error: any) {
      toast.error("Erro ao carregar cupons: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCoupon = async () => {
    if (!newCode || !newValue) {
      toast.error("Preencha todos os campos do cupom.");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('coupons')
        .insert({
          code: newCode.toUpperCase().trim(),
          type: newType,
          value: parseFloat(newValue),
          active: true
        });

      if (error) {
        if (error.code === '23505') throw new Error("Já existe um cupom com este código.");
        throw error;
      }

      toast.success("Cupom criado com sucesso!");
      setIsModalOpen(false);
      setNewCode("");
      setNewValue("");
      fetchCoupons();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar cupom.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCoupons(prev => prev.filter(c => c.id !== id));
      toast.success("Cupom excluído com sucesso.");
    } catch (error: any) {
      toast.error("Erro ao excluir: " + error.message);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ active: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      fetchCoupons();
      toast.success(`Cupom ${!currentStatus ? 'ativado' : 'desativado'}.`);
    } catch (err: any) {
      toast.error("Erro ao atualizar status: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#1E3A8A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
             <Button variant="ghost" className="text-white hover:bg-slate-800 p-2" onClick={() => navigate("/admin-dashboard")}>
               <ArrowLeft className="w-5 h-5" />
             </Button>
             <div>
                <h1 className="text-xl font-bold">Gestão de Cupons</h1>
                <p className="text-xs text-slate-400">Descontos em assinaturas</p>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 py-8">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <Tag className="w-8 h-8 text-green-600" />
              Cupons de Desconto
            </h2>
            <p className="text-slate-500 mt-1">
              Cupons são válidos apenas para a primeira assinatura e não se aplicam a consultas.
            </p>
          </div>
          <Button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4 mr-2" /> Novo Cupom
          </Button>
        </div>

        {coupons.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-slate-100">
            <Tag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">Nenhum cupom cadastrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon) => (
              <Card key={coupon.id} className="relative overflow-hidden hover:shadow-md transition-shadow border-slate-200">
                <div className={`absolute top-0 left-0 w-1 h-full ${coupon.active ? 'bg-green-500' : 'bg-slate-300'}`}></div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl font-black tracking-widest text-slate-800 uppercase">
                        {coupon.code}
                      </CardTitle>
                      <CardDescription className="font-medium text-green-600 mt-1">
                        Desconto: {coupon.type === 'percentage' ? `${coupon.value}%` : `R$ ${coupon.value.toFixed(2)}`}
                      </CardDescription>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${coupon.active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                      {coupon.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-xs text-slate-400">
                    Criado em: {format(new Date(coupon.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="flex justify-between items-center pt-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className={`flex-1 ${coupon.active ? 'text-slate-600 hover:bg-slate-100' : 'text-green-600 hover:bg-green-50 border-green-200'}`}
                      onClick={() => toggleStatus(coupon.id, coupon.active)}
                    >
                      {coupon.active ? 'Desativar' : 'Ativar'}
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50 border border-red-100 flex-1">
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Excluir cupom</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o cupom <strong>{coupon.code}</strong>? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(coupon.id)} className="bg-red-600 hover:bg-red-700">
                            Sim, excluir
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Cupom de Desconto</DialogTitle>
            <DialogDescription>
              Crie um novo código para os clientes usarem na primeira assinatura.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Código do Cupom</Label>
              <Input
                id="code"
                placeholder="EX: BEMVINDO10"
                value={newCode}
                onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                className="uppercase font-bold tracking-widest"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <select 
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-950"
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as "fixed" | "percentage")}
                >
                  <option value="percentage">Porcentagem (%)</option>
                  <option value="fixed">Valor Fixo (R$)</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  placeholder={newType === "percentage" ? "10" : "50.00"}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex items-start gap-2 bg-amber-50 p-3 rounded text-amber-800 text-xs mt-2 border border-amber-200">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Os cupons não são cumulativos e aplicam-se apenas à primeira assinatura. O valor não se aplica a consultas.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
            <Button onClick={handleCreateCoupon} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Salvar Cupom
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
