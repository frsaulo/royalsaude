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
  Scan,
  BrainCircuit,
  Ear,
  Scale,
  Flame
} from "lucide-react";

export interface Especialidade {
  id: string;
  name: string;
  icon: any;
  description: string;
  detailedDescription: string;
  symptoms: string[];
  indications: string;
  services?: string[];
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
    name: "Cardiologia",
    icon: HeartPulse,
    description: "Prevenção, diagnóstico e tratamento de doenças do coração e do sistema cardiovascular.",
    detailedDescription: "Um cardiologista é um médico especializado no diagnóstico e tratamento de doenças do coração e do sistema cardiovascular. Eles lidam com uma variedade de condições, como doença arterial coronariana, hipertensão, arritmias cardíacas, insuficiência cardíaca, entre outras.\n\nSe alguém estiver preocupado com sua saúde cardíaca, consultar um cardiologista é uma medida importante para garantir um diagnóstico preciso e um plano de tratamento adequado.\n\nDurante a consulta, o cardiologista realizará uma avaliação detalhada, ouvindo atentamente os sintomas relatados, investigando histórico familiar de doenças cardíacas e indagando sobre fatores de risco relevantes.\n\n“Cada paciente é único, portanto, é importante adaptar a orientação de acordo com as necessidades e condições específicas do paciente em questão”.\n\nCom base nas informações fornecidas pelo paciente, o médico poderá solicitar exames adicionais, como eletrocardiograma (ECG), teste ergométrico, ecocardiograma, entre outros, para complementar a avaliação do estado cardíaco do paciente.",
    symptoms: ["Dores no peito", "Palpitações", "Falta de ar", "Fadiga excessiva", "Inchaço nas pernas", "Tonturas"],
    indications: "A consulta com o cardiologista deve ser realizada quando há sintomas específicos, como dores no peito, palpitações, falta de ar, fadiga excessiva, inchaços nas pernas, tonturas, entre outros. Além disso, é recomendado que os homens acima dos 50 anos e as mulheres acima dos 45 anos realizem um check-up anual, mesmo sem sintomas. Caso o indivíduo possua algum tipo de histórico familiar, recomenda-se buscar aconselhamento."
  },
  {
    id: "coloproctologia",
    name: "Coloproctologia",
    icon: Activity,
    description: "Diagnóstico, tratamento e prevenção de doenças do intestino, reto e ânus.",
    detailedDescription: "O Coloproctologista é o médico especialista no diagnóstico, tratamento e prevenção de doenças que afetam o intestino grosso (cólon), reto e ânus. Ele combina conhecimentos de clínica médica e cirurgia, podendo tratar desde problemas simples — como hemorroidas e fissuras anais — até condições mais complexas, como doenças inflamatórias intestinais e câncer colorretal. É o profissional responsável por garantir a saúde intestinal e o bom funcionamento do sistema digestivo inferior.\n\nA consulta começa com uma avaliação detalhada dos sintomas e hábitos intestinais, seguida de um exame físico — procedimento rápido e indolor que auxilia na identificação de alterações. Quando necessário, o médico pode solicitar exames complementares, como colonoscopia ou exames de sangue. Todo o processo é conduzido com discrição, respeito e cuidado, garantindo conforto e confiança ao paciente.",
    symptoms: [
      "Hemorroidas",
      "Fissuras e fístulas anais",
      "Abscessos",
      "Constipação intestinal e diarreia crônica",
      "Doença diverticular",
      "Doenças inflamatórias intestinais (Retocolite Ulcerativa e Doença de Crohn)",
      "Câncer colorretal",
      "Incontinência fecal e prolapso retal"
    ],
    indications: "A consulta deve ser marcada sempre que houver alterações no funcionamento intestinal, como constipação, diarreia persistente, dor ao evacuar, sangramento nas fezes, coceira ou desconforto anal. Pessoas com histórico familiar de câncer colorretal ou com mais de 45 anos também devem realizar consultas periódicas para prevenção e rastreamento de doenças. Mesmo sem sintomas, é indicado consultar o especialista anualmente como medida preventiva."
  },
  {
    id: "odontologia",
    name: "Odontologia",
    icon: Smile,
    description: "Cuidados completos com a saúde bucal, prevenção e tratamentos dentários.",
    detailedDescription: "O especialista em Odontologia cuida da saúde dos dentes, gengivas e estruturas da boca. Realiza limpezas, tratamento de cáries, canais, extrações e procedimentos estéticos, essenciais para uma mastigação saudável e um sorriso confiante.",
    symptoms: ["Dor de dente", "Sangramento na gengiva", "Sensibilidade a alimentos frios/quentes", "Mau hálito", "Dentes quebrados ou ausentes"],
    indications: "Procure o cirurgião-dentista a cada 6 meses para avaliações preventivas e liminas, ou sempre que notar dor, sangramento nas gengivas ou desconforto bucal."
  },
  {
    id: "endocrinologista",
    name: "Endocrinologia",
    icon: Scale,
    description: "Diagnóstico e tratamento de distúrbios hormonais e metabólicos.",
    detailedDescription: "Um endocrinologista é um médico especializado no diagnóstico e tratamento de distúrbios hormonais e metabólicos. Esses distúrbios podem afetar uma ampla gama de sistemas do corpo, incluindo metabolismo, crescimento, reprodução, regulação de peso, entre outros. Alguns dos distúrbios mais comuns tratados por endocrinologistas incluem diabetes, doenças da tireoide, distúrbios da glândula adrenal, distúrbios da hipófise, distúrbios da reprodução, como infertilidade e menopausa, entre outros.\n\nA consulta com endocrinologista começa com uma entrevista chamada anamnese. É durante essa etapa que o médico coleta informações sobre o histórico de saúde, doenças preexistentes e o motivo da visita do paciente ao consultório. Portanto, é fundamental compartilhar todos os sintomas e razões para o encontro.\n\nO endocrinologista geralmente realiza o exame clínico e, se preciso, solicita procedimentos complementares como testes laboratoriais e de imagem, a fim de visualizar estruturas como a tireoide, ovários ou testículos. A escolha dos testes complementares vai depender da suspeita clínica formada a partir da anamnese e exame físico.",
    symptoms: [
      "Excesso de peso ou aumento rápido de peso",
      "Cansaço excessivo",
      "Alterações no ciclo menstrual",
      "Aumento da tireoide",
      "Excesso de pelos nas mulheres",
      "Crescimento das mamas nos meninos",
      "Sinais e sintomas de andropausa e menopausa",
      "Sede excessiva e aumento da vontade para urinar (sintomas de diabetes)"
    ],
    indications: "É recomendado consultar o endocrinologista quando forem percebidos sinais ou sintomas que possam ser indicativos de alteração na produção de hormônios, como sede excessiva, alterações inexplicáveis de peso ou menopausa."
  },
  {
    id: "gastroenterologia",
    name: "Gastroenterologia",
    icon: Flame,
    description: "Diagnóstico, tratamento e prevenção de doenças que afetam o sistema digestivo.",
    detailedDescription: "O Gastroenterologista é o médico especializado em diagnosticar, tratar e prevenir doenças que afetam o sistema digestivo, incluindo esôfago, estômago, intestinos e fígado. Ele cuida tanto de condições comuns, como gastrite e refluxo, quanto de doenças mais complexas que podem comprometer a qualidade de vida. Seu objetivo é garantir o bom funcionamento do sistema digestivo, essencial para a saúde geral do corpo.\n\nNa consulta, o médico começa investigando os sintomas, hábitos alimentares e histórico clínico do paciente. Em seguida, realiza um exame físico e pode solicitar exames complementares, como endoscopia, colonoscopia, ultrassonografia ou exames laboratoriais. O atendimento é individualizado e busca não apenas tratar os sintomas, mas também encontrar a causa do problema, muitas vezes relacionada à alimentação e ao estilo de vida.",
    symptoms: [
      "Gastrite e úlceras",
      "Doença do refluxo gastroesofágico (DRGE)",
      "Síndrome do intestino irritável",
      "Doença celíaca e intolerâncias alimentares",
      "Doença de Crohn e retocolite ulcerativa",
      "Hepatites e doenças do fígado",
      "Pedra na vesícula",
      "Cânceres do aparelho digestivo",
      "Constipação e diarreia crônica"
    ],
    indications: "É importante procurar o gastroenterologista quando houver sinais como azia ou queimação frequente, dores abdominais recorrentes, náuseas, vômitos, prisão de ventre ou diarreia persistente, presença de sangue nas fezes, ou inchaço abdominal constante. Consultas preventivas também são indicadas, especialmente após os 40 anos."
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
    id: "neurologia",
    name: "Neurologia",
    icon: Brain,
    description: "Diagnóstico, tratamento e acompanhamento de doenças do sistema nervoso central, periférico e músculos.",
    detailedDescription: "O neurologista é o médico especializado no diagnóstico, tratamento e acompanhamento de doenças que afetam o sistema nervoso central (cérebro e medula espinhal), periférico (nervos) e músculos. Atua em condições como enxaqueca, epilepsia, doença de Parkinson, Alzheimer, esclerose múltipla, distúrbios do sono, neuropatias, entre outras.\n\nAlém de tratar doenças já estabelecidas, o neurologista também realiza avaliações preventivas, orienta sobre hábitos de vida saudáveis e trabalha em conjunto com outros profissionais de saúde para oferecer um cuidado integral ao paciente.\n\nA primeira consulta é um momento de escuta e análise cuidadosa. Nela realizamos uma anamnese completa, exame neurológico detalhado, orientação sobre exames complementares (ressonância, EEG, doppler etc.) e elaboramos um plano de tratamento individualizado pensando em acolher a pessoa, não apenas a doença.",
    symptoms: [
      "Dores de cabeça frequentes ou intensas",
      "Tonturas ou vertigens persistentes",
      "Perda de força ou sensibilidade em membros",
      "Convulsões ou desmaios",
      "Distúrbios do sono, como insônia ou sonolência excessiva",
      "Problemas de memória ou concentração",
      "Tremores, tiques ou movimentos involuntários",
      "Alterações na fala, visão ou audição sem causa aparente"
    ],
    indications: "É recomendável procurar um neurologista ao apresentar sintomas como dores de cabeça frequentes, tonturas persistentes, esquecimentos ou distúrbios do sono. Pessoas com histórico familiar de doenças neurológicas ou diagnósticos estabelecidos também devem realizar acompanhamento regular."
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    icon: Bone,
    description: "Diagnóstico, tratamento e prevenção de doenças e lesões do sistema musculoesquelético.",
    detailedDescription: "A ortopedia é a especialidade médica responsável pelo diagnóstico, tratamento e prevenção de doenças e lesões do sistema musculoesquelético, ou seja, ossos, muscles, tendões, ligamentos e articulações. Os ortopedistas são treinados para ajudar a restaurar a mobilidade e a função das pessoas que sofrem de lesões ou doenças relacionadas ao sistema musculoesquelético.\n\nEles trabalham em estreita colaboração com outros profissionais de saúde para garantir que seus pacientes recebam o melhor tratamento possível e se recuperem completamente após uma lesão ou cirurgia.\n\nA consulta com o ortopedista geralmente envolve uma avaliação física, exames de imagem e testes de função física. Com base nos resultados desses exames, o ortopedista pode fazer um diagnóstico e recomendar um plano de tratamento, que pode incluir medicamentos, fisioterapia ou cirurgia para reparar danos graves.",
    symptoms: [
      "Dores ou desconforto nas articulações",
      "Lesões esportivas",
      "Fraturas ósseas",
      "Doenças musculoesqueléticas crônicas (como artrite)",
      "Dor constante nas costas",
      "Inchaço ou rigidez nas juntas",
      "Dificuldades de mobilidade"
    ],
    indications: "Procure um ortopedista se você tiver dores ou desconforto nas articulações que não melhoram com o tempo, após sofrer quedas ou acidentes com suspeita de fraturas e lesões, ou no gerenciamento de condições crônicas como a artrite."
  },
  {
    id: "otorrinolaringologia",
    name: "Otorrinolaringologia",
    icon: Ear,
    description: "Diagnóstico e tratamento de doenças do ouvido, nariz e garganta em adultos e crianças.",
    detailedDescription: "O Otorrinolaringologista (incluindo a especialidade Pediátrica) é o médico especializado em cuidar da saúde do ouvido, nariz e garganta. Ele tem conhecimento específico sobre as particularidades do organismo dos pacientes, tratando desde infecções comuns até condições mais complexas que afetam a respiração, audição, fala e deglutição, promovendo diagnósticos precisos e tratamentos humanizados.\n\nA consulta é realizada de forma acolhedora. O médico inicia com uma conversa para entender os sintomas e histórico de saúde. Em seguida, realiza um exame físico cuidadoso, utilizando instrumentos específicos para observar os ouvidos, nariz e garganta. Quando necessário, podem ser solicitados exames como audiometria, nasofibroscopia ou exames de imagem.",
    symptoms: [
      "Dores de ouvido frequentes ou secreção",
      "Dificuldade para ouvir ou entender a fala",
      "Roncos intensos, apneia do sono ou respiração pela boca",
      "Atrasos na fala ou na linguagem em crianças",
      "Amigdalites e infecções de garganta recorrentes",
      "Obstrução nasal persistente, mesmo sem gripe ou resfriado"
    ],
    indications: "É importante agendar uma consulta sempre que apresentar dores de ouvido frequentes, perda auditiva, obstrução nasal persistente ou infecções recorrentes de garganta. Crianças com histórico de otite de repetição ou ronco devem ser avaliadas."
  },
  {
    id: "pediatria",
    name: "Pediatria",
    icon: Smile,
    description: "Cuidado e acompanhamento integral da saúde, crescimento e desenvolvimento infantil.",
    detailedDescription: "O Pediatra é o médico especializado em cuidar da saúde de bebês, crianças e adolescentes, acompanhando seu crescimento e desenvolvimento físico, emocional e social. Ele é responsável por prevenir, diagnosticar e tratar doenças comuns na infância, além de orientar os pais sobre alimentação, vacinação, sono, higiene e hábitos saudáveis. Mais do que tratar, o pediatra atua como parceiro da família na construção de uma vida saudável para a criança.\n\nA consulta começa com uma conversa entre o médico e os pais para entender o histórico de saúde, rotina e queixas da criança. O pediatra realiza um exame físico completo, avaliando peso, altura, batimentos cardíacos, respiração, reflexos e outros sinais importantes. Dependendo da idade, também observa marcos do desenvolvimento, como coordenação motora, linguagem e comportamento. É um momento para esclarecer dúvidas e fortalecer os cuidados com a infância.",
    symptoms: [
      "Infecções respiratórias (gripe, bronquite, pneumonia)",
      "Alergias alimentares e respiratórias",
      "Otites e amigdalites",
      "Problemas gastrointestinais (diarreia, refluxo, constipação)",
      "Febre em crianças ou tosse forte",
      "Atrasos no desenvolvimento motor ou de fala",
      "Doenças exantemáticas (catapora, sarampo, rubéola)"
    ],
    indications: "Indicado para consultas mensais de acompanhamento no primeiro ano de vida (puericultura), exames periódicos de rotina do crescimento e desenvolvimento, e sempre que a criança apresentar sinais de adoecimento."
  },
  {
    id: "psicologia",
    name: "Psicologia",
    icon: Brain,
    description: "Apoio emocional e cuidados com a saúde mental.",
    detailedDescription: "O Psicólogo atua no cuidado com a saúde mental e emocional. Através de sessões de psicoterapia, ele ajuda o paciente a lidar com conflitos internos, ansiedade, depressão, traumas e desafios nos relacionamentos cotidianos.",
    symptoms: ["Tristeza profunda e persistente", "Ansiedade generalizada ou pânico", "Estresse severo", "Luto ou perdas significativas", "Dificuldades de convívio"],
    indications: "Procure quando sentir que as emoções estão interferindo negativamente na sua rotina, no sono, no trabalho ou em momentos de grandes mudanças de vida.",
    services: [
      "Terapia ABA",
      "Terapia TCC",
      "Avaliação Neuropsicológica",
      "Reabilitação Neuropsicológica"
    ]
  },
  {
    id: "pneumologista",
    name: "Pneumologista",
    icon: Wind,
    description: "Prevenção, diagnóstico e tratamento de doenças relacionadas aos pulmões e ao sistema respiratório.",
    detailedDescription: "Um pneumologista é um médico especializado no diagnóstico e tratamento de doenças relacionadas aos pulmões e ao sistema respiratório. Eles lidam com uma ampla variedade de condições, desde problemas respiratórios agudos, como pneumonia e bronquite, até doenças crônicas, como asma, doença pulmonar obstrutiva crônica (DPOC), fibrose pulmonar e câncer de pulmão.\n\nOs pneumologistas também tratam distúrbios do sono, como apneia do sono e insônia relacionada a problemas respiratórios. Eles realizam testes de função pulmonar para avaliar a capacidade respiratória. Durante a consulta, o médico realiza a ausculta dos pulmões e coração, avalia os sinais e sintomas e pode indicar exames como espirometria, tomografia ou radiografia de tórax.",
    symptoms: [
      "Tosse que não melhora após 3 semanas",
      "Tosse com sangue ou catarro",
      "Dor no peito ou sensação de pressão",
      "Dificuldade para respirar, principalmente durante o exercício",
      "Chiado ao respirar",
      "Cansaço excessivo ou resfriados frequentes"
    ],
    indications: "É recomendado consultar o pneumologista quando são observados sinais e sintomas respiratórios persistentes, principalmente se a pessoa for fumante frequente, a fim de obter um diagnóstico preciso e iniciar o tratamento."
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
    name: "Reumatologia",
    icon: Accessibility,
    description: "Atendimento integral e especializado para doenças inflamatórias e autoimunes.",
    detailedDescription: "O reumatologista é o médico que cuida dos problemas inflamatórios relacionados às articulações e a todas as estruturas que ficam em seu entorno, também conhecido como “reumatismo de partes moles” (músculos, ligamentos, bursas e tendões). Apesar das articulações serem o local mais acometido, praticamente todos os órgãos do corpo humano podem apresentar manifestações de doenças reumáticas, como pulmões, rins, cérebro, pele e coração.\n\nNa consulta com o reumatologista a abordagem é avaliar o paciente como um todo e não apenas levar em consideração um problema em específico. Para realizar o diagnóstico de forma correta é importante compreender as particularidades de cada indivíduo.\n\nA consulta tem duração aproximada de 30 minutos e nela iremos abordar de maneira completa o histórico de saúde. É fundamental levar anotadas as dúvidas, nome de medicamentos em uso e exames anteriores. Além disso, venha sem esmalte nas unhas e com roupas que facilitem a avaliação física.",
    symptoms: [
      "Dor, inchaço, vermelhidão e calor nas articulações",
      "Fadiga e febre associada a dores nas juntas",
      "Dificuldades de mobilidade",
      "Rigidez nas juntas ao acordar",
      "Dores musculares generalizadas"
    ],
    indications: "É recomendado procurar um reumatologista quando surgirem sintomas que possam indicar a presença de doenças reumatológicas, especialmente quando houver ocorrência de artrite nas articulações (dor e inchaço persistentes)."
  },
  {
    id: "vascular",
    name: "Cirurgia Vascular",
    icon: HeartPulse,
    description: "Prevenção, diagnóstico e tratamento de doenças que afetam veias, artérias e vasos linfáticos.",
    detailedDescription: "O cirurgião vascular é o especialista responsável por prevenir, diagnosticar e tratar doenças que afetam veias, artérias e vasos linfáticos. Ele cuida de problemas como varizes, trombose, aneurismas, placas de colesterol nas artérias, má circulação, úlceras vasculares e inchaços.\n\nNa consulta vascular, realiza-se uma avaliação completa da saúde circulatória do paciente relacionada a sua queixa. O atendimento começa com uma conversa detalhada sobre sinais e sintomas, histórico familiar, estilo de vida e doenças pré-existentes. Em seguida, a especialista faz um exame físico e, se necessário, solicita exames complementares, como o Doppler vascular, para avaliar o funcionamento das veias e artérias. Com base no diagnóstico, a cirurgiã vascular indica o melhor tratamento, que pode incluir mudanças de hábitos, uso de meias de compressão, medicamentos, procedimentos minimamente invasivos ou cirurgias.",
    symptoms: [
      "Inchaço nas pernas",
      "Cansaço ou dor nas pernas",
      "Sensação de peso nos membros inferiores ou superiores",
      "Varizes visíveis ou vasinhos",
      "Feridas que não cicatrizam",
      "Dormência ou formigamento",
      "Manchas escuras na pele"
    ],
    indications: "As doenças vasculares costumam evoluir de forma silenciosa. Por isso, é essencial realizar avaliações periódicas com um médico vascular para manter a saúde da sua circulação em dia, principalmente ao apresentar dores, cansaço ou inchaço nas pernas."
  },
  {
    id: "ultrassonografia",
    name: "Ultrassonografia",
    icon: Scan,
    description: "Exames de imagem precisos para diagnóstico e acompanhamento.",
    detailedDescription: "A Ultrassonografia (ou ecografia) é um exame de imagem não invasivo e seguro, que utiliza ondas sonoras de alta frequência para visualizar, em tempo real, as estruturas internas do corpo, como órgãos, tecidos, fluxo sanguíneo e o desenvolvimento fetal durante a gravidez.",
    symptoms: ["Acompanhamento gestacional", "Dor abdominal ou pélvica", "Avaliação de nódulos ou cistos", "Investigação de dores articulares", "Exames preventivos de rotina"],
    indications: "Recomendada para exames preventivos, diagnóstico de dores inexplicáveis nos órgãos internos, acompanhamento de gestação e monitoramento de alterações sob orientação médica."
  },
  {
    id: "psiquiatria",
    name: "Psiquiatria",
    icon: BrainCircuit,
    description: "Prevenção, diagnóstico e tratamento de distúrbios da mente e comportamento.",
    detailedDescription: "A Psiquiatria é a especialidade médica focada na prevenção, diagnóstico, tratamento e reabilitação de distúrbios mentais, emocionais e de comportamento. O psiquiatra avalia o paciente sob uma perspectiva médica e biológica, podendo prescrever medicamentos quando necessário para restaurar o equilíbrio e o bem-estar.",
    symptoms: ["Tristeza profunda ou desânimo", "Ansiedade severa ou crises de pânico", "Alterações graves de humor ou comportamento", "Insônia severa ou distúrbios do sono", "Ideias obsessivas ou medos irracionais", "Alucinações ou delírios"],
    indications: "Indicada para o tratamento de depressão, transtorno bipolar, esquizofrenia, TDAH, transtornos de ansiedade crônicos e situações em que há necessidade de intervenção medicamentosa associada ou não à psicoterapia."
  }
];
