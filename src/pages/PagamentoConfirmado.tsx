import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Clock, XCircle, ArrowRight, Loader2 } from "lucide-react";

type Status = "checking" | "active" | "pending" | "failed";

export function PagamentoConfirmado() {
  const [searchParams] = useSearchParams();
  const [status, setStatus]   = useState<Status>("checking");
  const [attempts, setAttempts] = useState(0);
  const { user } = useAuth();
  const navigate  = useNavigate();
  const ref       = searchParams.get("ref") ?? "";

  useEffect(() => {
    if (!ref || !user) return;

    const MAX = 12; // tenta por ~60s

    const check = async () => {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("status")
        .eq("pagbank_subscription_id", ref)
        .single();

      const st = sub?.status;
      if (st === "ACTIVE") { setStatus("active"); return; }
      if (st === "CANCELLED" || st === "SUSPENDED") { setStatus("failed"); return; }

      setAttempts(prev => {
        const next = prev + 1;
        if (next >= MAX) { setStatus("pending"); return next; }
        return next;
      });
    };

    check();
    const timer = setInterval(check, 5000);
    return () => clearInterval(timer);
  }, [ref, user]);

  // Para quando status mudar
  useEffect(() => {
    if (status !== "checking") return;
  }, [status]);

  const cards: Record<Status, JSX.Element> = {
    checking: (
      <div className="confirm-card">
        <Loader2 size={56} className="confirm-icon spin" style={{ color: "#2563eb" }} />
        <h1>Verificando seu pagamento…</h1>
        <p>Aguarde enquanto confirmamos o pagamento com o PagBank.</p>
        <div className="confirm-bar">
          <div className="confirm-bar-fill" style={{ width: `${(attempts / 12) * 100}%` }} />
        </div>
        <span className="confirm-sub">Tentativa {attempts + 1} de 12</span>
      </div>
    ),
    active: (
      <div className="confirm-card">
        <CheckCircle size={56} className="confirm-icon" style={{ color: "#16a34a" }} />
        <h1>Pagamento confirmado! 🎉</h1>
        <p>Sua assinatura RoyalMed Health está <strong>ativa</strong>. Aproveite todos os benefícios.</p>
        <button className="confirm-btn confirm-btn-green" onClick={() => navigate("/minha-assinatura")}>
          Ver minha assinatura <ArrowRight size={18} />
        </button>
      </div>
    ),
    pending: (
      <div className="confirm-card">
        <Clock size={56} className="confirm-icon" style={{ color: "#d97706" }} />
        <h1>Pagamento em processamento</h1>
        <p>
          O PagBank ainda está processando seu pagamento. Isso pode levar alguns minutos.
          Você receberá uma confirmação assim que for aprovado.
        </p>
        <button className="confirm-btn confirm-btn-yellow" onClick={() => navigate("/minha-assinatura")}>
          Acompanhar assinatura <ArrowRight size={18} />
        </button>
      </div>
    ),
    failed: (
      <div className="confirm-card">
        <XCircle size={56} className="confirm-icon" style={{ color: "#dc2626" }} />
        <h1>Pagamento não aprovado</h1>
        <p>Houve um problema com seu pagamento. Verifique os dados e tente novamente.</p>
        <button className="confirm-btn confirm-btn-red" onClick={() => navigate("/planos")}>
          Tentar novamente <ArrowRight size={18} />
        </button>
      </div>
    ),
  };

  return (
    <>
      <style>{`
        .confirm-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .confirm-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 3rem 2.5rem;
          text-align: center;
          max-width: 480px;
          width: 100%;
          backdrop-filter: blur(20px);
          animation: slideUp 0.4s ease;
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .confirm-icon { margin: 0 auto 1.5rem; display:block; }
        .spin { animation: rotate 1.2s linear infinite; }
        @keyframes rotate { to { transform: rotate(360deg); } }
        .confirm-card h1 {
          font-size: 1.6rem;
          font-weight: 700;
          color: #f1f5f9;
          margin-bottom: 0.75rem;
        }
        .confirm-card p {
          color: #94a3b8;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }
        .confirm-card strong { color: #e2e8f0; }
        .confirm-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .confirm-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
        .confirm-btn-green { background: #16a34a; color: #fff; }
        .confirm-btn-yellow { background: #d97706; color: #fff; }
        .confirm-btn-red    { background: #dc2626; color: #fff; }
        .confirm-bar {
          background: rgba(255,255,255,0.1);
          border-radius: 99px;
          height: 6px;
          margin-bottom: 0.5rem;
          overflow: hidden;
        }
        .confirm-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, #2563eb, #60a5fa);
          border-radius: 99px;
          transition: width 0.5s ease;
        }
        .confirm-sub {
          font-size: 0.8rem;
          color: #64748b;
        }
      `}</style>
      <div className="confirm-page">
        {cards[status]}
      </div>
    </>
  );
}
