import { motion } from "framer-motion";
import { Shield, Heart, MapPin, Check } from "lucide-react";

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
            <span className="font-cinzel text-sm text-[#2566af] tracking-widest uppercase font-semibold">
              Sobre a RoyalMed Health
            </span>
            <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-[#2566af] mt-3 mb-8">
              Quem <span className="text-[#2566af]">Somos</span>
            </h2>
            <p className="text-[#e9e6c9] font-body text-lg leading-relaxed mb-6">
              A RoyalMed Health é um clube de benefícios em saúde que oferece acesso direto a médicos clínicos gerais
              e acesso com encaminhamento a nutricionistas, psicólogos, educadores físicos, exames laboratoriais, 
              exames de imagem e exame de refração oftalmológica. <br /> Permitindo atendimentos de acordo com a sua necessidade.
            </p>
            <p className="text-[#e9e6c9] font-body leading-relaxed mb-6">
              Nosso compromisso é oferecer saúde acessível e de qualidade, através de atendimento humanizado presencial e online.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Agendamento rápido",
                "Atendimento de qualidade",
                "Consultas acessíveis",
              ].map((text) => (
                <div key={text} className="flex items-center gap-4 text-[#e9e6c9] group transition-all duration-300">
                  <div className="w-8 h-8 rounded-full border border-gold/20 flex items-center justify-center transition-all duration-300 group-hover:!bg-royal group-hover:border-royal group-hover:scale-110 shadow-sm group-hover:shadow-gold/20">
                    <Check className="w-5 h-5 text-[#2566af] transition-colors duration-300 group-hover:!text-white" />
                  </div>
                  <span className="font-body font-medium transition-colors duration-300 group-hover:text-[#2566af] cursor-default">
                    {text}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[#e9e6c9] font-body text-sm">
              CNPJ: 65.818.151/0001-05
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
                desc: "Profissionais dedicados ao seu bem-estar, com cuidado e atenção individualizada.",
              },
              {
                icon: Shield,
                title: "Confiança e Segurança",
                desc: "Profissionais devidamente registrados em seus respectivos Conselhos Regionais (CRM, CRP, CRN, CREF) com atendimento seguro para sua saúde.",
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
                className="flex gap-5 p-6 rounded-lg bg-royal-light/30 border border-gold/10 hover:border-gold/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 shrink-0 bg-[#2566af] rounded-full flex items-center justify-center transition-all duration-300 group-hover:!bg-none group-hover:!bg-royal">
                  <item.icon className="w-5 h-5 text-white transition-colors duration-300 group-hover:!text-white" />
                </div>
                <div>
                  <h3 className="font-cinzel text-[#2566af] font-semibold mb-1 transition-colors duration-300 group-hover:text-[#2566af]">{item.title}</h3>
                  <p className="text-[#e9e6c9] font-body text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}on.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default QuemSomos;
