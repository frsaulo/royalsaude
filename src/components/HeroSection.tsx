import { motion } from "framer-motion";
import familiaImg from "@/assets/familia.jpg";
import familia2Img from "@/assets/familia2.jpg";
import familia3Img from "@/assets/familia3.jpg";
import { useState, useEffect } from "react";

const slides = [
  { img: "/tata.jpg", type: "telemedicina" },
  { img: familiaImg, type: "original" },
  { img: familia2Img, type: "original" },
  { img: familia3Img, type: "original" },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background images carousel */}
      {slides.map((slide, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: current === i ? 1 : 0 }}
        >
          <img
            src={slide.img}
            alt="RoyalMed Health"
            className="w-full h-full object-cover object-top"
          />
          {/* Apply overlay only to the original images */}
          {slide.type === "original" && (
            <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/70 to-primary/40" />
          )}
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 w-full container mx-auto px-6 py-24 min-h-[500px] grid">
        
        {/* Original Content */}
        <div
          className={`row-start-1 col-start-1 flex flex-col justify-center transition-all duration-700 max-w-2xl ${
            slides[current].type === "original"
              ? "opacity-100 translate-x-0 z-20 pointer-events-auto"
              : "opacity-0 -translate-x-10 z-0 pointer-events-none"
          }`}
        >
          <div className="inline-block mb-6">
            <span className="bg-[#dde400] px-4 py-2 rounded-sm text-[#092952] font-cinzel text-sm font-semibold tracking-widest uppercase">
              Clube de Benefícios em Saúde
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-royalmed font-bold leading-tight mb-2 text-[#dde400]">
            RoyalMed Health
          </h1>

          <h2 className="text-2xl md:text-3xl font-cinzel mb-6 tracking-wide text-[#dde400]">
            Cuidar de você não pode esperar!
          </h2>

          <p className="text-xl md:text-2xl text-[#e9e6c9] font-body font-light mb-4">
            Consulta Médica <b>AGORA</b> mesmo!
          </p>
          <p className="text-lg text-[#e9e6c9] font-body mb-8 max-w-lg whitespace-pre-line leading-relaxed">
            Acesso direto a médicos clínicos gerais {"\n"} Por apenas{" "}
            <span className="text-[#dde400] font-bold text-2xl">R$99,90</span>{" "}
            <span className="text-[#e9e6c9]">/mês*</span>
            <span className="block text-sm mt-2 opacity-90">
              *Ao assinar a mensalidade, você tem direito a consultas ILIMITADAS
              {"\n"} com uma pequena coparticipação de R$69,90 por consulta.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href="/login"
              className="bg-[#dde400] text-[#092952] font-cinzel font-semibold px-8 py-4 rounded-sm text-center shadow-gold transition-all hover:brightness-110 tracking-wide cursor-pointer w-fit"
            >
              Agende sua Consulta
            </a>
            <a
              href="#como-funciona"
              className="bg-[#0e234e] text-white font-cinzel font-semibold px-8 py-4 rounded-sm text-center transition-all tracking-wide w-fit border border-[#0e234e] hover:border-white/50"
            >
              Saiba Mais
            </a>
          </div>
        </div>

        {/* Telemedicina Content */}
        <div
          className={`row-start-1 col-start-1 flex flex-col justify-center transition-all duration-700 max-w-2xl ${
            slides[current].type === "telemedicina"
              ? "opacity-100 translate-x-0 z-20 pointer-events-auto"
              : "opacity-0 translate-x-10 z-0 pointer-events-none"
          }`}
        >
          <div className="bg-[#092952]/80 backdrop-blur-md p-8 md:p-12 rounded-xl border border-[#dde400]/20 shadow-2xl">
            <h1 className="text-4xl md:text-6xl font-royalmed font-bold leading-tight mb-8 text-white">
              Telemedicina <span className="text-[#dde400]">24h</span>
            </h1>

            <ul className="text-xl md:text-2xl text-white font-body font-light space-y-5 mb-10">
              <li className="flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dde400]"></span>
                25 especialidades disponíveis
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dde400]"></span>
                Atendimento 24h por dia
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dde400]"></span>
                7 dias por semana
              </li>
              <li className="flex items-center gap-4">
                <span className="w-2.5 h-2.5 rounded-full bg-[#dde400]"></span>
                Cobertura em todo o Brasil
              </li>
            </ul>

            <div className="border-t border-white/20 pt-6">
              <p className="text-2xl md:text-3xl text-[#dde400] font-body italic font-semibold">
                Simples, rápido e sem burocracia.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 flex gap-3">
        {slides.map((_, i) => (
          <button
            key={`indicator-${i}`}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition-all ${
              current === i ? "bg-[#dde400] w-8" : "bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-[#dde400]" />
    </section>
  );
};

export default HeroSection;
