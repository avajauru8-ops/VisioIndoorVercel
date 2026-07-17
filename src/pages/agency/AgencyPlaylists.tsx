import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { MonitorPlay, UploadCloud, Film, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react';
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
  tipo_midia: 'video' | 'imagem' | string;
  tempo_exibicao: number;
  data_inicio: string;
  data_fim: string;
  arquivo_url: string;
  ativo: number;
}

export default function AgencyPlaylists() {
  const [totems, setTotems] = useState<Totem[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Edit State
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form State - Midia
  const [selectedTotem, setSelectedTotem] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoMidia, setTipoMidia] = useState<'video' | 'imagem'>('imagem');
  const [tempoExibicao, setTempoExibicao] = useState(15);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const handleEdit = (item: Playlist) => {
    setEditingId(item.id);
    setSelectedTotem(item.totem_id ? item.totem_id.toString() : '');
    setTempoExibicao(item.tempo_exibicao);
    
    // Format dates for datetime-local input
    const start = new Date(item.data_inicio);
    const end = new Date(item.data_fim);
    
    setTitulo(item.titulo);
    setTipoMidia(item.tipo_midia as any);
    setDataInicio(format(start, "yyyy-MM-dd'T'HH:mm"));
    setDataFim(format(end, "yyyy-MM-dd'T'HH:mm"));
    setFile(null); // File won't be prepopulated
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitulo('');
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return alert('Selecione um arquivo');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('totem_id', selectedTotem);
      formData.append('titulo', titulo);
      formData.append('tipo_midia', tipoMidia);
      formData.append('tempo_exibicao', tempoExibicao.toString());
      formData.append('data_inicio', new Date(dataInicio).toISOString());
      formData.append('data_fim', new Date(dataFim).toISOString());
      if (file) formData.append('arquivo', file);

      await apiFetch(editingId ? `/api/playlists/${editingId}` : '/api/playlists', {
        method: editingId ? 'PUT' : 'POST',
        body: formData,
      });

      cancelEdit();
      loadData();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar mídia: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (id: number) => {
     if (confirm('Excluir mídia?')) {
       await apiFetch(`/api/playlists/${id}`, { method: 'DELETE' });
       if (editingId === id) cancelEdit();
       loadData();
     }
  }

  const filteredPlaylists = selectedTotem 
    ? playlists.filter(p => p.totem_id === Number(selectedTotem) || p.totem_id === null)
    : playlists;

  const now = new Date();

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de Playlist</h2>
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 overflow-hidden">
         {/* Sidebar Forms */}
         <div className="col-span-1 bg-[#111113] border border-zinc-800 rounded-xl flex flex-col overflow-hidden relative">
            {editingId && (
               <div className="bg-indigo-900/50 py-2 text-center pointer-events-none">
                  <span className="text-indigo-200 text-[10px] font-bold uppercase tracking-widest animate-pulse">Editando Mídia</span>
               </div>
            )}
            {!editingId && (
               <div className="border-b border-zinc-800 p-4">
                  <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Adicionar Nova Mídia</h3>
               </div>
            )}
            
            <div className="p-6 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} className="space-y-4">
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Título</label>
                     <input type="text" required value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tipo</label>
                       <select value={tipoMidia} onChange={e=>setTipoMidia(e.target.value as any)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all">
                         <option value="imagem">Imagem</option>
                         <option value="video">Vídeo</option>
                       </select>
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                       <input type="number" min="1" required value={tempoExibicao} onChange={e=>setTempoExibicao(Number(e.target.value))} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none transition-all" />
                     </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                     <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Início</label>
                       <input type="datetime-local" required value={dataInicio} onChange={e=>setDataInicio(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none transition-all [color-scheme:dark]" />
                     </div>
                     <div>
                       <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Fim</label>
                       <input type="datetime-local" required value={dataFim} onChange={e=>setDataFim(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none transition-all [color-scheme:dark]" />
                     </div>
                   </div>

                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Arquivo {editingId ? '(Opcional)' : '(Drag & Drop)'}</label>
                     <div className="border border-dashed border-zinc-700 bg-[#09090b] rounded px-6 py-8 text-center hover:bg-zinc-900/50 transition-colors relative cursor-pointer">
                        <input type="file" required={!editingId} onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*,video/*" />
                        <UploadCloud className="w-6 h-6 text-zinc-600 mx-auto mb-2" />
                        <p className="text-[10px] font-mono text-zinc-400">{file ? file.name : (editingId ? 'MANTER ARQUIVO ATUAL' : 'SELECIONAR ARQUIVO')}</p>
                     </div>
                   </div>

                   <div className="flex gap-2 mt-4">
                     {editingId && (
                        <button type="button" onClick={cancelEdit} className="w-1/3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded py-2 text-[10px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center">
                          <X className="w-3 h-3 mr-1" /> Cancelar
                        </button>
                     )}
                     <button type="submit" disabled={uploading} className={`${editingId ? 'w-2/3' : 'w-full'} bg-indigo-600 hover:bg-indigo-500 text-white rounded py-2 text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50`}>
                       {uploading ? (editingId ? 'ATUALIZANDO...' : 'ENVIANDO...') : (editingId ? 'ATUALIZAR MÍDIA' : 'ADICIONAR À PLAYLIST')}
                     </button>
                   </div>
                </form>
            </div>
         </div>

         {/* Playlist Table */}
         <div className="col-span-1 lg:col-span-2 bg-[#111113] border border-zinc-800 rounded-xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
               <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Mídias Ativas {selectedTotem ? 'Nesta Tela' : '(Global)'}</h3>
            </div>
            <div className="flex-1 overflow-auto">
               <table className="w-full text-left text-xs font-mono text-zinc-400">
                  <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 sticky top-0 bg-[#111113] z-10">
                    <tr>
                      <th className="px-6 py-3">Mídia</th>
                      <th className="px-6 py-3">Duração</th>
                      <th className="px-6 py-3">Validade</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                  {filteredPlaylists.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Nenhuma mídia ativa.</td>
                    </tr>
                  ) : (
                    filteredPlaylists.map(item => {
                      const isExpired = new Date(item.data_fim) < now;
                      const isEditing = editingId === item.id;
                      
                      return (
                      <tr key={item.id} className={`border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors ${isEditing ? 'bg-indigo-900/10 border-indigo-500/30' : ''}`}>
                        <td className="px-6 py-4 font-sans text-white flex items-center gap-3">
                           {item.tipo_midia === 'video' ? <Film className="w-4 h-4 text-indigo-400 shrink-0" /> : <ImageIcon className="w-4 h-4 text-emerald-400 shrink-0" />}
                           <span className="truncate max-w-[150px] block" title={item.titulo}>{item.titulo}</span>
                        </td>
                        <td className="px-6 py-4">{item.tempo_exibicao}s</td>
                        <td className="px-6 py-4">{format(new Date(item.data_fim), 'dd/MM/yyyy HH:mm')}</td>
                        <td className="px-6 py-4">
                           {isExpired ? (
                             <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 text-[10px] uppercase font-bold tracking-widest">EXPIRADO</span>
                           ) : item.ativo === 1 ? (
                             <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest">ATIVO</span>
                           ) : (
                             <span className="bg-zinc-800 text-zinc-500 px-2 py-0.5 rounded border border-zinc-700 text-[10px] uppercase font-bold tracking-widest">INATIVO</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap">
                           <button onClick={() => handleEdit(item)} className="text-zinc-500 hover:text-indigo-400 p-1 transition-colors mr-2" title="Editar">
                             <Edit2 className="w-4 h-4 inline" />
                           </button>
                           <button onClick={() => handleDelete(item.id)} className="text-zinc-500 hover:text-rose-400 p-1 transition-colors" title="Excluir">
                             <Trash2 className="w-4 h-4 inline" />
                           </button>
                        </td>
                      </tr>
                    )
                    })
                  )}
                  </tbody>
               </table>
            </div>
         </div>
      </div>
    </div>
  );
}
