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
  Flame,
  Scissors,
  Weight,
  BriefcaseMedical,
  ClipboardPlus,
  SmilePlus,
  Heart,
  UsersRound
} from "lucide-react";
import React from "react";

export const MarsIcon = (props: any) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: "currentColor",
      strokeWidth: "2",
      strokeLinecap: "round",
      strokeLinejoin: "round",
      ...props
    },
    React.createElement("path", { d: "M16 3h5v5" }),
    React.createElement("path", { d: "m21 3-7 7" }),
    React.createElement("circle", { cx: "10", cy: "14", r: "5" })
  );

export const StomachIcon = (props: any) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 33 35",
      fill: "currentColor",
      ...props
    },
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M15.43,1.81c.02.56.12.89.29,1.09.24.29.49.39.78.42.34.03.77-.05,1.34-.23.28-.09.57-.19.88-.3.03-.01.06-.02.1-.03.28-.1.57-.21.86-.3.64-.21,1.38-.41,2.13-.41,4.8,0,7.65,3.75,9.53,7.1,2.3,4.11,2.21,9.24-.25,13.26-1.61,2.65-3.68,4.94-6.81,6.15-4.54,1.76-9.54,1.08-13.67-.96-.92-.45-2,.24-2,1.13v6.27h-2v-6.27c0-2.55,2.8-3.95,4.88-2.93,3.74,1.85,8.16,2.4,12.06.88,2.57-1,4.33-2.89,5.82-5.33,2.08-3.41,2.16-7.77.21-11.24-1.85-3.3-4.19-6.07-7.78-6.07-.42,0-.91.12-1.5.31-.26.09-.53.18-.81.28-.03.01-.06.02-.09.03-.31.11-.63.23-.96.33-.64.2-1.37.37-2.11.31-.79-.07-1.53-.41-2.13-1.12-.6-.72-.74-1.61-.76-2.31-.01-.36,0-.72.02-1.03,0-.05,0-.09,0-.14.01-.27.02-.49.02-.7h2c0,.26-.01.54-.03.81,0,.04,0,.09,0,.13-.02.31-.03.6-.02.87ZM6.86.51c0-.17,0-.34,0-.51h2c0,.13,0,.25,0,.37,0,2.73,0,5.03,1.27,7.17.88,1.49,2.19,2.53,3.68,3.72.22.17.44.35.66.53,1.8,1.46,2.19,3.44,1.57,5.17-.59,1.67-2.08,3.04-3.91,3.57-.98.28-1.92.49-2.77.68-.2.04-.39.09-.58.13-1.01.23-1.87.45-2.63.77-1.44.6-2.62,1.56-3.56,3.87-.39.96-.59,1.98-.59,3.01v6.01H0v-6.01c0-1.29.25-2.57.74-3.77,1.14-2.78,2.69-4.16,4.65-4.97.93-.39,1.94-.64,2.95-.87.2-.05.41-.09.61-.14.84-.19,1.71-.38,2.63-.65,1.25-.36,2.21-1.29,2.58-2.32.34-.95.18-2.03-.95-2.95-.21-.17-.42-.33-.63-.5-1.47-1.17-3.09-2.45-4.17-4.28-1.56-2.63-1.55-5.45-1.55-8.06Z"
    })
  );

export const HormoneIcon = (props: any) =>
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 33 34.7",
      fill: "currentColor",
      ...props
    },
    React.createElement("path", {
      d: "M15.43,24.51c.6,0,1.1-1.21,1.1-2.71,0,1.5.49,2.71,1.1,2.71s1.1-1.21,1.1-2.71-.49-2.71-1.1-2.71-1.1,1.21-1.1,2.71c0-1.5-.49-2.71-1.1-2.71s-1.1,1.21-1.1,2.71.49,2.71,1.1,2.71Z"
    }),
    React.createElement("path", {
      fillRule: "evenodd",
      d: "M32.95,32.53h0v-1.28c.04-1.22-.18-2.44-.64-3.58-.47-1.14-1.17-2.19-2.07-3.07-.9-.89-1.98-1.6-3.18-2.09-.59-.24-1.21-.43-1.84-.56-.64-.14-1.3-.21-1.97-.22h-1.4v-1.28h.59c.28,0,.55-.03.82-.08h.03c.55-.12,1.06-.36,1.5-.69.1-.08.2-.16.29-.24.7-.65,1.09-1.53,1.1-2.44v-2.27c0,.09.6.04.89.01.07,0,.13-.01.15-.01.26-.04.49-.16.66-.35.16-.19.25-.43.23-.67h0s0,0,0,0c-.06-.36-.19-.71-.38-1.04l-.51-1.2c-.36-.83-.72-1.66-1.06-2.51,0,0-.21-1.97-.4-2.65-.59-1.81-1.78-3.39-3.41-4.52S18.74.01,16.71,0c-1.96,0-3.87.56-5.47,1.62-1.6,1.06-2.8,2.56-3.44,4.28-.64,1.73-.68,3.6-.13,5.35.56,1.75,1.69,3.3,3.23,4.42v6.04h-1.75c-2.36,0-4.62.86-6.31,2.4-1.7,1.54-2.69,3.64-2.75,5.85v2.57s-.07-.02-.1-.02v2.18s.07.01.1.01h32.85s.03,0,.05,0v-2.17s-.03,0-.05,0ZM30.76,31.25v1.28h-13.14v-4.34c0-.6-.49-1.08-1.1-1.08s-1.1.49-1.1,1.08v4.34H2.29v-2.53c.05-1.59.77-3.13,2.04-4.29,1.28-1.16,3.03-1.83,4.87-1.83h1.71c1.21,0,2.19-.97,2.19-2.17v-6.04c0-.69-.33-1.34-.89-1.75-1.18-.86-2.03-2.03-2.44-3.32-.41-1.29-.38-2.67.09-3.95.47-1.28,1.37-2.41,2.6-3.23,1.23-.81,2.71-1.26,4.24-1.26,1.59.01,3.12.5,4.36,1.37,1.23.86,2.12,2.04,2.57,3.36.05.19.12.66.2,1.24.04.27.07.53.09.72.01.09.02.17.03.22v.06s0,.02,0,.02c.02.19.07.39.14.57.35.88.72,1.73,1.08,2.55h0s.17.42.17.42c-.81.32-1.39,1.1-1.39,2.02v2.26c0,.3-.13.62-.41.87-.28.26-.68.43-1.13.43h-.59c-1.21,0-2.19.97-2.19,2.17v1.28c0,1.2.98,2.17,2.19,2.17h1.38c1.03.02,2.05.23,2.98.62.94.39,1.79.94,2.48,1.63.7.68,1.23,1.48,1.58,2.35.35.86.52,1.78.48,2.69,0,.02,0,.05,0,.07Z"
    })
  );

export const IntestineIcon = (props: any) =>
  React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
    React.createElement("g", { fill: "currentColor" },
      React.createElement("path", { d: "M15.176 2.062a1 1 0 0 1 1 1v2.232a4.43 4.43 0 0 1-.967 2.763c.492.187.962.47 1.356.875A4.4 4.4 0 0 1 17.801 12a4.4 4.4 0 0 1-1.236 3.067c-.4.413-.861.7-1.347.89c.617.775.956 1.746.956 2.749v2.225a1 1 0 1 1-2 0v-2.226c0-.632-.244-1.234-.67-1.673c-.482-.496-1.066-.778-1.584-.778a1 1 0 0 1-.112-.006a1 1 0 0 1-.111.006h-2.17a1 1 0 1 1 0-2h2.17q.056 0 .111.006q.055-.006.112-.006h1.626c.672 0 1.21-.195 1.585-.58c.426-.44.67-1.04.67-1.674s-.244-1.235-.67-1.674c-.358-.368-.98-.58-1.684-.58h-1.625l-.063-.002l-.062.002h-1.085a1 1 0 1 1 0-2h1.085l.062.002q.03-.002.063-.002c.293 0 .582-.06.853-.175c.242-.103.594-.359.83-.602c.211-.218.38-.477.495-.765a2.4 2.4 0 0 0 .176-.91V3.062a1 1 0 0 1 1-1" }),
      React.createElement("path", { d: "M9.209 13c-.31 0-.618.067-.904.197a2.3 2.3 0 0 0-.757.565a2.43 2.43 0 0 0-.584 1.813a2.48 2.48 0 0 0 .8 1.541c.142.128.46.291.92.419c.44.121.887.176 1.19.17h.69a1.8 1.8 0 0 1 1.293.55a1.84 1.84 0 0 1 .52 1.289v1.37a1 1 0 1 1-2 0v-1.208H9.9a6.5 6.5 0 0 1-1.748-.244c-.575-.159-1.24-.425-1.721-.855A4.48 4.48 0 0 1 4.977 15.8l-.003-.024a4.45 4.45 0 0 1 .192-1.78a4.4 4.4 0 0 1 .88-1.556q.335-.38.743-.669a4.4 4.4 0 0 1-1.081-1.768a4.45 4.45 0 0 1-.191-1.781l.002-.025a4.48 4.48 0 0 1 1.453-2.805a4.3 4.3 0 0 1 2.927-1.099h.479V3.062a1 1 0 1 1 2 0v1.394a1.86 1.86 0 0 1-.521 1.29a1.8 1.8 0 0 1-1.293.548h-.691a2.3 2.3 0 0 0-1.567.59a2.48 2.48 0 0 0-.8 1.541a2.44 2.44 0 0 0 .584 1.813c.214.242.472.434.757.565s.594.197.904.197h2.71a1 1 0 0 1 0 2z" })
    )
  );

export const KidneysIcon = (props: any) =>
  React.createElement(
    "svg",
    { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", fill: "currentColor", ...props },
    React.createElement("path", {
      fill: "currentColor",
      fillRule: "evenodd",
      clipRule: "evenodd",
      d: "M9.193 10.588L9.055 11q.37 0 .644.012c.28.012.618.037.913.152a1.33 1.33 0 0 1 .818.888c.072.253.07.537.07.686V19a1 1 0 0 1-2 0v-5.992A30 30 0 0 0 8.713 13l-.004.13c-.008.281-.017.614-.036.88c-.026.357-.088 1.004-.398 1.598c-.175.337-.46.714-.907.998A2.6 2.6 0 0 1 5.981 17c-1.195 0-1.961-.797-2.293-1.206c-.398-.49-.7-1.075-.922-1.6C2.336 13.176 2 11.879 2 10.909c0-.928.302-2.44.905-3.75C3.44 5.994 4.688 4 7.039 4c.564 0 1.218.13 1.801.56a2.8 2.8 0 0 1 1.04 1.547c.246.912.063 1.878-.083 2.49c-.158.667-.394 1.368-.582 1.928zm-2.485 2.557v.003C6.68 14.151 6.643 15 5.98 15c-.448 0-.941-.673-1.29-1.397c-.413-.906-.69-2.035-.69-2.694C4 9.682 4.912 6 7.039 6c1.587 0 .864 2.15-.268 3.922c-.203.603-.391 1.162-.468 1.578c-.102.55-.118 1.124-.131 1.645M14.945 11l-.138-.412l-.02-.062c-.19-.56-.425-1.26-.583-1.928c-.146-.612-.329-1.578-.083-2.49a2.8 2.8 0 0 1 1.039-1.549C15.742 4.13 16.398 4 16.96 4c2.35 0 3.599 1.994 4.134 3.159c.603 1.31.905 2.822.905 3.75c0 1.072-.468 2.43-1.002 3.44c-.283.536-.656 1.114-1.124 1.588c-.423.43-1.21 1.063-2.305 1.063a2.2 2.2 0 0 1-1.744-.852a2.55 2.55 0 0 1-.476-1.062c-.092-.445-.086-.945-.083-1.244q0-.162.004-.315q.005-.276.005-.527a29 29 0 0 0-.775.007V19a1 1 0 1 1-2-.001v-6.26c0-.15-.002-.433.07-.686a1.33 1.33 0 0 1 .818-.888c.294-.114.633-.14.913-.152q.274-.01.643-.012m2.216.5c.08.431.107.878.113 1.303c0 .19-.001.606-.004.78c-.014.817-.024 1.417.299 1.417c.512 0 1.035-.533 1.464-1.238q.126-.21.242-.434c.434-.85.725-1.826.725-2.419C20 9.682 19.088 6 16.961 6c-1.587 0-.864 2.15-.268 3.922c.203.603.391 1.162.468 1.578"
    })
  );

export const DentistryIcon = (props: any) => 
  React.createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 24 24",
      fill: "currentColor",
      ...props
    },
    React.createElement("path", {
      fill: "currentColor",
      d: "M17 2.125q1.65 0 2.825 1.175T21 6.125q0 .275-.038.738t-.112 1.062L19.475 18q-.125.95-.862 1.55t-1.688.6q-.575 0-1.062-.25t-.813-.7l-2.675-3.9q-.05-.1-.162-.137t-.238-.038q-.1 0-.4.225l-2.6 3.775q-.35.5-.862.763t-1.088.262q-.95 0-1.675-.612t-.85-1.563L3.15 7.925q-.075-.6-.112-1.062T3 6.125Q3 4.475 4.175 3.3T7 2.125q.9 0 1.438.238t1.037.512t1.063.513T12 3.625t1.463-.238t1.062-.512t1.05-.513T17 2.125m0 2q-.575 0-1.012.238t-.963.512t-1.225.513t-1.8.237t-1.8-.238t-1.225-.512t-.962-.513T7 4.126q-.825 0-1.412.588T5 6.125q0 .2.025.575t.1.875L6.5 17.7q.025.2.175.313t.35.112q.125 0 .225-.05t.15-.15l2.525-3.7q.35-.5.9-.8t1.175-.3t1.175.3t.9.8L16.65 18q.05.075.125.113t.175.037q.2 0 .363-.112t.187-.313l1.375-10.15q.075-.5.1-.875T19 6.125q0-.825-.587-1.412T17 4.125m-5 7"
    })
  );

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
    id: "vascular",
    name: "Angiologia e Cirurgia Vascular",
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
      description: "Na consulta vascular, a Dra. Jéssica realiza uma avaliação completa da saúde circulatória do paciente relacionada a sua queixa. O atendimento começa com uma conversa detalhada sobre sinais e sintomas, histórico familiar, estilo de vida e doenças pré-existentes.\nEm seguida, a especialista faz um exame físico e, se necessário, solicita exames complementares, como o Doppler vascular, para avaliar o funcionamento das veias e artérias.\nCom base no diagnóstico, a cirurgiã vascular indica o melhor tratamento, que pode incluir mudanças de hábitos, uso de meias de compressão, medicamentos, procedures minimamente invasivos ou cirurgias, dependendo de cada caso.\nO objetivo é identificar precocemente alterações na circulação, prevenir complicações e proporcionar mais qualidade de vida ao paciente."
    }
  },
  {
    id: "cardiologista",
    name: "Cardiologia",
    icon: Heart,
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
    id: "cirurgia-geral",
    name: "Cirurgia Geral",
    icon: ClipboardPlus,
    description: "Tratamento cirúrgico de hérnias, vesícula, apendicite e doenças abdominais.",
    detailedDescription: "O Cirurgião Geral é o médico especializado em realizar procedimentos cirúrgicos em diversas áreas do corpo, especialmente no aparelho digestivo, parede abdominal e tecidos moles. Atua desde cirurgias eletivas como herniorrafias e colecistectomias, até emergências cirúrgicas.",
    symptoms: ["Hérnias abdominais", "Dores abdominais agudas", "Nódulos ou cistos", "Pedra na vesícula", "Apendicite"],
    indications: "Procure o cirurgião geral quando houver indicação médica para procedimento cirúrgico, presença de hérnias, nódulos palpáveis ou dores abdominais que necessitem investigação cirúrgica."
  },
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
    id: "coloproctologia",
    name: "Coloproctologia",
    icon: IntestineIcon,
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
      description: "A consulta deve ser marcada sempre que houver alterações no funcionamento intestinal, como constipação, diarreia persistente, dor ao evacuar, sangramento nas fezes, coceira ou desconforto anal. Pessoas com histórico familiar de câncer colorretal ou com mais de 45 anos também devem realizar consultas periódicas para prevenção e rastreamento de doenças. Even sem sintomas, é indicado consultar o especialista anualmente como medida preventiva."
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
    id: "dermatologia",
    name: "Dermatologia",
    icon: SmilePlus,
    description: "Diagnóstico, prevenção e tratamento de doenças que afetam a pele, cabelos e unhas.",
    detailedDescription: "A Dermatologia é a especialidade médica responsável pelo estudo, prevenção e tratamento das doenças que afetam a pele, cabelos, pelos, unhas e mucosas. Atua tanto na área clínica e cirúrgica quanto estética, tratando desde acne e eczemas até cânceres de pele.",
    symptoms: ["Manchas ou alterações na cor da pele", "Acne severa", "Queda excessiva de cabelo", "Lesões, sinais ou verrugas suspeitas", "Coceira persistente ou dermatites"],
    indications: "Recomendado para todas as idades. Check-up anual de pintas (dermatoscopia) é indicado para prevenção do câncer de pele. Consulte sempre que notar alterações na pele, cabelos ou unhas."
  },
  {
    id: "endocrinologista",
    name: "Endocrinologia",
    icon: HormoneIcon,
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
      description: "É recomendado consultar o endocrinologista quando forem percebidos sinais ou sintomas que possam indicar alteração na produção de hormônios, como:\n• Excesso de peso;\n• Aumento rápido de peso;\n• Cansaço excessivo;\n• Alterações no ciclo menstrual;\n• Aumento da tireoide;\n• Excesso de pelos nas mulheres;\n• Crescimento das mamas nos meninos;\n• Sinais e sintomas de andropausa e menopausa;\n• Presença de sintomas relacionados com a diabetes como sede excessiva e aumento da vontade para urinar, por exemplo.\n\nNa presença deste tipo de sintomas, o endocrinologista irá fazer uma avaliação clínica e poderá indicar a realização de exames de sangue."
    },
    howIsConsult: {
      title: "Como é a consulta?",
      description: "A consulta com endocrinologista começa com uma entrevista chamada anamnese. É durante essa etapa que o médico coleta informações sobre o histórico de saúde, doenças preexistentes e o motivo da visita do paciente ao consultório. Portanto, é fundamental compartilhar todos os sintomas e razões para o encontro.\nO endocrinologista geralmente realiza o exame clínico e, se preciso, solicita procedimentos complementares como testes laboratoriais e de imagem, a fim de visualizar estruturas como a tireoide, ovários ou testículos.\nA escolha dos testes complementares vai depender da suspeita clínica formada a partir da anamnese e exame físico."
    }
  },
  {
    id: "gastroenterologia",
    name: "Gastroenterologia",
    icon: StomachIcon,
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
    id: "ginecologia-obstetricia",
    name: "Ginecologia e Obstetrícia",
    icon: Flower2,
    description: "Saúde integral da mulher, exames preventivos e acompanhamento pré-natal.",
    detailedDescription: "A Ginecologia e Obstetrícia cuida da saúde do sistema reprodutor feminino e das mamas, além de acompanhar a gestação, parto e puerpério. Realiza o preventivo (Papanicolau), orienta sobre métodos contraceptivos e trata disfunções hormonais e ginecológicas.",
    symptoms: ["Cólicas menstruais intensas", "Irregularidade menstrual", "Corrimentos atípicos", "Dores pélvicas", "Acompanhamento pré-natal"],
    indications: "Recomendado para todas as mulheres a partir da adolescência. Check-up ginecológico anual com Papanicolau, acompanhamento pré-natal e orientação contraceptiva."
  },
  {
    id: "nefrologista",
    name: "Nefrologista",
    icon: KidneysIcon,
    description: "Prevenção, diagnóstico e tratamento de doenças renais.",
    detailedDescription: "O Nefrologista é o médico responsável pela saúde dos rins. Ele previne a perda da função renal, trata infecções urinárias de repetição, cálculos renais, nefrites e acompanha pacientes com doença renal crônica.",
    symptoms: ["Urina com sangue ou muita espuma", "Inchaço constante nas pernas e olhos", "Dores na região lombar", "Infecções urinárias recorrentes"],
    indications: "Essencial para pacientes hipertensos ou diabéticos de longa data realizarem o rastreamento preventivo de perda de função renal, ou ao detectar alterações nos exames de ureia e creatinina."
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
    id: "odontologia",
    name: "Odontologia",
    icon: DentistryIcon,
    description: "Cuidados completos com a saúde bucal, prevenção e tratamentos dentários.",
    detailedDescription: "O especialista em Odontologia cuida da saúde dos dentes, gengivas e estruturas da boca. Realiza limpezas, tratamento de cáries, canais, extrações e procedimentos estéticos, essenciais para uma mastigação saudável e um sorriso confiante.",
    symptoms: ["Dor de dente", "Sangramento na gengiva", "Sensibilidade a alimentos frios/quentes", "Mau hálito", "Dentes quebrados ou ausentes"],
    indications: "Procure o cirurgião-dentista a cada 6 meses para avaliações preventivas e limpezas, ou sempre que notar dor, sangramento nas gengivas ou desconforto bucal."
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
      description: "A ortopedia é a especialidade médica responsável pelo diagnóstico, tratamento e prevenção de doenças e lesões do sistema musculoesquelético, ou seja, ossos, muscles, tendões, ligamentos e articulações. Os ortopedistas são médicos que se especializam nessa área e são treinados para ajudar a restaurar a mobilidade e a função das pessoas que sofrem de lesões ou doenças relacionadas ao sistema musculoesquelético.\nOs ortopedistas são médicos especializados em diagnosticar e tratar doenças e lesões musculoesqueléticas. Eles trabalham em estreita colaboração com outros profissionais de saúde para garantir que seus pacientes recebam o melhor tratamento possível e se recuperem completamente após uma lesão ou cirurgia."
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
    id: "psiquiatria",
    name: "Psiquiatria",
    icon: BrainCircuit,
    description: "Prevenção, diagnóstico e tratamento de distúrbios da mente e comportamento.",
    detailedDescription: "A Psiquiatria é a especialidade médica focada na prevenção, diagnóstico, tratamento e reabilitação de distúrbios mentais, emocionais e de comportamento. O psiquiatra avalia o paciente sob uma perspectiva médica e biológica, podendo prescrever medicamentos quando necessário para restaurar o equilíbrio e o bem-estar.",
    symptoms: ["Tristeza profunda ou desânimo", "Ansiedade severa ou crises de pânico", "Alterações graves de humor ou comportamento", "Insônia severa ou distúrbios do sono", "Ideias obsessivas ou medos irracionais", "Alucinações ou delírios"],
    indications: "Indicada para o tratamento de depression, transtorno bipolar, esquizofrenia, TDAH, transtornos de ansiedade crônicos e situações em que há necessidade de intervenção medicamentosa associada ou não à psicoterapia."
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
      description: "O reumatologista é o médico que cuida dos problemas inflamatórios relacionados às articulações e à todas as estruturas que ficam em seu entorno, também conhecido como “reumatismo de partes moles” (músculos, ligamentos, bursas e tendões).\nApesar das articulações serem o local mais acometido, praticamente todos os órgãos do corpo humano podem apresentar manifestações de doenças reumáticas, como pulmões, rins, cérebro, pele e coração.\nNa consulta com o reumatologista a abordagem é avaliar o paciente como um tempo todo e não apenas levar em consideração um problema em específico, para realizarmos o diagnóstico de forma correta é importante compreender as particularidades de cada indivíduo, para identificar as melhores estratégias de tratamento e alcançar o sucesso desejado."
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
    id: "obesidade-emagrecimento",
    name: "Tratamento da Obesidade e Emagrecimento",
    icon: UsersRound,
    description: "Tratamento multidisciplinar da obesidade e emagrecimento saudável com acompanhamento médico.",
    detailedDescription: "O tratamento da obesidade e emagrecimento envolve abordagem médica especializada, com avaliação metabólica, hormonal e nutricional. O médico especialista elabora um plano individualizado que pode incluir mudanças de estilo de vida, medicamentos e, quando indicado, acompanhamento para cirurgia bariátrica.",
    symptoms: ["Sobrepeso ou obesidade", "Dificuldade para emagrecer", "Compulsão alimentar", "Síndrome metabólica", "Hipertensão e diabetes associados ao peso"],
    indications: "Indicado para pessoas com IMC elevado, dificuldade de perder peso com dieta e exercícios, ou com doenças associadas ao excesso de peso. O acompanhamento médico é fundamental para um emagrecimento seguro e duradouro."
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
    id: "urologia",
    name: "Urologia",
    icon: MarsIcon,
    description: "Saúde do sistema urinário e saúde sexual e prostática do homem.",
    detailedDescription: "A Urologia é a especialidade clínico-cirúrgica que trata do sistema urinário de homens e mulheres e do sistema reprodutor masculino. Cuida de infecções urinárias, cálculos renais, incontinência urinária, próstata e saúde sexual masculina.",
    symptoms: ["Pedras nos rins (cólica renal)", "Dificuldade ou dor ao urinar", "Infecções urinárias de repetição", "Alterações na próstata", "Incontinência urinária"],
    indications: "Homens a partir dos 45 anos devem realizar check-up de próstata anualmente. Procure sempre ao sentir dor ao urinar, sangue na urina ou sintomas de pedra nos rins."
  }
];
