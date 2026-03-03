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
      <ComoFunciona />
      <QuemSomos />
      <ContatoSection />
      <Footer />
    </div>
  );
};

export default Index;
