import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ComoFunciona from "@/components/ComoFunciona";
import QuemSomos from "@/components/QuemSomos";
import ContatoSection from "@/components/ContatoSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      
      {/* Planos Section via Iframe */}
      <section id="planos" className="w-full bg-slate-50">
        <iframe 
          src="https://royalsaude.vercel.app/planos" 
          className="w-full min-h-[900px] border-none"
          title="Planos RoyalMed Health"
        />
      </section>

      <ComoFunciona />
      <QuemSomos />
      <ContatoSection />
      <Footer />
    </div>
  );
};

export default Index;
