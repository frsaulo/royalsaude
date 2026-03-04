import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft, ShieldAlert } from "lucide-react";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Checar se o usuário logado possui cargo de admin nos profiles
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;

      if (profileData?.is_admin) {
         toast.success("Acesso administrativo autorizado!");
         navigate("/admin-dashboard");
      } else {
         // Fazer logout instantâneo para garantir que ele não transite lá
         await supabase.auth.signOut();
         toast.error("Você não tem permissões de Administrador.");
      }

    } catch (error: any) {
      let errorMessage = error.message || "Ocorreu um erro durante a autenticação.";
      
      // Traduzir mensagens de erro conhecidas do Supabase
      if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "Usuário ou Senha administrativos inválidos.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-300 hover:text-white hover:bg-slate-800">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o site
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-2xl border-slate-700 bg-slate-800 text-white mt-12 mb-8">
        <form onSubmit={handleAuth}>
          <CardHeader className="space-y-1 pb-6 items-center">
            <div className="bg-red-500/20 p-3 rounded-full mb-2">
               <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-white">
              PAINEL ADMINISTRATIVO
            </CardTitle>
            <CardDescription className="text-center text-slate-400">
              Uso exclusivo administrativo. Login monitorado.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">Usuário (E-mail Master)</Label>
              <Input
                id="email"
                type="email"
                placeholder="royalsuper@royalsaude.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-slate-300">Senha Master</Label>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>

            <Button type="submit" className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white" disabled={loading}>
              {loading ? "Validando credenciais..." : "Acessar Sistema Admin"}
            </Button>
          </CardContent>
        </form>
      </Card>
      <div className="text-slate-500 text-xs text-center">
         Royal Saúde &copy; {new Date().getFullYear()} - Sistema de Agendamentos (V.Admin)
      </div>
    </div>
  );
};
