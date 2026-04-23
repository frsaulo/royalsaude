import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Login } from "./pages/Login";
import { Agenda } from "./pages/Agenda";
import { Planos } from "./pages/Planos";
import { Checkout } from "./components/Checkout";
import { MinhaAssinatura } from "./components/MinhaAssinatura";
import { AdminLogin } from "./pages/AdminLogin";
import { AdminDashboard } from "./pages/AdminDashboard";
import { PoliticaPrivacidade } from "./pages/PoliticaPrivacidade";
import { ContratoAdesao } from "./pages/ContratoAdesao";
import { PoliticaCancelamento } from "./pages/PoliticaCancelamento";
import { PagamentoConfirmado } from "./pages/PagamentoConfirmado";
import WhatsAppButton from "./components/WhatsAppButton";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Autenticação */}
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            
            {/* Área do Paciente */}
            <Route 
              path="/agenda" 
              element={
                <ProtectedRoute>
                  <Agenda />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/checkout" 
              element={
                <ProtectedRoute>
                  <Checkout />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/minha-assinatura" 
              element={
                <ProtectedRoute>
                  <MinhaAssinatura />
                </ProtectedRoute>
              } 
            />

            {/* Páginas Públicas */}
            <Route path="/planos" element={<Planos />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/contrato-adesao" element={<ContratoAdesao />} />
            <Route path="/politica-cancelamento" element={<PoliticaCancelamento />} />
            <Route path="/pagamento-confirmado" element={<PagamentoConfirmado />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <WhatsAppButton />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
