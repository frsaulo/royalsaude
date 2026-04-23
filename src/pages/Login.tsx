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

type AccountType = "TITULAR" | "DEPENDENTE";
type Relationship = "ESPOSA" | "MARIDO" | "FILHO" | "FILHA" | "PAI" | "MAE";

type DependentForm = {
  relationship: Relationship;
  fullName: string;
  cpf: string;
  phone: string;
  email: string;
};

const createEmptyDependent = (): DependentForm => ({
  relationship: "FILHO",
  fullName: "",
  cpf: "",
  phone: "",
  email: "",
});

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [accountType, setAccountType] = useState<AccountType>("TITULAR");
  const [dependents, setDependents] = useState<DependentForm[]>([]);

  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRegistering) {
        if (accountType === "TITULAR") {
          const invalidDependent = dependents.find(
            (dependent) =>
              !dependent.relationship ||
              !dependent.fullName.trim() ||
              !dependent.cpf.trim()
          );

          if (invalidDependent) {
            toast.error("Preencha parentesco, nome completo e CPF de todos os dependentes.");
            setLoading(false);
            return;
          }
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              cpf: cpf,
              phone: phone,
              account_type: accountType,
              dependents: accountType === "TITULAR"
                ? dependents.map((dependent) => ({
                    relationship: dependent.relationship,
                    full_name: dependent.fullName,
                    cpf: dependent.cpf,
                    phone: dependent.phone || null,
                    email: dependent.email || null,
                  }))
                : [],
            }
          }
        });
        if (error) throw error;
        
        // Se a confirmação de e-mail estiver desativada, a sessão já virá preenchida
        if (data.session) {
          toast.success("Cadastro realizado com sucesso!");
          navigate("/agenda");
        } else {
          toast.success("Cadastro realizado! Faça o login para continuar.");
          setIsRegistering(false);
        }
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
      let errorMessage = error.message || "Ocorreu um erro durante a autenticação.";
      
      // Traduzir mensagens de erro conhecidas do Supabase
      if (errorMessage.includes("Email not confirmed")) {
        errorMessage = "E-mail ainda não confirmado. Por favor, cheque sua caixa de entrada.";
      } else if (errorMessage.includes("Invalid login credentials")) {
        errorMessage = "E-mail ou senha incorretos.";
      } else if (errorMessage.includes("User already registered")) {
        errorMessage = "Este e-mail já está cadastrado em nosso sistema.";
      } else if (errorMessage.includes("Password should be at least")) {
        errorMessage = "A senha deve ter pelo menos 6 caracteres.";
      } else if (errorMessage.includes("email rate limit exceeded")) {
        errorMessage = "Nossos servidores de e-mail estão ocupados, aguarde alguns minutos antes de tentar novamente.";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const addDependent = () => {
    setDependents((prev) => [...prev, createEmptyDependent()]);
  };

  const removeDependent = (index: number) => {
    setDependents((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateDependent = (
    index: number,
    field: keyof DependentForm,
    value: string
  ) => {
    setDependents((prev) =>
      prev.map((dependent, currentIndex) =>
        currentIndex === index ? { ...dependent, [field]: value } : dependent
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md absolute top-4 left-4">
        <Button variant="ghost" onClick={() => navigate("/")} className="text-slate-600">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o site
        </Button>
      </div>

      <Card className="w-full max-w-md shadow-lg border-0 mt-12 mb-8">
        <form onSubmit={handleAuth}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight text-center text-[#1E3A8A]">
              {isRegistering ? "Criar Conta" : "Acesso Restrito"}
            </CardTitle>
            <CardDescription className="text-center">
              {isRegistering
                ? "Preencha todos os dados para criar seu acesso à agenda."
                : "Entre com seu e-mail e senha para acessar a agenda da RoyalMed Health."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">

            {isRegistering && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Tipo de Cadastro</Label>
                  <select
                    id="accountType"
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={accountType}
                    onChange={(e) => setAccountType(e.target.value as AccountType)}
                    required={isRegistering}
                  >
                    <option value="TITULAR">TITULAR</option>
                    <option value="DEPENDENTE">DEPENDENTE</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Nome Completo</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="João da Silva"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={isRegistering}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF</Label>
                    <Input
                      id="cpf"
                      type="text"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      required={isRegistering}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">WhatsApp</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="(00) 90000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required={false}
                    />
                  </div>
                </div>

                {accountType === "TITULAR" && (
                  <div className="space-y-4 rounded-lg border border-slate-200 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Dependentes</h3>
                        <p className="text-xs text-slate-500">
                          Adicione quantos dependentes quiser (primeiro grau).
                        </p>
                      </div>
                      <Button type="button" variant="outline" onClick={addDependent}>
                        + Adicionar dependente
                      </Button>
                    </div>

                    {dependents.map((dependent, index) => (
                      <div key={`dependent-${index}`} className="space-y-3 rounded-md border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-medium text-slate-600">Dependente {index + 1}</p>
                          <Button
                            type="button"
                            variant="ghost"
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                            onClick={() => removeDependent(index)}
                          >
                            Remover
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dependent-relationship-${index}`}>Parentesco</Label>
                          <select
                            id={`dependent-relationship-${index}`}
                            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                            value={dependent.relationship}
                            onChange={(e) => updateDependent(index, "relationship", e.target.value)}
                            required={isRegistering && accountType === "TITULAR"}
                          >
                            <option value="ESPOSA">ESPOSA</option>
                            <option value="MARIDO">MARIDO</option>
                            <option value="FILHO">FILHO</option>
                            <option value="FILHA">FILHA</option>
                            <option value="PAI">PAI</option>
                            <option value="MAE">MÃE</option>
                          </select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dependent-fullname-${index}`}>Nome Completo</Label>
                          <Input
                            id={`dependent-fullname-${index}`}
                            type="text"
                            placeholder="Nome do dependente"
                            value={dependent.fullName}
                            onChange={(e) => updateDependent(index, "fullName", e.target.value)}
                            required={isRegistering && accountType === "TITULAR"}
                          />
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor={`dependent-cpf-${index}`}>CPF</Label>
                            <Input
                              id={`dependent-cpf-${index}`}
                              type="text"
                              placeholder="000.000.000-00"
                              value={dependent.cpf}
                              onChange={(e) => updateDependent(index, "cpf", e.target.value)}
                              required={isRegistering && accountType === "TITULAR"}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor={`dependent-phone-${index}`}>Telefone/WhatsApp (opcional)</Label>
                            <Input
                              id={`dependent-phone-${index}`}
                              type="tel"
                              placeholder="(00) 90000-0000"
                              value={dependent.phone}
                              onChange={(e) => updateDependent(index, "phone", e.target.value)}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`dependent-email-${index}`}>E-mail (opcional)</Label>
                          <Input
                            id={`dependent-email-${index}`}
                            type="email"
                            placeholder="dependente@email.com"
                            value={dependent.email}
                            onChange={(e) => updateDependent(index, "email", e.target.value)}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

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
              className="w-full bg-[#1E3A8A] hover:bg-[#1E3A8A]/90 mt-2"
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
      
      <p className="text-center text-sm text-slate-400 pb-8">
        &copy; {new Date().getFullYear()} RoyalMed Health. Todos os direitos reservados.
      </p>
    </div>
  );
};

