import React from "react";
import { Download, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
// @ts-ignore
import pdfPolicy from "@/assets/Politica de Cancelamento - Royal Med Health.pdf";

export const PoliticaCancelamento = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-500">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-4">
            <a href={pdfPolicy} download="Politica_Cancelamento_RoyalMed.pdf" target="_blank" rel="noopener noreferrer">
              <Button className="bg-[#1E3A8A] hover:bg-blue-800 text-white">
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </a>
          </div>
        </div>

        <div className="prose prose-slate max-w-none">
          <h1 className="text-3xl font-bold text-[#1E3A8A] mb-8 text-center">Política de Cancelamento</h1>
          
          <p className="text-slate-600 mb-6">
            Este documento contém a Política de Cancelamento da Royal Med Health.
            Recomendamos o download do documento em PDF no botão acima para ter acesso à versão oficial e formatada completa.
          </p>

          <object data={pdfPolicy} type="application/pdf" width="100%" height="800px" className="border rounded-md">
            <p>Seu navegador não suporta visualização de PDF. <a href={pdfPolicy} className="text-blue-600 underline">Clique aqui para baixar o arquivo</a>.</p>
          </object>

        </div>
      </div>
    </div>
  );
};

export default PoliticaCancelamento;
