import React from 'react';
import { Newspaper } from 'lucide-react';

export default function AgencyMediaKit() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Newspaper className="w-6 h-6 text-pink-500" />
          Mídia Kit Web
        </h2>
        <p className="text-sm text-gray-400 mt-1">Sua vitrine para anunciantes (em desenvolvimento).</p>
      </div>
      
      <div className="bg-gray-950 border border-gray-800 rounded-xl p-12 text-center">
         <div className="w-16 h-16 bg-gray-900 border border-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Newspaper className="w-8 h-8 text-gray-600" />
         </div>
         <h3 className="text-xl font-medium text-gray-200 mb-2">Módulo em desenvolvimento</h3>
         <p className="text-gray-500 max-w-md mx-auto">
            Esta seção estará disponível em breve. Você poderá criar uma vitrine pública com seus pontos publicitários, valores e descrições para enviar aos seus clientes.
         </p>
      </div>
    </div>
  );
}
