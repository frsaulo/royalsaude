import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Star, MapPin, Calendar, Clock } from "lucide-react";

export type Doctor = {
  id: string;
  name: string;
  specialties: string[];
  rating: number;
  reviews: number;
  imageUrl: string;
  nextAvailable: string;
  location: string;
  price: number;
};

interface DoctorCardProps {
  doctor: Doctor;
}

export function DoctorCard({ doctor }: DoctorCardProps) {
  return (
    <Card className="flex flex-col md:flex-row overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
      <div className="flex flex-col sm:flex-row flex-1 p-6 gap-6">
        <div className="flex flex-col items-center sm:items-start gap-4">
          <Avatar className="h-24 w-24 border-2 border-primary/10">
            <AvatarImage src={doctor.imageUrl} alt={doctor.name} className="object-cover" />
            <AvatarFallback className="text-xl bg-primary/5 text-primary">
              {doctor.name.split(" ").map((n) => n[0]).join("").substring(0, 2)}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
              <div>
                <h3 className="text-xl font-bold tracking-tight text-foreground">{doctor.name}</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {doctor.specialties.map((specialty) => (
                    <Badge key={specialty} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-1 bg-[#FFF9C4]/50 text-yellow-700 px-2 py-1 rounded-md text-sm font-medium shrink-0 self-start sm:self-auto">
                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                <span>{doctor.rating}</span>
                <span className="text-muted-foreground ml-1">({doctor.reviews} avaliações)</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{doctor.location}</span>
              </div>
              <div className="flex items-center gap-2 font-medium text-primary">
                <Calendar className="h-4 w-4 shrink-0" />
                <span>Próx. disp: {doctor.nextAvailable}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">Valor da Consulta</span>
              <span className="text-lg font-bold">R$ {doctor.price.toFixed(2).replace('.', ',')}</span>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild className="hidden sm:flex">
                <Link href={`/doctors/${doctor.id}`}>Ver Perfil</Link>
              </Button>
              <Button asChild>
                <Link href={`/agendamento?doctor_id=${doctor.id}`}>Agendar</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
