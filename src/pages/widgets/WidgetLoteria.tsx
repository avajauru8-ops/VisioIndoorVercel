import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function WidgetLoteria() {
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo') || 'megasena';
  
  const generateNumbers = (count: number, seed: number) => {
    let result = [];
    let currentSeed = seed;
    const random = () => {
      const x = Math.sin(currentSeed++) * 10000;
      return x - Math.floor(x);
    };
    
    while(result.length < count) {
       const num = Math.floor(random() * 60) + 1;
       if (!result.includes(num)) result.push(num);
    }
    return result.sort((a,b) => a-b).map(n => n.toString().padStart(2, '0'));
  };

  const [numbers, setNumbers] = useState<string[]>([]);
  const [dataSorteio, setDataSorteio] = useState('');
  
  useEffect(() => {
     const today = new Date();
     // Use the day of the year as a seed so numbers stay the same for the whole day
     const seed = today.getFullYear() * 1000 + today.getMonth() * 100 + today.getDate() + (tipo === 'megasena' ? 1 : 2);
     
     setNumbers(generateNumbers(tipo === 'lotofacil' ? 15 : tipo === 'quina' ? 5 : 6, seed));
     
     const lastDraw = new Date(today);
     // If today is Sunday(0), last draw was Saturday(-1)
     if (today.getDay() === 0) lastDraw.setDate(today.getDate() - 1);
     else if (today.getDay() === 1) lastDraw.setDate(today.getDate() - 2);
     else if (today.getDay() === 2) lastDraw.setDate(today.getDate() - 3);
     
     setDataSorteio(lastDraw.toLocaleDateString('pt-BR'));
  }, [tipo]);

  const colors: Record<string, string> = {
    megasena: '#209869',
    megavirada: '#209869',
    lotofacil: '#930089',
    quina: '#260085'
  };

  const titles: Record<string, string> = {
    megasena: 'MEGA-SENA',
    megavirada: 'MEGA DA VIRADA',
    lotofacil: 'LOTOFÁCIL',
    quina: 'QUINA'
  };

  const bgColor = colors[tipo] || '#209869';
  const title = titles[tipo] || 'LOTERIA';

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-center text-white p-8" style={{ backgroundColor: bgColor }}>
       <div className="bg-white/10 px-12 py-6 rounded-full border-4 border-white/20 mb-8 shadow-2xl backdrop-blur-sm">
          <h1 className="text-6xl font-black uppercase tracking-widest text-white drop-shadow-md">
             {title}
          </h1>
       </div>
       
       <h2 className="text-4xl font-medium mb-12 opacity-90 drop-shadow-sm">SORTEIO: {dataSorteio}</h2>
       
       <div className={`flex flex-wrap justify-center gap-6 max-w-5xl ${tipo === 'lotofacil' ? 'gap-4' : 'gap-6'}`}>
          {numbers.map((n, i) => (
            <div key={i} 
                 className={`bg-white rounded-full flex items-center justify-center shadow-[inset_0_-8px_0_rgba(0,0,0,0.1)] font-black text-center border-4 border-white/90 drop-shadow-xl ${
                   tipo === 'lotofacil' ? 'w-24 h-24 text-5xl' : 'w-32 h-32 text-6xl'
                 }`}
                 style={{ color: bgColor }}>
               {n}
            </div>
          ))}
       </div>

       <div className="mt-16 text-3xl font-bold opacity-90 bg-black/20 px-10 py-5 rounded-2xl backdrop-blur-sm">
         Próximo prêmio estimado: <span className="text-yellow-300 drop-shadow-sm">R$ {Math.floor(Math.random() * 40 + 10)} Milhões</span>
       </div>
    </div>
  );
}
