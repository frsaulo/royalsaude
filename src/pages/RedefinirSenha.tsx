import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card";
import { Loader2, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function RedefinirSenha() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Verificar se há uma sessão ativa (vinda do link de recuperação)
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        // Se não houver sessão, talvez o link expirou ou o usuário entrou direto
        // No fluxo do Supabase, o link de reset coloca o usuário em uma sessão temporária
      }
    };
    checkSession();
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      toast.success("Senha alterada com sucesso!");
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        navigate("/login");
      }, 3000);

    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar senha.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg border-0 text-center p-8">
          <div className="h-20 w-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#1E3A8A] mb-2">Senha Alterada!</CardTitle>
          <CardDescription className="mb-6">
            Sua senha foi redefinida com sucesso. Você será redirecionado para o login em instantes.
          </CardDescription>
          <Button onClick={() => navigate("/login")} className="w-full bg-[#1E3A8A]">
            Ir para Login agora
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/login")} className="text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Login
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg border-0">
        <form onSubmit={handleReset}>
          <CardHeader className="space-y-1">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Lock className="h-6 w-6 text-[#1E3A8A]" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-[#1E3A8A]">
              Nova Senha
            </CardTitle>
            <CardDescription className="text-center">
              Crie uma nova senha segura para sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full bg-[#1E3A8A] h-11" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Atualizando...
                </>
              ) : (
                "Redefinir Senha"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
