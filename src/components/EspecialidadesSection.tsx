import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  Stethoscope, 
  HeartPulse, 
  Flower2, 
  Baby, 
  Bone, 
  Smile, 
  Brain, 
  Wind, 
  Activity, 
  Accessibility,
  MapPin,
  CalendarCheck
} from "lucide-react";

const especialidades = [
  {
    id: "clinico-geral",
    icon: Stethoscope,
    name: "Clínico Geral",
    description: "Diagnóstico e cuidados gerais para sua saúde do dia a dia.",
  },
  {
    id: "cardiologista",
    icon: HeartPulse,
    name: "Cardiologista",
    description: "Prevenção, diagnóstico e tratamento de doenças do coração.",
  },
  {
    id: "odontologia",
    icon: Smile,
    name: "Odontologia",
    description: "Cuidados completos com a saúde bucal, prevenção e tratamentos dentários.",
  },
  {
    id: "ginecologista",
    icon: Flower2,
    name: "Ginecologista",
    description: "Atenção integral à saúde íntima da mulher em todas as fases.",
  },
  {
    id: "obstetricia",
    icon: Baby,
    name: "Obstetrícia",
    description: "Acompanhamento dedicado da gestação, parto e pós-parto.",
  },
  {
    id: "ortopedia",
    icon: Bone,
    name: "Ortopedia",
    description: "Cuidados com ossos, muscles, articulações e lesões.",
  },
  {
    id: "pediatria",
    icon: Smile,
    name: "Pediatria",
    description: "Cuidado e carinho com a saúde e desenvolvimento infantil.",
  },
  {
    id: "psicologia",
    icon: Brain,
    name: "Psicologia",
    description: "Apoio emocional e cuidados com a saúde mental.",
  },
  {
    id: "pneumologista",
    icon: Wind,
    name: "Pneumologista",
    description: "Prevenção e tratamento de problemas do sistema respiratório.",
  },
  {
    id: "nefrologista",
    icon: Activity,
    name: "Nefrologista",
    description: "Prevenção, diagnóstico e tratamento de doenças renais.",
  },
  {
    id: "reumatologista",
    icon: Accessibility,
    name: "Reumatologista",
    description: "Diagnóstico de doenças autoimunes e das articulações.",
  },
];

const EspecialidadesSection = () => {
  const navigate = useNavigate();
  return (
    <section id="especialidades" className="py-24 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      {/* Elementos decorativos de fundo */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#dde400]/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <span className="font-cinzel text-sm text-[#2566af] tracking-widest uppercase font-semibold block mb-2">
              Clínica Própria Campo Grande
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-primary leading-tight">
              Especialidades da nossa <span className="text-[#092952] border-b-4 border-[#dde400] pb-1">Clínica Própria</span>
            </h2>
            <p className="text-muted-foreground font-body mt-6 text-lg leading-relaxed">
              Estrutura moderna na <strong className="text-primary font-semibold">Rua Pedro Celestino, 2395</strong>. Oferecemos atendimento humanizado, rápido e de alta qualidade com agendamento simplificado.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-100 shadow-md shadow-royal/5 self-stretch md:self-auto"
          >
            <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-[#092952]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Localização</p>
              <p className="text-sm font-bold text-primary">Rua Pedro Celestino, 2395</p>
            </div>
          </motion.div>
        </div>

        {/* Grid de Especialidades */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {especialidades.map((esp, i) => {
            const IconComponent = esp.icon;
            return (
              <motion.div
                key={esp.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/especialidades?active=${esp.id}`)}
                className="bg-white rounded-xl p-6 border border-slate-100 shadow-royal hover:shadow-xl hover:border-primary/10 transition-all duration-300 group hover:-translate-y-1.5 flex flex-col justify-between cursor-pointer"
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

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-xs font-semibold text-[#2566af] opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span>Ver detalhes</span>
                  <span className="text-lg group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Botão de Chamada para Ação */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <a
            href="/login"
            className="inline-flex items-center gap-3 bg-[#dde400] hover:bg-[#c2c800] text-[#092952] font-cinzel font-bold px-8 py-4 rounded-lg shadow-gold transition-all hover:scale-105 tracking-wide"
          >
            <CalendarCheck className="w-5 h-5" />
            Agende sua Consulta Online
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default EspecialidadesSection;
