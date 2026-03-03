import { motion } from "framer-motion";
import { CalendarCheck, Clock, UserCheck, CreditCard } from "lucide-react";

const steps = [
  {
    icon: CreditCard,
    title: "Assine o Clube de Benefícios",
    description: "Apenas R$100/mês para ter acesso completo a consultas médicas generalistas.",
  },
  {
    icon: CalendarCheck,
    title: "Agende Online",
    description: "Agenda aberta direto no site. Escolha o melhor horário para você.",
  },
  {
    icon: Clock,
    title: "Sem Filas",
    description: "Atendimento imediato, sem esperar vários dias para ser atendido.",
  },
  {
    icon: UserCheck,
    title: "Consulte-se",
    description: "Médicos prontos para atender de imediato com qualidade e atenção.",
  },
];

const ComoFunciona = () => {
  return (
    <section id="como-funciona" className="py-24 bg-muted">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="font-cinzel text-sm text-secondary tracking-widest uppercase font-semibold">
            Simples e Rápido
          </span>
          <h2 className="text-4xl md:text-5xl font-cinzel font-bold text-primary mt-3">
            Como <span className="text-gradient-gold">Funciona</span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-lg p-8 shadow-royal text-center group hover:scale-105 transition-transform duration-300"
            >
              <div className="w-16 h-16 mx-auto mb-6 bg-gradient-gold rounded-full flex items-center justify-center shadow-gold group-hover:scale-110 transition-transform">
                <step.icon className="w-7 h-7 text-accent-foreground" />
              </div>
              <h3 className="font-cinzel text-lg font-bold text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-muted-foreground font-body leading-relaxed text-sm">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ComoFunciona;
