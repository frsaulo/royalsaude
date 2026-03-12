"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, SlidersHorizontal, MapPin } from "lucide-react";

const specialties = [
  "Todas as Especialidades",
  "Cardiologia",
  "Dermatologia",
  "Endocrinologia",
  "Ginecologia",
  "Neurologia",
  "Oftalmologia",
  "Ortopedia",
  "Pediatria",
  "Psiquiatria",
];

const locations = [
  "Todos os Locais",
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Belo Horizonte, MG",
  "Curitiba, PR",
  "Brasília, DF",
  "Telemedicina",
];

export function DoctorFilters() {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  return (
    <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col gap-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por nome do médico ou doença..." 
            className="pl-9 bg-background"
          />
        </div>
        
        <div className="flex gap-2">
          <Select defaultValue="Todas as Especialidades">
            <SelectTrigger className="w-[200px] bg-background">
              <SelectValue placeholder="Especialidade" />
            </SelectTrigger>
            <SelectContent>
              {specialties.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            className="shrink-0"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Filtros</span>
          </Button>
        </div>
      </div>
      
      {isAdvancedOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Localização</label>
            <Select defaultValue="Todos os Locais">
              <SelectTrigger className="bg-background">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Selecione o local" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {locations.map((l) => (
                  <SelectItem key={l} value={l}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Disponibilidade</label>
            <Select defaultValue="any">
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Qualquer data" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Qualquer data</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="tomorrow">Amanhã</SelectItem>
                <SelectItem value="this-week">Esta semana</SelectItem>
                <SelectItem value="next-week">Próxima semana</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Ordem</label>
            <Select defaultValue="recommended">
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Recomendados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recommended">Recomendados</SelectItem>
                <SelectItem value="price-asc">Menor Preço</SelectItem>
                <SelectItem value="price-desc">Maior Preço</SelectItem>
                <SelectItem value="rating">Melhor Avaliação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
