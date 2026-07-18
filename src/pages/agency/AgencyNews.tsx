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
  };

  const newsPlaylists = playlists.filter(p => p.tipo_midia === 'noticia' && (selectedTotem ? p.totem_id === Number(selectedTotem) || p.totem_id === null : true));

  return (
    <div className="space-y-6 flex flex-col lg:h-[calc(100vh-8rem)] h-auto">
       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
         <div>
           <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Utilizar Notícias & Widgets</h2>
           <p className="text-xs text-[#8b9aa5] font-medium mt-1">Adicione widgets dinâmicos de clima e utilidade à sua playlist.</p>
         </div>
         <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Filtrar Tela:</span>
            <select 
              className="bg-[#f4f6f8] border border-zinc-200 rounded-xl text-xs px-3 py-2 outline-none text-zinc-700 font-sans focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
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
             <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                      <CloudRain className="w-5 h-5 text-blue-500" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-zinc-800">Clima Tempo</h3>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Previsão do tempo local</p>
                   </div>
                </div>
                
                <form onSubmit={handleAddClima} className="space-y-4">
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidade</label>
                         <input type="text" required value={cidade} onChange={e=>setCidade(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                      <div>
                         <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Estado (UF)</label>
                         <input type="text" maxLength={2} required value={estado} onChange={e=>setEstado(e.target.value.toUpperCase())} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all uppercase" />
                      </div>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                     <input type="number" min="1" required value={tempoExibicaoClima} onChange={e=>setTempoExibicaoClima(Number(e.target.value))} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                   </div>
                   <button type="submit" disabled={loadingClima} className="w-full bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm">
                     <Plus className="w-4 h-4" />
                     {loadingClima ? 'Adicionando...' : 'Adicionar à Playlist'}
                   </button>
                </form>
             </div>

             {/* Loteria Widget Form */}
             <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                   <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                      <Hash className="w-5 h-5 text-emerald-500" />
                   </div>
                   <div>
                     <h3 className="text-sm font-bold text-zinc-800">Resultados de Loteria</h3>
                     <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Sorteios recentes</p>
                   </div>
                </div>
                
                <form onSubmit={handleAddLoteria} className="space-y-4">
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tipo de Sorteio</label>
                     <select required value={tipoLoteria} onChange={e=>setTipoLoteria(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                        <option value="megasena">Mega-Sena</option>
                        <option value="megavirada">Mega da Virada</option>
                        <option value="lotofacil">Lotofácil</option>
                        <option value="quina">Quina</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                     <input type="number" min="1" required value={tempoExibicaoLoteria} onChange={e=>setTempoExibicaoLoteria(Number(e.target.value))} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                   </div>
                   <button type="submit" disabled={loadingLoteria} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white rounded-full py-3 text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 mt-2 flex items-center justify-center gap-2 shadow-sm">
                     <Plus className="w-4 h-4" />
                     {loadingLoteria ? 'Adicionando...' : 'Adicionar à Playlist'}
                   </button>
                </form>
             </div>
          </div>

          <div className="bg-white border border-[#e8edf2] rounded-[24px] overflow-hidden shadow-sm">
             <div className="px-6 py-4 border-b border-[#e8edf2] flex justify-between items-center bg-zinc-50/50">
                <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider">Widgets Ativos na Playlist</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono text-zinc-600">
                   <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-[#e8edf2] bg-zinc-50/50">
                     <tr>
                       <th className="px-6 py-4">Widget</th>
                       <th className="px-6 py-4 font-sans">Duração</th>
                       <th className="px-6 py-4">Tipo</th>
                       <th className="px-6 py-4 text-right">Ações</th>
                     </tr>
                   </thead>
                   <tbody>
                   {newsPlaylists.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-[#8b9aa5] font-sans">Nenhum widget ativo.</td>
                     </tr>
                   ) : (
                     newsPlaylists.map(item => (
                       <tr key={item.id} className="border-b border-[#e8edf2] hover:bg-zinc-50/50 transition-colors">
                         <td className="px-6 py-4 font-sans text-zinc-800 font-bold flex items-center gap-3">
                            <LayoutGrid className="w-4 h-4 text-indigo-500 shrink-0" />
                            <span className="truncate max-w-[200px]" title={item.titulo}>{item.titulo}</span>
                         </td>
                         <td className="px-6 py-4 text-zinc-500 font-sans">{item.tempo_exibicao}s</td>
                         <td className="px-6 py-4">
                            <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 text-[9px] uppercase font-bold tracking-wider">
                                Widget Web
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-sans">
                            <button onClick={() => handleDelete(item.id)} className="text-zinc-400 hover:text-rose-500 p-1.5 transition-all rounded-lg hover:bg-rose-50">
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
