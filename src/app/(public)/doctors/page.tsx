import { Metadata } from "next";
import { DoctorList } from "@/components/doctors/doctor-list";
import { MainNav } from "@/components/layout/main-nav";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Médicos | Royal Saúde",
  description: "Encontre os melhores médicos e especialistas na Royal Saúde.",
};

export default function DoctorsPage() {
  return (
    <div className="min-h-screen flex flex-col pt-20">
      <MainNav />
      <main className="flex-1 bg-slate-50 shadow-inner">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <DoctorList />
        </div>
      </main>
      <Footer />
    </div>
  );
}
