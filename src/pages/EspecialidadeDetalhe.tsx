import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { 
  ChevronLeft,
  MapPin,
  CalendarCheck,
  MessageCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import { especialidadesList } from "../data/especialidades";

export const EspecialidadeDetalhe = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Encontra a especialidade correspondente
  const especialidade = especialidadesList.find(
    (e) => e.id === id?.toLowerCase().trim()
  );

  useEffect(() => {
    if (!especialidade) return;

    // --- OTIMIZAÇÃO DE SEO ---
    // 1. Atualizar Título da Página
    const originalTitle = document.title;
    document.title = `${especialidade.name} em Campo Grande - MS | RoyalMed Health`;

    // 2. Atualizar Meta Description
    const originalDescription = document.querySelector('meta[name="description"]')?.getAttribute("content") || "";
    let metaDescription = document.querySelector('meta[name="description"]');
    const seoDescription = `${especialidade.name} em Campo Grande - MS. ${especialidade.description} Cuidados de excelência, agendamento simples e sem carência na Rua Pedro Celestino, 2395.`;
    if (metaDescription) {
      metaDescription.setAttribute("content", seoDescription);
    } else {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      metaDescription.setAttribute("content", seoDescription);
      document.head.appendChild(metaDescription);
    }

    // 3. Atualizar Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    const originalKeywords = metaKeywords?.getAttribute("content") || "";
    const seoKeywords = `${especialidade.name.toLowerCase()} campo grande, consulta ${especialidade.name.toLowerCase()}, clinica ${especialidade.name.toLowerCase()} ms, royalmed health, saúde campo grande, agendar consulta`;
    if (metaKeywords) {
      metaKeywords.setAttribute("content", seoKeywords);
    }

    // 4. Atualizar Meta OG Tags (Facebook / WhatsApp / etc)
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", `${especialidade.name} em Campo Grande - MS | RoyalMed Health`);
    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute("content", especialidade.description);
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute("content", window.location.href);

    // 5. Atualizar Link Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    const originalCanonical = canonical?.getAttribute("href") || "";
    if (canonical) {
      canonical.setAttribute("href", window.location.href);
    } else {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      canonical.setAttribute("href", window.location.href);
      document.head.appendChild(canonical);
    }

    // 6. Injetar Dados Estruturados JSON-LD (Schema.org) para Busca do Google
    const schemaData = {
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "@id": `https://royalmedhealth.com.br/especialidades/${especialidade.id}`,
      "name": `RoyalMed Health - ${especialidade.name}`,
      "image": "https://royalmedhealth.com.br/tata.jpg",
      "description": `${especialidade.detailedDescription} Agende sua consulta de ${especialidade.name} em Campo Grande - MS.`,
      "url": window.location.href,
      "telephone": "+556740044935",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Rua Pedro Celestino, 2395",
        "addressLocality": "Campo Grande",
        "addressRegion": "MS",
        "postalCode": "79002-372",
        "addressCountry": "BR"
      },
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "00:00",
        "closes": "23:59"
      },
      "medicalSpecialty": especialidade.name
    };

    let schemaScript = document.getElementById("specialty-schema") as HTMLScriptElement | null;
    if (schemaScript) {
      schemaScript.textContent = JSON.stringify(schemaData);
    } else {
      schemaScript = document.createElement("script");
      schemaScript.id = "specialty-schema";
      schemaScript.setAttribute("type", "application/ld+json");
      schemaScript.textContent = JSON.stringify(schemaData);
      document.head.appendChild(schemaScript);
    }

    // Limpeza (Cleanup) ao desmontar a página
    return () => {
      document.title = originalTitle;
      if (metaDescription) metaDescription.setAttribute("content", originalDescription);
      if (metaKeywords) metaKeywords.setAttribute("content", originalKeywords);
      if (canonical) canonical.setAttribute("href", originalCanonical);
      const schemaToRemove = document.getElementById("specialty-schema");
      if (schemaToRemove) schemaToRemove.remove();
    };
  }, [especialidade]);

  // Se a especialidade não for encontrada
  if (!especialidade) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <Navbar />
        <main className="flex-grow flex items-center justify-center pt-24 pb-16 px-6">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl border border-slate-200 shadow-md">
            <h1 className="text-2xl font-cinzel font-bold text-primary mb-4">Especialidade Não Encontrada</h1>
            <p className="text-muted-foreground font-body mb-6">
              Desculpe, a especialidade médica que você procura não está cadastrada ou não pôde ser encontrada.
            </p>
            <button
              onClick={() => navigate("/especialidades")}
              className="inline-flex items-center gap-2 bg-[#092952] hover:bg-[#2566af] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Ver Todas Especialidades
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const IconComponent = especialidade.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow pt-24 pb-16">
        {/* Hero Header com Gradiente */}
        <div className="bg-gradient-to-r from-primary to-[#2566af] text-white py-12 md:py-16 mb-12 shadow-md relative overflow-hidden">
          {/* Decorações */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#dde400]/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl -translate-x-1/3 translate-y-1/3 pointer-events-none" />

          <div className="container mx-auto px-6 relative z-10">
            {/* Voltar */}
            <button
              onClick={() => navigate("/especialidades")}
              className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-6 group bg-white/10 hover:bg-white/20 px-3.5 py-1.5 rounded-lg text-sm font-medium backdrop-blur-sm self-start"
            >
              <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              <span className="font-body">Voltar para Especialidades</span>
            </button>

            {/* Info Especialidade */}
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-lg shrink-0">
                <IconComponent className="w-10 h-10 text-[#dde400]" />
              </div>
              <div>
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-[#dde400] font-bold font-body block mb-1">
                  Especialidade Médica
                </span>
                <h1 className="text-3xl md:text-5xl font-cinzel font-bold text-white mb-2">
                  {especialidade.name}
                </h1>
                <p className="text-slate-200 font-body text-sm md:text-base max-w-2xl leading-relaxed">
                  {especialidade.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Layout do Conteúdo Principal */}
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Coluna da Esquerda: Detalhes Médicos (2/3 da largura no desktop) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Sobre a Especialidade */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm"
              >
                <h2 className="text-xl font-cinzel font-bold text-primary mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#2566af] rounded-full inline-block"></span>
                  Sobre a Especialidade
                </h2>
                <p className="text-slate-700 font-body text-base leading-relaxed whitespace-pre-line">
                  {especialidade.detailedDescription}
                </p>
              </motion.div>

              {/* Sintomas Tratados */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm"
              >
                <h2 className="text-xl font-cinzel font-bold text-primary mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#2566af] rounded-full inline-block"></span>
                  Sintomas Comuns Tratados
                </h2>
                <p className="text-muted-foreground font-body text-sm mb-4">
                  Se você apresenta algum dos sintomas abaixo, a consulta com o especialista é recomendada:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {especialidade.symptoms.map((symptom) => (
                    <div 
                      key={symptom}
                      className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-3 hover:bg-slate-100/70 transition-colors"
                    >
                      <CheckCircle2 className="w-5 h-5 text-[#2566af] shrink-0 mt-0.5" />
                      <span className="text-slate-700 font-body text-sm font-medium">{symptom}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Serviços e Terapias */}
              {especialidade.services && especialidade.services.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm"
                >
                  <h2 className="text-xl font-cinzel font-bold text-primary mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-[#2566af] rounded-full inline-block"></span>
                    Serviços e Terapias Oferecidas
                  </h2>
                  <p className="text-muted-foreground font-body text-sm mb-4">
                    Nossa clínica oferece os seguintes atendimentos e terapias especializadas:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {especialidade.services.map((service) => (
                      <div 
                        key={service}
                        className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl flex items-start gap-3 hover:bg-slate-100/70 transition-colors"
                      >
                        <CheckCircle2 className="w-5 h-5 text-[#2566af] shrink-0 mt-0.5" />
                        <span className="text-slate-700 font-body text-sm font-medium">{service}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Quando Procurar */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-primary/5 border-l-4 border-[#2566af] p-6 rounded-r-2xl"
              >
                <h3 className="text-base font-cinzel font-bold text-primary mb-2 uppercase tracking-wide">
                  Quando Procurar?
                </h3>
                <p className="text-slate-700 font-body text-sm leading-relaxed">
                  {especialidade.indications}
                </p>
              </motion.div>

              {/* Por que escolher a RoyalMed? */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="bg-white rounded-2xl p-6 md:p-8 border border-slate-200 shadow-sm"
              >
                <h2 className="text-xl font-cinzel font-bold text-primary mb-6 pb-2 border-b border-slate-100 flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-[#2566af] rounded-full inline-block"></span>
                  Por que consultar na RoyalMed Health?
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-primary shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-primary mb-1">Agendamento Fácil</h4>
                      <p className="text-xs text-muted-foreground font-body">Marque sua consulta 100% online em poucos cliques, sem filas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-primary shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-primary mb-1">Clínica Central</h4>
                      <p className="text-xs text-muted-foreground font-body">Localização de fácil acesso na Rua Pedro Celestino, 2395.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-primary shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-primary mb-1">Sem Carência</h4>
                      <p className="text-xs text-muted-foreground font-body">Assine e use no mesmo dia, sem tempo de espera para consultas.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#dde400]/20 flex items-center justify-center text-primary shrink-0">
                      <PhoneCall className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-cinzel text-sm font-bold text-primary mb-1">Telemedicina 24h</h4>
                      <p className="text-xs text-muted-foreground font-body">Plantão clínico geral ilimitado direto de seu celular sempre incluso.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Coluna da Direita: Card de Agendamento (Sticky no Desktop) */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, type: "spring" }}
                  className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md flex flex-col"
                >
                  <div className="bg-[#dde400]/25 text-[#092952] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider self-start mb-4 font-body">
                    Atendimento Imediato
                  </div>

                  <h3 className="font-cinzel text-lg font-bold text-primary mb-1">
                    Agende sua Consulta
                  </h3>
                  <p className="text-muted-foreground font-body text-xs mb-6">
                    Selecione o melhor dia e horário para o seu atendimento presencial ou online.
                  </p>

                  <div className="space-y-4 mb-6 text-xs text-slate-600 font-body">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4.5 h-4.5 text-[#2566af] shrink-0" />
                      <span>Rua Pedro Celestino, 2395 - Centro</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="w-4.5 h-4.5 text-[#2566af] shrink-0" />
                      <span>Segunda a Sexta: 07h às 18h | Sáb: 07h às 12h</span>
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => navigate("/login")}
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#dde400] hover:bg-[#c2c800] text-[#092952] font-cinzel font-bold px-5 py-3.5 rounded-xl shadow-md transition-all hover:scale-102 hover:shadow-lg text-sm tracking-wide"
                    >
                      <CalendarCheck className="w-4.5 h-4.5" />
                      Agendar Online
                    </button>

                    <a
                      href="https://wa.me/5567991747844?text=Olá,%20vim%20do%20site%20e%20gostaria%20de%20agendar%20uma%20consulta%20de%20"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white font-cinzel font-bold px-5 py-3.5 rounded-xl shadow-md transition-all hover:scale-102 hover:shadow-lg text-sm tracking-wide"
                    >
                      <MessageCircle className="w-4.5 h-4.5" />
                      Chamar no WhatsApp
                    </a>
                  </div>

                  <span className="text-[10px] text-muted-foreground text-center font-body mt-4">
                    Assinantes possuem até 80% de desconto em exames e consultas presenciais na nossa clínica.
                  </span>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EspecialidadeDetalhe;
