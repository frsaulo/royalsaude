import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { ArrowLeft } from "lucide-react";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Cadastro realizado! Verifique seu e-mail (caso necessário) ou faça o login.");
        setIsRegistering(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Login efetuado com sucesso!");
        navigate("/agenda");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocorreu um erro durante a autenticação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o site
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg border-0">
        <form onSubmit={handleAuth}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-[#1E3A8A]">
              {isRegistering ? "Criar Conta" : "Acesso Restrito"}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering
                ? "Preencha os dados para criar seu acesso à agenda."
                : "Entre com seu e-mail e senha para acessar a agenda da Royal Saúde."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90"
              disabled={loading}
            >
              {loading
                ? "Processando..."
                : isRegistering
                ? "Criar Conta"
                : "Entrar na Agenda"}
            </Button>
            <Button
              type="button"
              variant="link"
              className="text-sm text-slate-500"
              onClick={() => setIsRegistering(!isRegistering)}
            >
              {isRegistering
                ? "Já tem uma conta? Faça login"
                : "Não possui acesso? Cadastre-se"}
            </Button>
          </CardFooter>
        </form>
      </Card>
      <p className="mt-8 text-center text-sm text-slate-400">
        &copy; {new Date().getFullYear()} Royal Saúde. Todos os direitos reservados.
      </p>
    </div>
  );
};
