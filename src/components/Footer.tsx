import logo from "@/assets/RoyalMedr.png";
import { Mail, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-[#dde400] py-12 border-t border-gold/10">
      <div className="container mx-auto px-6 text-center">
        <img src={logo} alt="RoyalMed Health" className="h-48 mx-auto mb-4" />
        <p className="text-[#092952] font-body text-sm mb-6">
          Saúde de qualidade ao seu alcance
        </p>
        <div className="h-px bg-[#dde400] max-w-xs mx-auto mb-6 opacity-30" />
        <p className="text-[#092952] font-body text-xs mb-4 whitespace-pre-line">
          Rua Pedro Celestino, 2395, Campo Grande - MS, CEP: 79002-372
        </p>
        <div className="flex flex-col items-center gap-4 mb-6">
          <a 
            href="https://wa.me/5567991747844" 
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#092952] hover:text-green-600 transition-all font-body text-sm group"
          >
            <div className="bg-green-100 p-2 rounded-full group-hover:bg-green-200 transition-colors">
              <MessageCircle size={18} className="text-green-600" />
            </div>
            <span className="font-semibold text-base">SAC: (67) 99174-7844</span>
          </a>

          <a 
            href="mailto:contato@royalmedhealth.com.br" 
            className="flex items-center gap-3 text-slate-400 font-light hover:text-white transition-colors"
          >
            <div className="h-8 w-8 rounded-full bg-white/5 flex items-center justify-center">
              <Mail className="h-4 w-4" />
            </div>
            <span>contato@royalmedhealth.com.br</span>
          </a>
        </div>
        <p className="text-[#092952] font-body text-xs mt-2 whitespace-pre-line leading-relaxed">
          Responsáveis Técnicos:{"\n"}
          Drª Fernanda Flores C. Neves{"\n"}
          CRM-MS 15.493{"\n\n"}
          Dr Felipe Flores C. Neves{"\n"}
          CRM-MS 15.973{"\n\n\n\n"}
          CNPJ: 65.818.151/0001-05{"\n"}
          Todos os direitos reservados{"\n"}
          © {new Date().getFullYear()} RoyalMed Health Clube de Benefícios Ltda
        </p>
      </div>
    </footer>
  );
};

export default Footer;
