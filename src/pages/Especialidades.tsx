import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
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
  CalendarCheck,
  X,
  ChevronLeft
} from "lucide-react";

// Tipagem para a Especialidade
interface Especialidade {
  id: string;
  name: string;
  icon: any;
  description: string;
  detailedDescription: string;
  symptoms: string[];
  indications: string;
}

const especialidadesList: Especialidade[] = [
  {
    id: "clinico-geral",
    name: "Clínico Geral",
    icon: Stethoscope,
    description: "Diagnóstico e cuidados gerais para sua saúde do dia a dia.",
    detailedDescription: "O Clínico Geral é o profissional de saúde responsável pelo atendimento primário, preventivo e global do paciente. Ele realiza diagnósticos, trata condições comuns e atua na promoção da saúde física e bem-estar, encaminhando para especialistas quando necessário.",
    symptoms: ["Febre", "Dores no corpo", "Cansaço constante", "Gripes e resfriados", "Mal-estar geral", "Renovação de receitas"],
    indications: "Recomenda-se procurar o Clínico Geral para check-ups anuais preventivos, sintomas agudos leves a moderados ou para uma avaliação de saúde inicial e integrada."
  },
  {
    id: "cardiologista",
    name: "Cardiologista",
    icon: HeartPulse,
    description: "Prevenção, diagnóstico e tratamento de doenças do coração.",
    detailedDescription: "O Cardiologista é o especialista focado na saúde do coração e do sistema cardiovascular. Ele previne, investiga e trata doenças circulatórias, arritmias, hipertensão arterial, insuficiência cardíaca e risco de infarto.",
    symptoms: ["Dor ou aperto no peito", "Falta de ar sob esforço", "Palpitações ou batimentos acelerados", "Tonturas frequentes", "Pressão alta"],
    indications: "Indicado para acompanhamento de hipertensão, avaliação antes de iniciar atividades físicas intensas, histórico familiar de problemas cardíacos ou check-up preventivo após os 40 anos."
  },
  {
    id: "odontologia",
    name: "Odontologia",
    icon: Smile, // Usando Smile para representar a saúde do sorriso e dentes
    description: "Cuidados completos com a saúde bucal, prevenção e tratamentos dentários.",
    detailedDescription: "O especialista em Odontologia cuida da saúde dos dentes, gengivas e estruturas da boca. Realiza limpezas, tratamento de cáries, canais, extrações e procedimentos estéticos, essenciais para uma mastigação saudável e um sorriso confiante.",
    symptoms: ["Dor de dente", "Sangramento na gengiva", "Sensibilidade a alimentos frios/quentes", "Mau hálito", "Dentes quebrados ou ausentes"],
    indications: "Procure o cirurgião-dentista a cada 6 meses para avaliações preventivas e limpezas, ou sempre que notar dor, sangramento nas gengivas ou desconforto bucal."
  },
  {
    id: "ginecologista",
    name: "Ginecologista",
    icon: Flower2,
    description: "Atenção integral à saúde íntima da mulher em todas as fases.",
    detailedDescription: "O Ginecologista é o profissional dedicado ao cuidado da saúde do sistema reprodutor feminino (útero, ovários, vagina) e mamas. Acompanha a mulher desde a puberdade até a menopausa, tratando infecções, miomas, endometriose e distúrbios hormonais.",
    symptoms: ["Irregularidade no ciclo menstrual", "Cólicas muito intensas", "Corrimento com odor ou coceira", "Dor na relação sexual", "Nódulos nas mamas"],
    indications: "Essencial para a realização de exames anuais de rotina (Papanicolau), escolha de métodos contraceptivos e orientação na transição para a menopausa."
  },
  {
    id: "obstetricia",
    name: "Obstetrícia",
    icon: Baby,
    description: "Acompanhamento dedicado da gestação, parto e pós-parto.",
    detailedDescription: "O Obstetra é o médico que realiza o acompanhamento pré-natal, garantindo a segurança e a saúde da mãe e do bebê durante toda a gravidez, além de planejar e realizar o parto e monitorar o período pós-parto (puerpério).",
    symptoms: ["Suspeita ou confirmação de gravidez", "Enjoos frequentes na gestação", "Sangramento gestacional", "Dores abdominais na gravidez"],
    indications: "Deve ser consultado assim que houver suspeita ou confirmação de gravidez para o início imediato e regular das consultas pré-natais."
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    icon: Bone,
    description: "Cuidados com ossos, músculos, articulações e lesões.",
    detailedDescription: "O Ortopedista diagnostica e trata problemas mecânicos e inflamatórios do aparelho locomotor, que inclui ossos, articulações, tendões, ligamentos e músculos. Atua em casos de traumas, fraturas, artrose, tendinites e desvios posturais.",
    symptoms: ["Dores nas articulações (joelho, ombro, quadril)", "Dor constante nas costas", "Inchaço ou rigidez nas juntas", "Lesões por esforço ou torções"],
    indications: "Procure após quedas ou acidentes com suspeita de fraturas e luxações, ou no caso de dores crônicas nos ossos ou articulações que afetam a mobilidade."
  },
  {
    id: "pediatria",
    name: "Pediatria",
    icon: Smile,
    description: "Cuidado e carinho com a saúde e desenvolvimento infantil.",
    detailedDescription: "O Pediatra acompanha o desenvolvimento global de crianças e adolescentes, atuando na prevenção de doenças através da vacinação, orientação alimentar, monitoramento do crescimento e tratamento de patologias infantis.",
    symptoms: ["Febre em crianças", "Tosse e chiado no peito", "Falta de apetite infantil", "Alterações no sono ou comportamento", "Problemas de pele"],
    indications: "Indicado para consultas mensais de acompanhamento no primeiro ano de vida (puericultura), revisões periódicas do crescimento e sempre que a criança adoecer."
  },
  {
    id: "psicologia",
    name: "Psicologia",
    icon: Brain,
    description: "Apoio emocional e cuidados com a saúde mental.",
    detailedDescription: "O Psicólogo atua no cuidado com a saúde mental e emocional. Através de sessões de psicoterapia, ele ajuda o paciente a lidar com conflitos internos, ansiedade, depressão, traumas e desafios nos relacionamentos cotidianos.",
    symptoms: ["Tristeza profunda e persistente", "Ansiedade generalizada ou pânico", "Estresse severo", "Luto ou perdas significativas", "Dificuldades de convívio"],
    indications: "Procure quando sentir que as emoções estão interferindo negativamente na sua rotina, no sono, no trabalho ou em momentos de grandes mudanças de vida."
  },
  {
    id: "pneumologista",
    name: "Pneumologista",
    icon: Wind,
    description: "Prevenção e tratamento de problemas do sistema respiratório.",
    detailedDescription: "O Pneumologista é o médico especialista nos pulmões e vias aéreas. Trata doenças como asma, bronquite crônica, enfisema (DPOC), pneumonias, tosses persistentes e distúrbios respiratórios do sono.",
    symptoms: ["Falta de ar ou cansaço fácil", "Tosse persistente (mais de 3 semanas)", "Chiado no peito ao respirar", "Catarro crônico", "Ronco excessivo"],
    indications: "Indicado para fumantes ou ex-fumantes realizarem exames preventivos pulmões, no caso de alergias respiratórias recorrentes e no diagnóstico de falta de ar crônica."
  },
  {
    id: "nefrologista",
    name: "Nefrologista",
    icon: Activity,
    description: "Prevenção, diagnóstico e tratamento de doenças renais.",
    detailedDescription: "O Nefrologista é o médico responsável pela saúde dos rins. Ele previne a perda da função renal, trata infecções urinárias de repetição, cálculos renais, nefrites e acompanha pacientes com doença renal crônica.",
    symptoms: ["Urina com sangue ou muita espuma", "Inchaço constante nas pernas e olhos", "Dores na região lombar", "Infecções urinárias recorrentes"],
    indications: "Essencial para pacientes hipertensos ou diabéticos de longa data realizarem o rastreamento preventivo de perda de função renal, ou ao detectar alterações nos exames de ureia e creatinina."
  },
  {
    id: "reumatologista",
    name: "Reumatologista",
    icon: Accessibility,
    description: "Diagnóstico de doenças autoimunes e das articulações.",
    detailedDescription: "O Reumatologista atua no tratamento de doenças crônicas não-traumáticas das articulações e dos tecidos que as envolvem, além de doenças autoimunes e inflamatórias sistêmicas como artrite reumatoide, gota, fibromialgia, artrose e lúpus.",
    symptoms: ["Dores e inchaços nas articulações", "Rigidez nas juntas ao acordar", "Dores musculares generalizadas e fadiga", "Lesões de pele associadas a dores articulares"],
    indications: "Procure caso sinta dores ou inchaço recorrentes nas juntas que durem mais de algumas semanas, rigidez articular prolongada pela manhã ou dores generalizadas inexplicáveis."
  }
];

export const Especialidades = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedEsp, setSelectedEsp] = useState<Especialidade | null>(null);

  // Lê a query string ?active=ID ou ?active=NOME ao carregar
  useEffect(() => {
    const activeParam = searchParams.get("active")?.toLowerCase().trim();
    if (activeParam) {
      const found = especialidadesList.find(
        (e) => e.id === activeParam || e.name.toLowerCase() === activeParam
      );
      if (found) {
        setSelectedEsp(found);
      } else {
        setSelectedEsp(null);
      }
    } else {
      setSelectedEsp(null);
    }
  }, [searchParams]);

  // Atualiza a URL quando o modal abre ou fecha
  const handleOpenModal = (esp: Especialidade) => {
    setSelectedEsp(esp);
    setSearchParams({ active: esp.id }, { replace: true });
  };

  const handleCloseModal = () => {
    setSelectedEsp(null);
    setSearchParams({}, { replace: true });
  };

  const handleBook = () => {
    navigate("/login");
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
                  onClick={() => handleOpenModal(esp)}
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

      {/* Modal / Dialog de Detalhes da Especialidade */}
      <AnimatePresence>
        {selectedEsp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop com Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />

            {/* Caixa do Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative z-10 border border-slate-100 flex flex-col"
            >
              {/* Header do Modal com Gradiente */}
              <div className="bg-gradient-to-r from-primary to-[#2566af] text-white p-6 relative">
                <button
                  onClick={handleCloseModal}
                  className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-inner">
                    {(() => {
                      const Icon = selectedEsp.icon;
                      return <Icon className="w-7 h-7 text-[#dde400]" />;
                    })()}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-300 font-bold font-body">Especialidade</span>
                    <h2 className="text-2xl md:text-3xl font-cinzel font-bold text-white">{selectedEsp.name}</h2>
                  </div>
                </div>
              </div>

              {/* Conteúdo do Modal */}
              <div className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[70vh]">
                {/* Descrição Detalhada */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-body">Sobre a Especialidade</h4>
                  <p className="text-slate-700 font-body text-sm leading-relaxed whitespace-pre-line">
                    {selectedEsp.detailedDescription}
                  </p>
                </div>

                {/* Sintomas Comuns */}
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 font-body">Sintomas Comuns Tratados</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedEsp.symptoms.map((symptom) => (
                      <span
                        key={symptom}
                        className="bg-slate-100 text-slate-700 text-xs px-3 py-1.5 rounded-full font-medium font-body border border-slate-200/50"
                      >
                        {symptom}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quando Procurar */}
                <div className="bg-[#1E3A8A]/5 border-l-4 border-primary p-4 rounded-r-lg">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1e3a8a] mb-1.5 font-body">Quando Procurar?</h4>
                  <p className="text-slate-700 font-body text-xs leading-relaxed">
                    {selectedEsp.indications}
                  </p>
                </div>
              </div>

              {/* Footer do Modal com botão CTA */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-5 py-3 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 text-sm font-semibold transition-colors font-body"
                >
                  Fechar
                </button>
                <button
                  onClick={handleBook}
                  className="inline-flex items-center justify-center gap-2 bg-[#dde400] hover:bg-[#c2c800] text-[#092952] font-cinzel font-bold px-6 py-3 rounded-lg shadow-md transition-all hover:scale-102 hover:shadow-lg text-sm tracking-wide"
                >
                  <CalendarCheck className="w-4 h-4" />
                  Agende sua Consulta Online
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Especialidades;
