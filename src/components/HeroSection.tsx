import { motion } from "framer-motion";
import familiaImg from "@/assets/familia.jpg";
import familia2Img from "@/assets/familia2.jpg";
import familia3Img from "@/assets/familia3.jpg";
import { useState, useEffect } from "react";

const images = [familiaImg, familia2Img, familia3Img];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background images carousel */}
      {images.map((img, i) => (
        <div
          key={i}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: current === i ? 1 : 0 }}
        >
          <img
            src={img}
            alt="Família feliz Royal Saúde"
            className="w-full h-full object-cover"
          />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/65 via-primary/55 to-primary/30" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="inline-block mb-6"
          >
            <span className="bg-gradient-gold px-4 py-2 rounded-sm text-accent-foreground font-cinzel text-sm font-semibold tracking-widest uppercase">
              Clube de Benefícios
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-cinzel font-bold text-primary-foreground leading-tight mb-6">
            Royal <span className="text-gradient-gold">Saúde</span>
          </h1>

          <p className="text-xl md:text-2xl text-[#e9e6c9] font-body font-light mb-4">
            Consulta médica sem filas.
          </p>
          <p className="text-lg text-[#e9e6c9] font-body mb-8 max-w-lg">
            Atendimento imediato com agenda aberta. Acesso direto a médicos
            generalistas por apenas{" "}
            <span className="text-accent font-bold text-2xl">R$100</span>{" "}
            <span className="text-[#e9e6c9]">/mês*</span>
            <span className="block text-sm mt-2">
             *Além da mensalidade de R$100,00, há uma taxa de R$70,00 por consulta.
            </span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <motion.a
              href="https://wa.me/5567992916792"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-gold text-accent-foreground font-cinzel font-semibold px-8 py-4 rounded-sm text-center shadow-gold transition-all hover:brightness-110 tracking-wide"
            >
              Agende sua Consulta
            </motion.a>
            <motion.a
              href="#como-funciona"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-[#0e234e] text-white font-cinzel font-semibold px-8 py-4 rounded-sm text-center transition-all tracking-wide"
            >
              Saiba Mais
            </motion.a>
          </div>
        </motion.div>
      </div>

      {/* Carousel indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${current === i ? "bg-gold-light w-8" : "bg-gold/40"}`}
          />
        ))}
      </div>

      {/* Bottom decorative line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-gold" />
    </section>
  );
};

export default HeroSection;
