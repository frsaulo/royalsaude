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
  // Novos campos estruturados
  introduction?: string;
  whoIsDoctor?: {
    title: string;
    description: string;
  };
  whenToConsult?: {
    title: string;
    description: string;
  };
  howIsConsult?: {
    title: string;
    description: string;
  };
  diseasesTreated?: {
    title: string;
    list: string[];
  };
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
    detailedDescription: "Um cardiologista é um médico especializado no diagnóstico e tratamento de doenças do coração e do sistema cardiovascular. Eles lidam com uma variedade de condições, como doença arterial coronariana, hipertensão, arritmias cardíacas, insuficiência cardíaca, entre outras. Se alguém estiver preocupado com sua saúde cardíaca, consultar um cardiologista é uma medida importante para garantir um diagnóstico preciso e um plano de tratamento adequado.",
    symptoms: ["Dores no peito", "Palpitações", "Falta de ar", "Fadiga excessiva", "Inchaços nas pernas", "Tonturas"],
    indications: "A consulta com o cardiologista deve ser realizada quando há sintomas específicos, como dores no peito, palpitações, falta de ar, fadiga excessiva, inchaços nas pernas, tonturas, entre outros. Além disso, é recomendado que os homens acima dos 50 anos e as mulheres acima dos 45 anos realizem um check-up anual, mesmo sem sintomas. Caso o indivíduo possua algum tipo de histórico familiar, recomenda-se buscar aconselhamento.",
    introduction: "A melhor forma de não ter doenças cardíacas é a prevenção. Seu coração precisa da sua atenção!\nPor isso, o primeiro passo é ir a um cardiologista regularmente para saber quando há alguma coisa que pode ser errada ou incrementar novos hábitos saudáveis à sua rotina.",
    whoIsDoctor: {
      title: "Quem é o médico Cardiologista?",
      description: "Um cardiologista é um médico especializado no diagnóstico e tratamento de doenças do coração e do sistema cardiovascular. Eles lidam com uma variedade de condições, como doença arterial coronariana, hipertensão, arritmias cardíacas, insuficiência cardíaca, entre outras.\nSe alguém estiver preocupado com sua saúde cardíaca, consultar um cardiologista é uma medida importante para garantir um diagnóstico preciso e um plano de tratamento adequado."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "A consulta com o cardiologista deve ser realizada quando há sintomas específicos, como dores no peito, palpitações, falta de ar, fadiga excessiva, inchaços nas pernas, tonturas, entre outros.\nAlém disso, é recomendado que os homens acima dos 50 anos e as mulheres acima dos 45 anos realizem um check-up anual, mesmo sem sintomas.\nCaso o indivíduo possua algum tipo de histórico familiar, recomenda-se buscar aconselhamento com o cardiologista, que deve orientar em relação ao check-up."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "Durante a consulta, o cardiologista realizará uma avaliação detalhada, ouvindo atentamente os sintomas relatados, investigando histórico familiar de doenças cardíacas e indagando sobre fatores de risco relevantes.\n“Cada paciente é único, portanto, é importante adaptar a orientação de acordo com as necessidades e condições específicas do paciente em questão”.\nCom base nas informações fornecidas pelo paciente, o médico poderá solicitar exames adicionais, como eletrocardiograma (ECG), teste ergométrico, ecocardiograma, entre outros, para complementar a avaliação do estado cardíaco do paciente."
    }
  },
  {
    id: "coloproctologia",
    name: "Coloproctologia",
    icon: Activity,
    description: "Diagnóstico, tratamento e prevenção de doenças que afetam o intestino grosso, reto e ânus.",
    detailedDescription: "O Coloproctologista é o médico especialista no diagnóstico, tratamento e prevenção de doenças que afetam o intestino grosso (cólon), reto e ânus. Ele combina conhecimentos de clínica médica e cirurgia, podendo tratar desde problemas simples — como hemorroidas e fissuras anais — até condições mais complexas, como doenças inflamatórias intestinais e câncer colorretal. É o profissional responsável por garantir a saúde intestinal e o bom funcionamento do sistema digestivo inferior.",
    symptoms: ["Hemorróidas", "Fissuras e fístulas anais", "Abscessos", "Constipação intestinal e diarreia crônica", "Doença diverticular", "Doenças inflamatórias intestinais", "Câncer colorretal", "Incontinência fecal e prolapso retal"],
    indications: "A consulta deve ser marcada sempre que houver alterações no funcionamento intestinal. Pessoas com histórico familiar de câncer colorretal ou com mais de 45 anos também devem realizar consultas periódicas para prevenção e rastreamento de doenças.",
    introduction: "A melhor forma de não ter doenças é a prevenção. Seu corpo precisa da sua atenção!\nPor isso, o primeiro passo é ir a um Coloproctologista regularmente para saber quando há alguma coisa que pode ser errada ou incrementar novos hábitos saudáveis à sua rotina.",
    whoIsDoctor: {
      title: "Quem é o médico Coloproctologista?",
      description: "O Coloproctologista é o médico especialista no diagnóstico, tratamento e prevenção de doenças que afetam o intestino grosso (cólon), reto e ânus. Ele combina conhecimentos de clínica médica e cirurgia, podendo tratar desde problemas simples — como hemorróidas e fissuras anais — até condições mais complexas, como doenças inflamatórias intestinais e câncer colorretal. É o profissional responsável por garantir a saúde intestinal e o bom funcionamento do sistema digestivo inferior."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "A consulta deve ser marcada sempre que houver alterações no funcionamento intestinal, como constipação, diarreia persistente, dor ao evacuar, sangramento nas fezes, coceira ou desconforto anal. Pessoas com histórico familiar de câncer colorretal ou com mais de 45 anos também devem realizar consultas periódicas para prevenção e rastreamento de doenças. Mesmo sem sintomas, é indicado consultar o especialista anualmente como medida preventiva."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta começa com uma avaliação detalhada dos sintomas e hábitos intestinais, seguida de um exame físico — procedimento rápido e indolor que auxilia na identificação de alterações. Quando necessário, o médico pode solicitar exames complementares, como colonoscopia ou exames de sangue. Todo o processo é conduzido com discrição, respeito e cuidado, garantindo conforto e confiança ao paciente."
    },
    diseasesTreated: {
      title: "Quais as doenças tratadas pelo Coloproctologista?",
      list: [
        "Hemorróidas",
        "Fissuras e fístulas anais",
        "Abscessos",
        "Constipação intestinal e diarreia crônica",
        "Doença diverticular",
        "Doenças inflamatórias intestinais (Retocolite Ulcerativa e Doença de Crohn)",
        "Câncer colorretal",
        "Incontinência fecal e prolapso retal"
      ]
    }
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
    id: "endocrinologista",
    name: "Endocrinologia",
    icon: Scale,
    description: "Diagnóstico e tratamento de distúrbios hormonais e metabólicos.",
    detailedDescription: "Um endocrinologista é um médico especializado no diagnóstico e tratamento de distúrbios hormonais e metabólicos. Esses distúrbios podem afetar uma ampla gama de sistemas do corpo, incluindo metabolismo, crescimento, reprodução, regulação de peso, entre outros. Alguns dos distúrbios mais comuns tratados por endocrinologistas incluem diabetes, doenças da tireoide, distúrbios da glândula adrenal, distúrbios da hipófise, distúrbios da reprodução, como infertilidade e menopausa, entre outros.",
    symptoms: ["Excesso de peso", "Alterações no ciclo menstrual", "Aumento da tireoide", "Sede excessiva", "Cansaço excessivo", "Sintomas de menopausa"],
    indications: "É recomendado consultar o endocrinologista quando forem percebidos sinais ou sintomas que possam ser indicativos de alteração na produção de hormônios.",
    introduction: "Esta passando por alguma alguma alteração hormonal, como alterações rápidas de peso, aumento do volume de urina e da sede, sintomas de menopausa?\nConsultar um endocrinologista é importante para obter um diagnóstico preciso e um plano de tratamento adequado.",
    whoIsDoctor: {
      title: "Quem é o médico Endocrinologista?",
      description: "Um endocrinologista é um médico especializado no diagnóstico e tratamento de distúrbios hormonais e metabólicos. Esses distúrbios podem afetar uma ampla gama de sistemas do corpo, incluindo metabolismo, crescimento, reprodução, regulação de peso, entre outros. Alguns dos distúrbios mais comuns tratados por endocrinologistas incluem diabetes, doenças da tireoide, distúrbios da glândula adrenal, distúrbios da hipófise, distúrbios da reprodução, como infertilidade e menopausa, entre outros."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "É recomendado consultar o endocrinologista quando forem percebidos sinais ou sintomas que possam ser indicativos de alteração na produção de hormônios, como:\n• Excesso de peso;\n• Aumento rápido de peso;\n• Cansaço excessivo;\n• Alterações no ciclo menstrual;\n• Aumento da tireoide;\n• Excesso de pelos nas mulheres;\n• Crescimento das mamas nos meninos;\n• Sinais e sintomas de andropausa e menopausa;\n• Presença de sintomas relacionados com a diabetes como sede excessiva e aumento da vontade para urinar, por exemplo.\n\nNa presença deste tipo de sintomas, o endocrinologista irá fazer uma avaliação clínica e poderá indicar a realização de exames de sangue."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta com endocrinologista começa com uma entrevista chamada anamnese. É durante essa etapa que o médico coleta informações sobre o histórico de saúde, doenças preexistentes e o motivo da visita do paciente ao consultório. Portanto, é fundamental compartilhar todos os sintomas e razões para o encontro.\nO endocrinologista geralmente realiza o exame clínico e, se preciso, solicita procedimentos complementares como testes laboratoriais e de imagem, a fim de visualizar estruturas como a tireoide, ovários ou testículos.\nA escolha dos testes complementares vai depender da suspeita clínica formada a partir da anamnese e exame físico."
    }
  },
  {
    id: "gastroenterologia",
    name: "Gastroenterologia",
    icon: Flame,
    description: "Diagnóstico, tratamento e prevenção de doenças que afetam o sistema digestivo.",
    detailedDescription: "O Gastroenterologista é o médico especializado em diagnosticar, tratar e prevenir doenças que afetam o sistema digestivo, incluindo esôfago, estômago, intestinos e fígado. Ele cuida tanto de condições comuns, como gastrite e refluxo, quanto de doenças mais complexas que podem comprometer a qualidade de vida. Seu objetivo é garantir o bom funcionamento do sistema digestivo, essencial para a saúde geral do corpo.",
    symptoms: ["Gastrite e refluxo", "Dores abdominais recorrentes", "Intolerâncias alimentares", "Constipação ou diarreia persistente", "Pedra na vesícula", "Inchaço abdominal constante"],
    indications: "É importante procurar o gastroenterologista quando houver sinais como azia recorrente, dores abdominais constantes ou distúrbios digestivos.",
    introduction: "A melhor forma de não ter doenças é a prevenção. Seu corpo precisa da sua atenção!\nPor isso, o primeiro passo é ir a um Gastroenterologista regularmente para saber quando há alguma coisa que pode ser errada ou incrementar novos hábitos saudáveis à sua rotina.",
    whoIsDoctor: {
      title: "Quem é o médico Gastroenterologista?",
      description: "O Gastroenterologista é o médico especializado em diagnosticar, tratar e prevenir doenças que afetam o sistema digestivo, incluindo esôfago, estômago, intestinos e fígado. Ele cuida tanto de condições comuns, como gastrite e refluxo, quanto de doenças mais complexas que podem comprometer a qualidade de vida. Seu objetivo é garantir o bom funcionamento do sistema digestivo, essencial para a saúde geral do corpo."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "É importante procurar o gastroenterologista quando houver sinais como:\n• Azia ou queimação frequente;\n• Dores abdominais recorrentes;\n• Náuseas, vômitos ou dificuldade para engolir;\n• Prisão de ventre ou diarreia persistente;\n• Presença de sangue nas fezes;\n• Inchaço abdominal constante ou gases em excesso;\n• Alterações repentinas no apetite ou no peso;\n• Histórico familiar de doenças do sistema digestivo.\n\nConsultas preventivas também são indicadas, especialmente após os 40 anos, ou em pessoas com fatores de risco."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "Na consulta, o médico começa investigando os sintomas, hábitos alimentares e histórico clínico do paciente. Em seguida, realiza um exame físico e pode solicitar exames complementares, como endoscopia, colonoscopia, ultrassonografia ou exames laboratoriais. O atendimento é individualizado e busca não apenas tratar os sintomas, mas também encontrar a causa do problema, muitas vezes relacionada à alimentação e ao estilo de vida."
    },
    diseasesTreated: {
      title: "Quais as doenças tratadas pelo Gastroenterologista?",
      list: [
        "Gastrite e úlceras",
        "Doença do refluxo gastroesofágico (DRGE)",
        "Síndrome do intestino irritável",
        "Doença celíaca e intolerâncias alimentares",
        "Doença de Crohn e retocolite ulcerativa",
        "Hepatites e doenças do fígado",
        "Pedra na vesícula",
        "Cânceres do aparelho digestivo",
        "Constipação e diarreia crônica"
      ]
    }
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
    description: "Diagnóstico, tratamento e acompanhamento de doenças do sistema nervoso.",
    detailedDescription: "O neurologista é o médico especializado no diagnóstico, tratamento e acompanhamento de doenças que afetam o sistema nervoso central (cérebro e medula espinhal), periférico (nervos) e músculos. Atua em condições como enxaqueca, epilepsia, doença de Parkinson, Alzheimer, esclerose múltipla, distúrbios do sono, neuropatias, entre outras.",
    symptoms: ["Dores de cabeça frequentes", "Tonturas ou vertigens", "Problemas de memória", "Distúrbios do sono", "Tremores", "Perda de força"],
    indications: "É recomendável procurar um neurologista ao apresentar sintomas como dores de cabeça frequentes, tonturas persistentes, esquecimentos ou distúrbios do sono.",
    introduction: "Seu cérebro merece cuidado especializado. Sua história merece a escuta atenta de uma neurologista.\nDescubra a causa das suas dores de cabeça, tonturas, insônia ou esquecimentos e trate com segurança, precisão e acolhimento.",
    whoIsDoctor: {
      title: "Quem é o médico neurologista?",
      description: "O neurologista é a médico especializado no diagnóstico, tratamento e acompanhamento de doenças que afetam o sistema nervoso central (cérebro e medula espinhal), periférico (nervos) e músculos. Atua em condições como enxaqueca, epilepsia, doença de Parkinson, Alzheimer, esclerose múltipla, distúrbios do sono, neuropatias, entre outras.\nAlém de tratar doenças já estabelecidas, o neurologista também realiza avaliações preventivas, orienta sobre hábitos de vida saudáveis e trabalha em conjunto com outros profissionais de saúde para oferecer um cuidado integral ao paciente."
    },
    whenToConsult: {
      title: "Quando marcar uma consulta?",
      description: "É recomendável procurar uma neurologista ao apresentar sintomas como:\n• Dores de cabeça frequentes ou intensas\n• Tonturas ou vertigens persistentes\n• Perda de força ou sensibilidade em membros\n• Convulsões ou desmaios\n• Distúrbios do sono, como insônia ou sonolência excessiva\n• Problemas de memória ou concentração\n• Tremores, tiques ou movimentos involuntários\n• Alterações na fala, visão ou audição sem causa aparente\n\nAlém disso, pessoas com histórico familiar de doenças neurológicas ou que já possuem diagnóstico de condições como esclerose múltipla, Parkinson, Alzheimer ou AVC devem realizar acompanhamento regular."
    },
    howIsConsult: {
      title: "Como é a consulta com um neurologista?",
      description: "A primeira consulta é um momento de escuta e análise cuidadosa. Nela realizamos:\n• Anamnese completa\n• Exame neurológico detalhado\n• Orientação sobre exames complementares (ressonância, EEG, doppler etc.)\n• Plano de tratamento individualizado\n\nCada atendimento é pensado para acolher a pessoa, não apenas a doença."
    }
  },
  {
    id: "ortopedia",
    name: "Ortopedia",
    icon: Bone,
    description: "Cuidados com ossos, músculos, articulações e lesões.",
    detailedDescription: "O Ortopedista diagnostica e trata problemas mecânicos e inflamatórios do aparelho locomotor, que inclui ossos, articulações, tendões, ligamentos e músculos. Atua em casos de traumas, fraturas, artrose, tendinites e desvios posturais.",
    symptoms: ["Dores nas articulações", "Dor constante nas costas", "Lesões esportivas", "Fraturas ósseas", "Dificuldades de mobilidade"],
    indications: "Procure após quedas ou acidentes com suspeita de fraturas e luxações, ou no caso de dores crônicas nos ossos ou articulações que afetam a mobilidade.",
    introduction: "Você está sofrendo de dores nas articulações, lesões esportivas, fraturas ósseas ou outras condições relacionadas ao sistema musculoesquelético?\nProcure um ortopedista, ele pode ajudá-lo a se sentir melhor e a recuperar a sua mobilidade.",
    whoIsDoctor: {
      title: "O que faz um ortopedista?",
      description: "A ortopedia é a especialidade médica responsável pelo diagnóstico, tratamento e prevenção de doenças e lesões do sistema musculoesquelético, ou seja, ossos, músculos, tendões, ligamentos e articulações. Os ortopedistas são médicos que se especializam nessa área e são treinados para ajudar a restaurar a mobilidade e a função das pessoas que sofrem de lesões ou doenças relacionadas ao sistema musculoesquelético.\nOs ortopedistas são médicos especializados em diagnosticar e tratar doenças e lesões musculoesqueléticas. Eles trabalham em estreita colaboração com outros profissionais de saúde para garantir que seus pacientes recebam o melhor tratamento possível e se recuperem completamente após uma lesão ou cirurgia."
    },
    whenToConsult: {
      title: "Por que consultar um ortopedista?",
      description: "Existem muitas razões pelas quais uma pessoa pode precisar consultar um ortopedista. Algumas das razões mais comuns incluem:\n• Dores ou desconforto nas articulações: se você tiver dores ou desconforto nas articulações que não melhoram com o tempo, um ortopedista pode ajudar a determinar a causa e prescrever um tratamento eficaz.\n• Lesões esportivas: se você é um atleta ou pratica atividades físicas regulares, pode sofrer lesões esportivas. Um ortopedista pode ajudar a diagnosticar e tratar essas lesões, além de ajudá-lo a preveni-las no futuro.\n• Fraturas ósseas: se você quebrou um osso, um ortopedista pode ajudá-lo a reparar o dano e garantir uma recuperação completa.\n• Doenças musculoesqueléticas crônicas: se você sofre de uma doença musculoesquelética crônica, como artrite, um ortopedista pode ajudá-lo a gerenciar a dor e a inflamação.\n• Cirurgia ortopédica: se você precisar de uma cirurgia ortopédica para corrigir um problemático grave, um ortopedista pode realizar a operação com segurança e eficácia."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta com o ortopedista geralmente envolve uma avaliação física, exames de imagem e testes de função física. Com base nos resultados desses exames, o ortopedista pode fazer um diagnóstico e recomendar um plano de tratamento.\nO tratamento pode variar amplamente dependendo da condição do paciente. Algumas opções de tratamento comuns incluem medicamentos para controlar a dor e a inflamação, terapia física para melhorar a mobilidade e a força muscular e cirurgia para reparar danos graves."
    }
  },
  {
    id: "otorrinolaringologia",
    name: "Otorrinolaringologia",
    icon: Ear,
    description: "Diagnóstico e tratamento de doenças do ouvido, nariz e garganta.",
    detailedDescription: "O Otorrinolaringologista (incluindo a especialidade Pediátrica) é o médico especializado em cuidar da saúde do ouvido, nariz e garganta. Ele trata desde infecções comuns até condições mais complexas que afetam a respiração, audição, fala e deglutição, promovendo diagnósticos precisos e tratamentos humanizados.",
    symptoms: ["Dores de ouvido", "Dificuldade para ouvir", "Roncos ou apneia", "Obstrução nasal", "Infecções de garganta recorrentes"],
    indications: "Consulte o otorrinolaringologista na presença de dores de ouvido frequentes, perda auditiva, obstrução nasal crônica ou ronco.",
    introduction: "A melhor forma de não ter doenças é a prevenção. Seu corpo precisa da sua atenção!\nPor isso, o primeiro passo é ir a um otorrinolaringologista regularmente para saber quando há alguma coisa que pode ser errada ou incrementar novos hábitos saudáveis à sua rotina.",
    whoIsDoctor: {
      title: "Quem é o médico Otorrinolaringologista?",
      description: "O Otorrinolaringologista Pediátrico é o médico especializado em cuidar da saúde do ouvido, nariz e garganta das crianças. Ele tem conhecimento específico sobre o desenvolvimento infantil e as particularidades do organismo dos pequenos, tratando desde infecções comuns até condições mais complexas que afetam a respiração, audição, fala e deglutição. Seu olhar é atento às necessidades da infância, promovendo diagnósticos precisos e tratamentos humanizados, sempre com foco no bem-estar e no crescimento saudável da criança."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "É importante agendar uma consulta sempre que a criança apresentar:\n• Dores de ouvido frequentes ou secreção;\n• Dificuldade para ouvir ou entender o que os outros falam;\n• Roncos intensos, apneia do sono ou respiração pela boca;\n• Atrasos na fala ou na linguagem;\n• Amigdalites e infecções de garganta recorrentes;\n• Obstrução nasal persistente, mesmo sem gripe ou resfriado.\n\nAlém disso, crianças com histórico de otite de repetição, alergias respiratórias ou que convivem com ronco noturno devem ser avaliadas com atenção."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta é realizada de forma acolhedora e lúdica, respeitando o tempo e o conforto da criança. O médico inicia com uma conversa com os pais para entender os sintomas, histórico médico e hábitos da criança. Em seguida, realiza um exame físico cuidadoso, utilizando instrumentos específicos para observar os ouvidos, nariz e garganta. Quando necessário, podem ser solicitados exames como audiometria, nasofibroscopia ou exames de imagem. O objetivo é garantir um diagnóstico seguro e um tratamento eficaz, sempre envolvendo os pais nas decisões."
    }
  },
  {
    id: "pediatria",
    name: "Pediatria",
    icon: Smile,
    description: "Cuidado e carinho com a saúde e desenvolvimento infantil.",
    detailedDescription: "O Pediatra acompanha o desenvolvimento global de crianças e adolescentes, atuando na prevenção de doenças através da vacinação, orientação alimentar, monitoramento do crescimento e tratamento de patologias infantis.",
    symptoms: ["Febre em crianças", "Tosse forte", "Enjoos ou vômitos", "Alergias ou erupções na pele", "Atrasos no desenvolvimento"],
    indications: "Indicado para consultas mensais de acompanhamento no primeiro ano de vida (puericultura), revisões periódicas do crescimento e sempre que a criança adoecer.",
    introduction: "A melhor forma de não ter doenças é a prevenção. Seu pequeno precisa da sua atenção!\nPor isso, o primeiro passo é levar as crianças a Pediatra regularmente para saber quando há alguma coisa que pode ser errada ou incrementar novos hábitos saudáveis à sua rotina.",
    whoIsDoctor: {
      title: "Quem é o médico Pediatra?",
      description: "O Pediatra é o médico especializado em cuidar da saúde de bebês, crianças e adolescentes, acompanhando seu crescimento e desenvolvimento físico, emocional e social. Ele é responsável por prevenir, diagnosticar e tratar doenças comuns na infância, além de orientar os pais sobre alimentação, vacinação, sono, higiene e hábitos saudáveis. Mais do que tratar, o pediatra atua como parceiro da família na construção de uma vida saudável para a criança."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "A consulta pediátrica deve ser agendada:\n• Logo após o nascimento, para o acompanhamento do bebê;\n• Em consultas de rotina para verificar peso, altura e desenvolvimento;\n• Sempre que houver febre persistente, tosse forte ou dificuldade para respirar;\n• Em casos de alergias, diarreia, vômitos frequentes ou erupções na pele;\n• Quando houver atrasos no desenvolvimento motor ou de fala;\n• Para orientações sobre introdução alimentar, vacinação e cuidados gerais.\n\nMesmo quando a criança está saudável, o acompanhamento preventivo é essencial para detectar precocemente qualquer alteração."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta começa com uma conversa entre o médico e os pais para entender o histórico de saúde, rotina e queixas da criança. O pediatra realiza um exame físico completo, avaliando peso, altura, batimentos cardíacos, respiração, reflexos e outros sinais importantes. Dependendo da idade, também observa marcos do desenvolvimento, como coordenação motora, linguagem e comportamento. É um momento para esclarecer dúvidas, receber orientações personalizadas e fortalecer os cuidados com a saúde da criança."
    },
    diseasesTreated: {
      title: "Quais as doenças tratadas pelo Pediatra?",
      list: [
        "Infecções respiratórias (gripe, bronquite, pneumonia)",
        "Alergias alimentares e respiratórias",
        "Otites e amigdalites",
        "Problemas gastrointestinais (diarreia, refluxo, constipação)",
        "Doenças exantemáticas (catapora, sarampo, rubéola)",
        "Distúrbios do crescimento e desenvolvimento",
        "Anemias e deficiências nutricionais",
        "Doenças crônicas da infância (asma, diabetes infantil)"
      ]
    }
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
    description: "Prevenção e tratamento de problemas do sistema respiratório.",
    detailedDescription: "O Pneumologista é o médico especialista nos pulmões e vias aéreas. Trata doenças como asma, bronquite crônica, enfisema (DPOC), pneumonias, tosses persistentes e distúrbios respiratórios do sono.",
    symptoms: ["Falta de ar", "Tosse persistente", "Chiado no peito", "Catarro crônico", "Dificuldade para respirar"],
    indications: "Indicado no diagnóstico de falta de ar crônica, asma, DPOC, tosses persistentes ou para exames preventivos em fumantes.",
    introduction: "Está enfrentando sintomas respiratórios, como tosse persistente, falta de ar, chiado no peito ou qualquer outra preocupação relacionada à saúde pulmonar?\nConsultar um pneumologista é importante para obter um diagnóstico preciso e um plano de tratamento adequado.",
    whoIsDoctor: {
      title: "Quem é o médico Pneumologista?",
      description: "Um pneumologista é um médico especializado no diagnóstico e tratamento de doenças relacionadas aos pulmões e ao sistema respiratório. Eles lidam com uma ampla variedade de condições, desde problemas respiratórios agudos, como pneumonia e bronquite, até doenças crônicas, como asma, doença pulmonar obstitutiva crônica (DPOC), fibrose pulmonar e câncer de pulmão.\nOs pneumologistas também tratam distúrbios do sono, como apneia do sono e insônia relacionada a problemas respiratórios. Eles podem realizar testes de função pulmonar para avaliar a capacidade pulmonar e ajudar no diagnóstico de doenças pulmonares. Além disso, os pneumologistas podem estar envolvidos no tratamento de pacientes em unidades de terapia intensiva (UTI) que requerem suporte respiratório avançado."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "É recomendado consultar o pneumologista quando são observados sinais e sintomas que possam indicar alterações respiratórias, como por exemplo:\n• Tosse que não melhora após 3 semanas;\n• Tosse com sangue ou catarro;\n• Dor no peito ou sensação de pressão;\n• Tonturas, vertigem ou desmaio;\n• Dificuldade para respirar, principalmente durante o exercício;\n• Cansaço excessivo;\n• Chiado ao respirar;\n• Resfriado frequente.\n\nAssim, é importante que o pneumologista seja consultado assim que forem notados os primeiros sinais e sintomas, principalmente se a pessoa fumar com frequência, para que sejam feitos exames, seja identificada a causa dos sintomas e, assim, seja possível iniciar o tratamento mais adequado."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "De forma geral, durante a consulta, o pneumologista avalia os sinais e sintomas apresentados pela pessoa, seus antecedentes médicos e familiares, além de ser realizada a ausculta dos pulmões e do coração com o objetivo de identificar a presença de algum ruído respiratório.\nAlém disso, para identificar a causa dos sintomas, o médico pode indicar a realização de alguns exames, como espirometria, oximetria, exames de sangue, radiografia de tórax, tomografia computadorizada, broncoscopia, ecografia e/ ou biópsia pleural, por exemplo."
    }
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
    description: "Diagnóstico de doenças autoimunes e das articulações.",
    detailedDescription: "O Reumatologista atua no tratamento de doenças crônicas não-traumáticas das articulações e dos tecidos que as envolvem, além de doenças autoimunes e inflamatórias sistêmicas como artrite reumatoide, gota, fibromialgia, artrose e lúpus.",
    symptoms: ["Dores e inchaços nas articulações", "Rigidez nas juntas ao acordar", "Dores musculares e fadiga", "Dificuldades de mobilidade"],
    indications: "Procure caso sinta dores ou inchaço recorrentes nas juntas que durem mais de algumas semanas, rigidez articular prolongada pela manhã ou dores generalizadas inexplicáveis.",
    introduction: "Atendimento integral e especializado para você aproveitar o melhor da vida com saúde e independência!\nConsultar um Reumatologista é importante para obter um diagnóstico preciso e um plano de tratamento adequado.",
    whoIsDoctor: {
      title: "Quem é o médico Reumatologista?",
      description: "O reumatologista é o médico que cuida dos problemas inflamatórios relacionados às articulações e à todas as estruturas que ficam em seu entorno, também conhecido como “reumatismo de partes moles” (músculos, ligamentos, bursas e tendões).\nApesar das articulações serem o local mais acometido, praticamente todos os órgãos do corpo humano podem apresentar manifestações de doenças reumáticas, como pulmões, rins, cérebro, pele e coração.\nNa consulta com o reumatologista a abordagem é avaliar o paciente como um todo e não apenas levar em consideração um problema em específico, para realizarmos o diagnóstico de forma correta é importante compreender as particularidades de cada indivíduo, para identificar as melhores estratégias de tratamento e alcançar o sucesso desejado."
    },
    whenToConsult: {
      title: "Quando marcar consulta?",
      description: "É recomendado procurar um reumatologista quando surgirem sintomas que possam indicar a presença de doenças reumatológicas, especialmente quando houver ocorrência de artrite nas articulações. Esses sintomas podem incluir:\n• Dor;\n• Inchaço;\n• Vermelhidão e sensação de calor nas articulações;\n• Fadiga;\n• Febre;\n• Dificuldades de mobilidade.\n\nO reumatologista é o especialista capacitado para realizar uma avaliação completa, diagnosticar e oferecer o tratamento adequado para essas condições."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta tem duração aproximada de 30 minutos e nela iremos abordar de maneira completa o histórico do seu problema e da sua saúde de forma geral e para aproveitar ao máximo a consulta é importante seguir algumas orientações:\n• Em primeiro lugar leve anotado os principais problemas e dúvidas que você gostaria de discutir;\n• Em segundo lugar tenha em mãos o nome dos medicamentos que você utiliza diariamente para tratar outros problemas de saúde como: pressão alta, diabetes ansiedade, tenha também o nome dos medicamentos que você já tentou utilizar para tratar o problema atual, além disso traga os exames que você já realizou mesmo que seja um pouco antigo, pois eles irão ajudar a entender melhor o seu problema;\n• E por último venha sem esmalte nas unhas e com roupas que facilitam a avaliação do seu problema, por exemplo: se o problema for uma dor no joelho é importante que você venha com um short ou calça que permita a visualização melhor dessa região;"
    }
  },
  {
    id: "vascular",
    name: "Cirurgia Vascular",
    icon: HeartPulse,
    description: "Prevenção, diagnóstico e tratamento de doenças que afetam veias, artérias e vasos linfáticos.",
    detailedDescription: "O cirurgião vascular é o especialista responsável por prevenir, diagnosticar e tratar doenças que afetam veias, artérias e vasos linfáticos. Ele cuida de problemas como varizes, trombose, aneurismas, placas de colesterol nas artérias, má circulação, úlceras vasculares e inchaços.",
    symptoms: ["Inchaço nas pernas", "Cansaço ou dor", "Varizes visíveis ou vasinhos", "Dormência ou formigamento", "Feridas que não cicatrizam"],
    indications: "As doenças vasculares costumam evoluir de forma silenciosa. Por isso, é essencial realizar avaliações periódicas com um médico vascular para manter a saúde da sua circulação em dia.",
    introduction: "A sua circulação fala com você: varizes, manchas roxas, inchaço e cansaço são sinais de alerta. Procure um médico vascular.\nAs doenças vasculares costumam evoluir de forma silenciosa. Por isso, é essencial realizar avaliações periódicas com um médico vascular para manter a saúde da sua circulação em dia.",
    whoIsDoctor: {
      title: "Quem é o médico vascular?",
      description: "O cirurgião vascular é o especialista responsável por prevenir, diagnosticar e tratar doenças que afetam veias, artérias e vasos linfáticos. Ele cuida de problemas como varizes, trombose, aneurismas, placas de colesterol nas artérias, má circulação, úlceras vasculares e inchaços.\n\nAlém dos tratamentos clínicos e cirúrgicos, o médico vascular também orienta sobre hábitos que favorecem a saúde circulatória, prevenindo complicações e melhorando a qualidade de vida dos pacientes que o procuram."
    },
    whenToConsult: {
      title: "Quando marcar uma consulta?",
      description: "Se você apresenta sinais e sintomas como:\n• Inchaço nas pernas\n• Cansaço ou dor nas pernas\n• Sensação de peso nos membros inferiores ou superiores\n• Varizes visíveis ou vasinhos\n• Feridas que não cicatrizam\n• Dormência ou formigamento\n• Manchas escuras na pele\n\nÉ indicado agendar uma consulta para avaliação especializada."
    },
    howIsConsult: {
      title: "Como é a consulta com um médico vascular?",
      description: "Na consulta vascular, a Dra. Jéssica realiza uma avaliação completa da saúde circulatória do paciente relacionada a sua queixa. O atendimento começa com uma conversa detalhada sobre sinais e sintomas, histórico familiar, estilo de vida e doenças pré-existentes.\nEm seguida, a especialista faz um exame físico e, se necessário, solicita exames complementares, como o Doppler vascular, para avaliar o funcionamento das veias e artérias.\nCom base no diagnóstico, a cirurgiã vascular indica o melhor tratamento, que pode incluir mudanças de hábitos, uso de meias de compressão, medicamentos, procedimentos minimamente invasivos ou cirurgias, dependendo de cada caso.\nO objetivo é identificar precocemente alterações na circulação, prevenir complicações e proporcionar mais qualidade de vida ao paciente."
    }
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
    indications: "Indicada para o tratamento de depression, transtorno bipolar, esquizofrenia, TDAH, transtornos de ansiedade crônicos e situações em que há necessidade de intervenção medicamentosa associada ou não à psicoterapia."
  }
];
