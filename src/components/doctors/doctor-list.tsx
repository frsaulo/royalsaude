"use client";

import { DoctorCard, Doctor } from "./doctor-card";
import { DoctorFilters } from "./doctor-filters";

// Mock data para demonstração
const MOCK_DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Carlos Eduardo Mendes",
    specialties: ["Cardiologia", "Clínica Médica"],
    rating: 4.9,
    reviews: 128,
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=200&auto=format&fit=crop",
    nextAvailable: "Hoje, 14:30",
    location: "São Paulo, SP - Av. Paulista",
    price: 350.00,
  },
  {
    id: "d2",
    name: "Dra. Juliana Costa Ferreira",
    specialties: ["Dermatologia"],
    rating: 4.8,
    reviews: 94,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?q=80&w=200&auto=format&fit=crop",
    nextAvailable: "Amanhã, 09:00",
    location: "Telemedicina",
    price: 280.00,
  },
  {
    id: "d3",
    name: "Dr. Roberto Alves",
    specialties: ["Ortopedia", "Medicina Esportiva"],
    rating: 4.7,
    reviews: 215,
    imageUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=200&auto=format&fit=crop",
    nextAvailable: "15/05, 10:15",
    location: "Rio de Janeiro, RJ - Barra",
    price: 400.00,
  },
  {
    id: "d4",
    name: "Dra. Mariana Silva",
    specialties: ["Pediatria"],
    rating: 5.0,
    reviews: 312,
    imageUrl: "https://images.unsplash.com/photo-1594824419999-5f2524dc804d?q=80&w=200&auto=format&fit=crop",
    nextAvailable: "Hoje, 16:00",
    location: "São Paulo, SP - Moema",
    price: 300.00,
  },
  {
    id: "d5",
    name: "Dr. Fernando Gomes",
    specialties: ["Psiquiatria"],
    rating: 4.9,
    reviews: 176,
    imageUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?q=80&w=200&auto=format&fit=crop",
    nextAvailable: "17/05, 11:30",
    location: "Telemedicina",
    price: 450.00,
  }
];

export function DoctorList() {
  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto w-full">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Encontre seu Médico
        </h1>
        <p className="text-muted-foreground text-lg">
          Profissionais de excelência prontos para cuidar de você. Agende consultas presenciais ou por telemedicina.
        </p>
      </div>

      <DoctorFilters />

      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center text-sm text-muted-foreground px-1">
          <span>Exibindo <strong>5</strong> médicos encontrados</span>
        </div>
        
        <div className="flex flex-col gap-4">
          {MOCK_DOCTORS.map((doctor) => (
            <DoctorCard key={doctor.id} doctor={doctor} />
          ))}
        </div>
        
        <div className="flex justify-center mt-8">
          <button className="text-primary font-medium hover:underline p-2">
            Carregar mais resultados
          </button>
        </div>
      </div>
    </div>
  );
}
