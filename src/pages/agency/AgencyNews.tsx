import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { CloudRain, Hash, Plus, Trash2, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';

interface Totem {
  id: number;
  nome: string;
  device_id: string;
}

interface Playlist {
  id: number;
  totem_id: number | null;
  titulo: string;
  tipo_midia: 'video' | 'imagem' | 'noticia';
  tempo_exibicao: number;
  data_inicio: string;
  data_fim: string;
  arquivo_url: string;
  ativo: number;
}

export default function AgencyNews() {
  const [totems, setTotems] = useState<Totem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedTotem, setSelectedTotem] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Clima
  const [cidade, setCidade] = useState('São Paulo');
  const [estado, setEstado] = useState('SP');
  const [tempoExibicaoClima, setTempoExibicaoClima] = useState(15);
  const [loadingClima, setLoadingClima] = useState(false);

  // Loteria
  const [tipoLoteria, setTipoLoteria] = useState('megasena');
  const [tempoExibicaoLoteria, setTempoExibicaoLoteria] = useState(15);
  const [loadingLoteria, setLoadingLoteria] = useState(false);

  const loadData = async () => {
    try {
      const [tData, pData] = await Promise.all([
        apiFetch('/api/totems'),
        apiFetch('/api/playlists')
      ]);
      setTotems(tData);
      setPlaylists(pData);
      if (tData.length > 0 && !selectedTotem) setSelectedTotem(tData[0].id.toString());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddClima = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingClima(true);
    try {
      const dataInicio = new Date().toISOString();
      const dataFim = new Date();
      dataFim.setFullYear(dataFim.getFullYear() + 1);

      const url = `/widget/clima?cidade=${encodeURIComponent(cidade)}&estado=${encodeURIComponent(estado)}`;
      
      const payload = {
        totem_id: selectedTotem,
        titulo: `Clima: ${cidade}-${estado}`,
        tipo_midia: 'noticia',
        tempo_exibicao: tempoExibicaoClima,
        data_inicio: dataInicio,
        data_fim: dataFim.toISOString(),
        url
      };

      await apiFetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      loadData();
      alert('Widget de Clima adicionado à playlist!');
    } catch (e) {
      console.error(e);
      alert('Erro ao adicionar clima');
    } finally {
      setLoadingClima(false);
    }
  };

  const handleAddLoteria = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingLoteria(true);
    try {
      const dataInicio = new Date().toISOString();
      const dataFim = new Date();
      dataFim.setFullYear(dataFim.getFullYear() + 1);

      const url = `/widget/loteria?tipo=${encodeURIComponent(tipoLoteria)}`;
      const nomeLoteria = tipoLoteria === 'megasena' ? 'Mega-Sena' : 'Mega da Virada';
      
      const payload = {
        totem_id: selectedTotem,
        titulo: `Loteria: ${nomeLoteria}`,
        tipo_midia: 'noticia',
        tempo_exibicao: tempoExibicaoLoteria,
        data_inicio: dataInicio,
        data_fim: dataFim.toISOString(),
        url
      };

      await apiFetch('/api/playlists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      loadData();
      alert('Widget de Loteria adicionado à playlist!');
    } catch (e) {
      console.error(e);
      alert('Erro ao adicionar loteria');
    } finally {
      setLoadingLoteria(false);
    }
  };

  const handleDelete = async (id: number) => {
     if (confirm('Excluir widget da playlist?')) {
       await apiFetch(`/api/playlists/${id}`, { method: 'DELETE' });
       loadData();
     }
  }

  const newsPlaylists = playlists.filter(p => p.tipo_midia === 'noticia' && (selectedTotem ? p.totem_id === Number(selectedTotem) || p.totem_id === null : true));

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
         <div>
           <h2 className="text-sm font-bold text-white uppercase tracking-wider">Utilizar Notícias & Widgets</h2>
           <p className="text-xs text-zinc-500 mt-1">Adicione widgets dinâmicos à sua playlist.</p>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">Target:</span>
            <select 
              className="bg-zinc-900 border border-zinc-700 rounded text-xs px-2 py-1 outline-none text-zinc-200"
              value={selectedTotem}
              onChange={(e) => setSelectedTotem(e.target.value)}
            >
               <option value="">Todas as Telas (Global)</option>
               {totems.map(t => (
                 <option key={t.id} value={t.id}>{t.nome} ({t.device_id})</option>
               ))}
            </select>
         </div>
       </div>

       <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             {/* Clima Widget Form */}
             <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                      <CloudRain className="w-5 h-5 text-blue-400" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">Clima Tempo</h3>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Previsão do tempo local</p>
                   </div>
                </div>
                
                <form onSubmit={handleAddClima} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidade</label>
                        <input type="text" required value={cidade} onChange={e=>setCidade(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Estado (UF)</label>
                        <input type="text" maxLength={2} required value={estado} onChange={e=>setEstado(e.target.value.toUpperCase())} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all uppercase" />
                      </div>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                     <input type="number" min="1" required value={tempoExibicaoClima} onChange={e=>setTempoExibicaoClima(Number(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
                   </div>
                   <button type="submit" disabled={loadingClima} className="w-full bg-blue-600 hover:bg-blue-500 text-white rounded py-2 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                     <Plus className="w-4 h-4" />
                     {loadingClima ? 'Adicionando...' : 'Adicionar à Playlist'}
                   </button>
                </form>
             </div>

             {/* Loteria Widget Form */}
             <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-emerald-400" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-white">Resultados de Loteria</h3>
                     <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Sorteios recentes</p>
                   </div>
                </div>
                
                <form onSubmit={handleAddLoteria} className="space-y-4">
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tipo de Sorteio</label>
                     <select required value={tipoLoteria} onChange={e=>setTipoLoteria(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all">
                        <option value="megasena">Mega-Sena</option>
                        <option value="megavirada">Mega da Virada</option>
                        <option value="lotofacil">Lotofácil</option>
                        <option value="quina">Quina</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                     <input type="number" min="1" required value={tempoExibicaoLoteria} onChange={e=>setTempoExibicaoLoteria(Number(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
                   </div>
                   <button type="submit" disabled={loadingLoteria} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded py-2 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50 mt-2 flex items-center justify-center gap-2">
                     <Plus className="w-4 h-4" />
                     {loadingLoteria ? 'Adicionando...' : 'Adicionar à Playlist'}
                   </button>
                </form>
             </div>
          </div>

          <div className="bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden">
             <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Widgets Ativos na Playlist</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-zinc-400">
                   <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-[#111113]">
                     <tr>
                       <th className="px-6 py-3">Widget</th>
                       <th className="px-6 py-3">Duração</th>
                       <th className="px-6 py-3">Tipo</th>
                       <th className="px-6 py-3 text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody>
                   {newsPlaylists.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="px-6 py-8 text-center text-zinc-500">Nenhum widget ativo.</td>
                     </tr>
                   ) : (
                     newsPlaylists.map(item => (
                       <tr key={item.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                         <td className="px-6 py-4 font-sans text-white flex items-center gap-3">
                            <LayoutGrid className="w-4 h-4 text-indigo-400 shrink-0" />
                            <span className="truncate max-w-[200px]" title={item.titulo}>{item.titulo}</span>
                         </td>
                         <td className="px-6 py-4">{item.tempo_exibicao}s</td>
                         <td className="px-6 py-4">
                            <span className="bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded border border-indigo-500/20 text-[10px] uppercase font-bold tracking-widest">
                               Widget Web
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button onClick={() => handleDelete(item.id)} className="text-zinc-500 hover:text-rose-400 p-1 transition-colors">
                              <Trash2 className="w-4 h-4 inline" />
                            </button>
                         </td>
                       </tr>
                     ))
                   )}
                   </tbody>
                </table>
             </div>
          </div>
       </div>
    </div>
  );
}
