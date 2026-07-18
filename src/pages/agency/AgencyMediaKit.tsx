import React from 'react';
import { Newspaper } from 'lucide-react';

export default function AgencyMediaKit() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-emerald-600" />
          Mídia Kit Web
        </h2>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Sua vitrine para anunciantes (em desenvolvimento).</p>
      </div>
      
      <div className="bg-white border border-[#e8edf2] rounded-[24px] p-12 text-center shadow-sm">
         <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-emerald-600" />
         </div>
         <h3 className="text-lg font-extrabold text-zinc-800 mb-2">Módulo em desenvolvimento</h3>
         <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Esta seção estará disponível em breve. Você poderá criar uma vitrine pública com seus pontos publicitários, valores e descrições para enviar aos seus clientes.
         </p>
      </div>
    </div>
  );
}
