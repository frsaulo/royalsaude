import logo from "@/assets/RoyalSaudeb.png";
import { Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary py-12 border-t border-gold/10">
      <div className="container mx-auto px-6 text-center">
        <img src={logo} alt="Royal Saúde" className="h-16 mx-auto mb-4" />
        <p className="text-[#e5e5e5] font-body text-sm mb-6">
          Clube de benefícios acessível para<br /> Campo Grande – MS e região
        </p>
        <div className="h-px bg-gradient-gold max-w-xs mx-auto mb-6 opacity-30" />
        <p className="text-[#e5e5e5] font-body text-xs mb-4">
           <br />R. Dr. Eduardo Machado Metelo, 46 - Chácara Cachoeira, <br />Campo Grande - MS, CEP: 79040-830
        </p>
        <a 
          href="mailto:sac@fidelidaderoyalsaude.com.br" 
          className="inline-flex items-center gap-2 text-[#e5e5e5] hover:text-gold-light transition-colors font-body text-sm mb-6"
        >
          <Mail size={16} />
          <span>sac@fidelidaderoyalsaude.com.br</span>
        </a>
        <p className="text-[#e5e5e5] font-body text-xs mt-2">
          © {new Date().getFullYear()}2026 Royal Saúde Clube de Benefícios Ltda<br /> 
 Todos os Direitos Reservados<br />
 Responsáveis Técnicos 
Drª Fernanda Flores C. Neves CRM-MS 15.493<br />
Dr Felipe Flores C. Neves CRM-MS 15.973<br />
CNPJ: 61.889.391/0001-31
        </p>
      </div>
    </footer>
  );
};

export default Footer;
