import React, { useState, useEffect } from 'react';
import { Smartphone, Code, Copy, CheckCircle } from 'lucide-react';

export default function AdminIntegration() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    // Get the current origin (protocol + hostname + port if present)
    const origin = window.location.origin;
    setBaseUrl(`${origin}/api.php?device_id=`);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Integração com Aplicativo</h1>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Dados e endpoints para configurar o aplicativo Android TotemPlayer.</p>
      </header>

      <div className="bg-white border border-[#e8edf2] rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e8edf2] flex items-center gap-4 bg-zinc-50/50">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0b462c]">Configuração do App Android</h2>
            <p className="text-xs text-zinc-400">Insira esta URL no código-fonte do seu aplicativo Java/Android.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Endpoint Base (BASE_URL)</label>
            <div className="flex bg-[#f4f6f8] border border-zinc-200 rounded-xl p-1.5 items-center">
              <div className="flex-1 px-3 py-1.5 text-xs text-zinc-700 font-mono truncate overflow-x-auto flex items-center">
                {baseUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-xl transition-all text-xs font-bold shadow-sm"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              O aplicativo irá adicionar o Android ID automaticamente no final da URL.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Como atualizar no código-fonte:</h3>
            <div className="bg-[#f4f6f8] border border-zinc-200 rounded-xl p-4 font-mono text-xs overflow-x-auto relative group">
              <div className="text-zinc-700">
                <span className="text-emerald-700 font-bold">private</span> <span className="text-emerald-700 font-bold">static</span> <span className="text-emerald-700 font-bold">final</span> <span className="text-emerald-500 font-bold">String</span> BASE_URL = <span className="text-amber-600">"{baseUrl}"</span>;
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Procure pela variável <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono font-bold">BASE_URL</code> no arquivo <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-700 font-bold">MainActivity.java</code> e substitua pelo valor acima.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-[#e8edf2] rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e8edf2] flex items-center gap-4 bg-zinc-50/50">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0b462c]">Formato da Resposta JSON</h2>
            <p className="text-xs text-zinc-400">O que o aplicativo recebe deste servidor.</p>
          </div>
        </div>
        
        <div className="p-6 bg-[#f4f6f8]">
          <pre className="text-xs text-zinc-700 font-mono overflow-x-auto leading-relaxed">
{`{
  "totem_id": 1,
  "device_id": "ABC123XYZ",
  "nome": "Totem Shopping",
  "playlist": [
    {
      "id": 10,
      "titulo": "Campanha Burger King",
      "tipo_midia": "video",
      "tempo_exibicao": 15,
      "arquivo_url": "https://..."
    }
  ]
}`}
          </pre>
        </div>
      </div>
    </div>
  );
}
