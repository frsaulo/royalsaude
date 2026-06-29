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
  Accessibility
} from "lucide-react";

export interface Especialidade {
  id: string;
  name: string;
  icon: any;
  description: string;
  detailedDescription: string;
  symptoms: string[];
  indications: string;
}

export const especialidadesList: Especialidade[] = [
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
    icon: Smile,
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
