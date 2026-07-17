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
        <h1 className="text-3xl font-bold text-white tracking-tight">Integração com Aplicativo</h1>
        <p className="text-zinc-400 mt-2">Dados e endpoints para configurar o aplicativo Android TotemPlayer.</p>
      </header>

      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Configuração do App Android</h2>
            <p className="text-sm text-zinc-400">Insira esta URL no código-fonte do seu aplicativo Java/Android.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-white">Endpoint Base (BASE_URL)</label>
            <div className="flex bg-black/50 border border-zinc-800 rounded-lg p-1">
              <div className="flex-1 px-4 py-2 text-sm text-zinc-300 font-mono truncate overflow-x-auto flex items-center">
                {baseUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md transition-colors text-sm font-medium"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
            <p className="text-xs text-zinc-500">
              O aplicativo irá adicionar o Android ID automaticamente no final da URL.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white">Como atualizar no código-fonte:</h3>
            <div className="bg-black border border-zinc-800 rounded-lg p-4 font-mono text-sm overflow-x-auto relative group">
              <div className="text-zinc-400">
                <span className="text-indigo-400">private</span> <span className="text-indigo-400">static</span> <span className="text-indigo-400">final</span> <span className="text-emerald-400">String</span> BASE_URL = <span className="text-amber-400">"{baseUrl}"</span>;
              </div>
            </div>
            <p className="text-sm text-zinc-400">
              Procure pela variável <code className="bg-zinc-800 px-1 py-0.5 rounded text-indigo-300">BASE_URL</code> no arquivo <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-200">MainActivity.java</code> e substitua pelo valor acima.
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-zinc-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Formato da Resposta JSON</h2>
            <p className="text-sm text-zinc-400">O que o aplicativo recebe deste servidor.</p>
          </div>
        </div>
        
        <div className="p-6 bg-black">
          <pre className="text-sm text-zinc-300 font-mono overflow-x-auto">
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
