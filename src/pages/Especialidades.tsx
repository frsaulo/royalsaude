import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { 
  MapPin,
  ChevronLeft
} from "lucide-react";
import { especialidadesList, Especialidade } from "../data/especialidades";

export const Especialidades = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Redireciona query strings antigas ?active=ID para /especialidades/ID (Retrocompatibilidade e SEO)
  useEffect(() => {
    const activeParam = searchParams.get("active")?.toLowerCase().trim();
    if (activeParam) {
      const found = especialidadesList.find(
        (e) => e.id === activeParam || e.name.toLowerCase() === activeParam
      );
      if (found) {
        navigate(`/especialidades/${found.id}`, { replace: true });
      }
    }
  }, [searchParams, navigate]);

  const handleSelectSpecialty = (esp: Especialidade) => {
    navigate(`/especialidades/${esp.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        {/* Banner/Header da Página */}
        <div className="container mx-auto px-6 mb-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors mb-6 group"
          >
            <ChevronLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium font-body">Voltar</span>
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-200 pb-8">
            <div className="max-w-2xl">
              <span className="font-cinzel text-xs text-[#2566af] tracking-widest uppercase font-bold block mb-2">
                Clínica Própria Campo Grande
              </span>
              <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-primary leading-tight">
                Nossas <span className="text-[#092952] border-b-4 border-[#dde400] pb-1">Especialidades</span>
              </h1>
              <p className="text-muted-foreground font-body mt-4 text-base leading-relaxed">
                Estrutura de excelência na <strong className="text-primary font-semibold">Rua Pedro Celestino, 2395</strong>. Oferecemos uma infraestrutura de ponta e profissionais altamente qualificados para sua saúde física e mental.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm self-stretch md:self-auto">
              <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-[#092952]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Localização</p>
                <p className="text-xs font-bold text-primary">Rua Pedro Celestino, 2395</p>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Especialidades */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {especialidadesList.map((esp, i) => {
              const IconComponent = esp.icon;
              return (
                <motion.div
                  key={esp.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => handleSelectSpecialty(esp)}
                  className="bg-white rounded-xl p-6 border border-slate-200 hover:border-primary/20 shadow-sm hover:shadow-md transition-all duration-300 group hover:-translate-y-1 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Ícone com animação */}
                    <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary transition-colors duration-300 shadow-sm border border-slate-100 group-hover:border-primary">
                      <IconComponent className="w-6 h-6 text-[#092952] group-hover:text-[#dde400] transition-colors duration-300" />
                    </div>

                    <h3 className="font-cinzel text-base font-bold text-primary mb-3 group-hover:text-[#2566af] transition-colors duration-300">
                      {esp.name}
                    </h3>

                    <p className="text-muted-foreground font-body text-xs leading-relaxed group-hover:text-slate-600 transition-colors duration-300">
                      {esp.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#2566af]">
                    <span>Ver detalhes</span>
                    <span className="text-base group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />

    </div>
  );
};

export default Especialidades;
