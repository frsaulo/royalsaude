import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import logo from "@/assets/RoyalSaude.png";

const navLinks = [
  { label: "Início", href: "#" },
  { label: "Como Funciona", href: "#como-funciona" },
  { label: "Quem Somos", href: "#quem-somos" },
  { label: "Contato", href: "#contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md border-b border-gold-light/30" style={{ backgroundColor: '#e9e6c9' }}>
      <div className="container mx-auto px-6 flex items-center justify-between h-16">
        <a href="#" className="flex items-center gap-2">
          <img src={logo} alt="Royal Saúde" className="h-12" />
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="font-cinzel text-sm text-primary hover:text-primary/70 transition-colors tracking-wide"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/5567992916792"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-gold-light font-cinzel text-sm font-semibold px-5 py-2 rounded-sm shadow-royal hover:brightness-110 transition-all"
          >
            Contato
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-primary">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gold-light/30" style={{ backgroundColor: '#e9e6c9' }}
          >
            <div className="container mx-auto px-6 py-4 flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="font-cinzel text-sm text-primary hover:text-primary/70 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
