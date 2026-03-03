import { motion } from "framer-motion";
import { Shield, Heart, MapPin } from "lucide-react";

const QuemSomos = () => {
  return (
    <section id="quem-somos" className="py-24 bg-primary relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="font-cinzel text-sm text-gold tracking-widest uppercase font-semibold">
              Sobre Nós
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-gold-light mt-3 mb-8">
              Quem <span className="text-gradient-gold">Somos</span>
            </h2>
            <p className="text-[#e9e6c9] font-body text-lg leading-relaxed mb-6">
              A Royal Saúde é um Clube de Benefícios que proporciona o acesso direto a médicos prontos para
              atender de imediato, com agenda aberta direto no próprio site, sem filas, sem
              esperar vários dias para ser atendido.
            </p>
            <p className="text-[#e9e6c9] font-body leading-relaxed mb-8">
              Nosso compromisso é oferecer saúde acessível de qualidade para todos mesmo que 
              seja por telemedicina, com atendimento humanizado e taxas simbólicas.
            </p>
            <p className="text-[#e9e6c9] font-body text-sm">
              CNPJ: 61.889.391/0001-31
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                icon: Heart,
                title: "Atendimento Humanizado",
                desc: "Médicos dedicados ao seu bem-estar com atenção personalizada.",
              },
              {
                icon: Shield,
                title: "Confiança e Segurança",
                desc: "Profissionais qualificados e ambiente seguro para sua consulta.",
              },
              {
                icon: MapPin,
                title: "Campo Grande – MS",
                desc: "Atendemos Campo Grande e região com cobertura completa.",
              },
            ].map((item, i) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="flex gap-5 p-6 rounded-lg bg-royal-light/30 border border-gold/10 hover:border-gold/30 transition-colors"
              >
                <div className="w-12 h-12 shrink-0 bg-gradient-gold rounded-full flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-cinzel text-gold-light font-semibold mb-1">{item.title}</h3>
                  <p className="text-[#e9e6c9] font-body text-sm">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuemSomos;
