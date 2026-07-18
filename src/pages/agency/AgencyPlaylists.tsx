import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { MonitorPlay, UploadCloud, Film, Image as ImageIcon, Trash2, Edit2, X } from 'lucide-react';
import { format } from 'date-fns';

interface Totem {
  id: string;
  nome: string;
  device_id: string;
}

interface Playlist {
  id: string;
  totem_id: string | null;
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
  const [useBlob, setUseBlob] = useState(false);
  
  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State - Midia
  const [selectedTotem, setSelectedTotem] = useState('');
  const [formTotemId, setFormTotemId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [tipoMidia, setTipoMidia] = useState<'video' | 'imagem'>('imagem');
  const [tempoExibicao, setTempoExibicao] = useState(15);
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const loadData = async () => {
    try {
      const [tData, pData, configData] = await Promise.all([
        apiFetch('/api/totems'),
        apiFetch('/api/playlists'),
        apiFetch('/api/config').catch(() => ({ useBlob: false }))
      ]);
      setTotems(tData);
      setPlaylists(pData);
      setUseBlob(!!configData?.useBlob);
      if (tData.length > 0 && !selectedTotem) setSelectedTotem('');
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
    setFormTotemId(item.totem_id ? item.totem_id : '');
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
    setFormTotemId('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId && !file) return alert('Selecione um arquivo');
    setUploading(true);

    try {
      let bodyData: any = {
        totem_id: formTotemId ? formTotemId : null,
        titulo,
        tipo_midia: tipoMidia,
        tempo_exibicao: Number(tempoExibicao),
        data_inicio: new Date(dataInicio).toISOString(),
        data_fim: new Date(dataFim).toISOString(),
      };

      if (file && useBlob) {
        // Direct Client-Side Upload to Vercel Blob to bypass 4.5MB server limit
        const { upload } = await import('@vercel/blob/client');
        const blob = await upload(file.name, file, {
          access: 'public',
          handleUploadUrl: '/api/blob/upload'
        });
        bodyData.arquivo_url = blob.url;
      }

      if (useBlob) {
        // Send JSON representation
        await apiFetch(editingId ? `/api/playlists/${editingId}` : '/api/playlists', {
          method: editingId ? 'PUT' : 'POST',
          body: JSON.stringify(bodyData),
        });
      } else {
        // Fallback to standard Multipart Form Data upload
        const formData = new FormData();
        formData.append('totem_id', formTotemId);
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
      }

      cancelEdit();
      loadData();
    } catch (err: any) {
      console.error(err);
      alert('Erro ao enviar mídia: ' + (err.message || 'Erro desconhecido'));
    } finally {
      setUploading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
     if (confirm('Excluir mídia?')) {
       await apiFetch(`/api/playlists/${id}`, { method: 'DELETE' });
       if (editingId === id) cancelEdit();
       loadData();
     }
  };

  const filteredPlaylists = selectedTotem 
    ? playlists.filter(p => p.totem_id === selectedTotem || p.totem_id === null)
    : playlists;

  const now = new Date();

  return (
    <div className="space-y-6 flex flex-col lg:h-[calc(100vh-8rem)] h-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Gestão de Playlist</h2>
          <p className="text-xs text-[#8b9aa5] font-medium mt-1">Envie mídias e organize as programações de suas telas.</p>
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

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 lg:overflow-hidden overflow-visible">
         {/* Sidebar Forms */}
         <div className="col-span-1 bg-white border border-[#e8edf2] rounded-[24px] flex flex-col overflow-hidden relative shadow-sm lg:h-full h-auto">
            {editingId && (
               <div className="bg-emerald-500/10 border-b border-emerald-100 py-2.5 text-center shrink-0">
                  <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-widest animate-pulse">Editando Mídia</span>
               </div>
            )}
            {!editingId && (
               <div className="border-b border-[#e8edf2] p-4 bg-zinc-50/50 shrink-0">
                  <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider">Adicionar Nova Mídia</h3>
               </div>
            )}
            
            <div className="p-6 overflow-y-auto flex-1">
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tela de Exibição</label>
                      <select 
                        className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                        value={formTotemId}
                        onChange={(e) => setFormTotemId(e.target.value)}
                      >
                         <option value="">Todas as Telas (Global)</option>
                         {totems.map(t => (
                            <option key={t.id} value={t.id}>{t.nome} ({t.device_id})</option>
                         ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Título</label>
                      <input type="text" required value={titulo} onChange={e=>setTitulo(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Tipo</label>
                        <select value={tipoMidia} onChange={e=>setTipoMidia(e.target.value as any)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all">
                          <option value="imagem">Imagem</option>
                          <option value="video">Vídeo</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Duração (s)</label>
                        <input type="number" required value={tempoExibicao} onChange={e=>setTempoExibicao(Number(e.target.value))} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Início</label>
                        <input type="datetime-local" required value={dataInicio} onChange={e=>setDataInicio(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all [color-scheme:light]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Fim</label>
                        <input type="datetime-local" required value={dataFim} onChange={e=>setDataFim(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all [color-scheme:light]" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Arquivo (Drag & Drop)</label>
                      <div className="relative border-2 border-dashed border-zinc-200 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-[#fcfdfe]">
                        <input 
                          type="file" 
                          accept={tipoMidia === 'imagem' ? 'image/*' : 'video/*'}
                          onChange={e => setFile(e.target.files?.[0] || null)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <UploadCloud className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                        <span className="text-xs text-zinc-500 font-bold block">
                          {file ? file.name.toUpperCase() : 'SELECIONE OU ARRASTE O ARQUIVO'}
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 flex gap-2">
                      {editingId && (
                        <button type="button" onClick={cancelEdit} className="flex-1 border border-zinc-200 hover:bg-zinc-50 text-zinc-600 font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm">
                          Cancelar
                        </button>
                      )}
                      <button 
                        type="submit" 
                        disabled={uploading}
                        className="flex-1 bg-[#0b462c] hover:bg-[#082a1b] disabled:bg-zinc-300 text-white font-bold text-xs py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        {uploading ? 'ENVIANDO...' : editingId ? 'SALVAR ALTERAÇÕES' : 'ADICIONAR MÍDIA'}
                      </button>
                    </div>
                 </form>
            </div>
         </div>

         {/* Playlist Grid */}
         <div className="col-span-1 lg:col-span-2 bg-white border border-[#e8edf2] rounded-[24px] flex flex-col overflow-hidden shadow-sm lg:h-full h-auto">
            <div className="border-b border-[#e8edf2] p-4 bg-zinc-50/50">
               <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider">Mídias Ativas nesta Tela</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
               {filteredPlaylists.map(item => {
                 const isExpired = new Date(item.data_fim) < now;
                 return (
                   <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-[#e8edf2] hover:bg-zinc-50/50 transition-all gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-16 h-16 rounded-xl bg-zinc-100 overflow-hidden flex items-center justify-center shrink-0 border border-zinc-200">
                           {item.tipo_midia === 'video' ? (
                             <Film className="w-6 h-6 text-zinc-400" />
                           ) : (
                             <img src={item.arquivo_url} alt={item.titulo} className="w-full h-full object-cover" />
                           )}
                         </div>
                         <div>
                            <h4 className="text-sm font-extrabold text-zinc-800 leading-tight">{item.titulo}</h4>
                            <div className="flex flex-wrap gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-100 text-zinc-600">
                                {item.tempo_exibicao}s
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-zinc-100 text-zinc-600 uppercase">
                                {item.tipo_midia}
                              </span>
                              {isExpired ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-rose-50 text-rose-600 uppercase">
                                  Expirado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-50 text-emerald-600 uppercase">
                                  Ativo
                                </span>
                              )}
                            </div>
                         </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-100">
                         <div className="text-left sm:text-right">
                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider leading-none">Validade</p>
                            <p className="text-xs text-zinc-500 font-medium font-sans mt-1">
                              Até {format(new Date(item.data_fim), 'dd/MM/yyyy HH:mm')}
                            </p>
                         </div>
                         <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-zinc-400 hover:text-[#0b462c] hover:bg-[#e8f5ed]/30 rounded-lg transition-all border border-transparent hover:border-[#e8edf2]">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all border border-transparent hover:border-rose-100">
                              <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>
                   </div>
                 );
               })}
               {filteredPlaylists.length === 0 && (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-400 py-12">
                   <MonitorPlay className="w-12 h-12 mb-3 opacity-30 text-[#8b9aa5]" />
                   <p className="text-sm font-semibold">Nenhuma mídia ativa.</p>
                 </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
