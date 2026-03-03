import { motion } from "framer-motion";
import { Phone, MapPin } from "lucide-react";

const WhatsappIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
)

const ContatoSection = () => {
  return (
    <section id="contato" className="py-24 bg-muted">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-cinzel text-sm text-secondary tracking-widest uppercase font-semibold">
            Fale Conosco
          </span>
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-primary mt-3">
            Entre em <span className="text-gradient-gold">Contato</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {[
            {
              icon: Phone,
              title: "Telefone",
              info: "(67) 9291-6792",
              href: "https://wa.me/5567992916792",
            },
            {
              icon: MapPin,
              title: "Endereço",
              info: "R. Dr. Eduardo Machado Metelo, 46 - Chácara Cachoeira, Campo Grande - MS, CEP: 79040-830",
              href: "https://maps.google.com/?q=R+Dr+Eduardo+Machado+Metelo+46+Chacara+Cachoeira+Campo+Grande+MS",
            },
            {
              icon: WhatsappIcon,
              title: "WhatsApp",
              info: "Envie uma mensagem",
              href: "https://wa.me/5567992916792",
            },
          ].map((item, i) => (
            <motion.a
              key={item.title}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-lg p-8 shadow-royal text-center group hover:scale-105 transition-transform duration-300 cursor-pointer"
            >
              <div className="w-14 h-14 mx-auto mb-5 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                <item.icon className="w-6 h-6 text-accent-foreground" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-primary mb-2">{item.title}</h3>
              <p className="text-muted-foreground font-body text-sm leading-relaxed">{item.info}</p>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ContatoSection;
