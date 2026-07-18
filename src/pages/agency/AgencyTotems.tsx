import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Tv, Plus, Search, Trash2 } from 'lucide-react';

interface Totem {
  id: number;
  nome: string;
  device_id: string;
  status: 'online' | 'offline';
  ultima_sincronizacao: string | null;
}

export default function AgencyTotems() {
  const [totems, setTotems] = useState<Totem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [nome, setNome] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [error, setError] = useState('');

  const loadTotems = async () => {
    try {
      const data = await apiFetch('/api/totems');
      setTotems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotems();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/totems', {
        method: 'POST',
        body: JSON.stringify({ nome, device_id: deviceId }),
      });
      setNome('');
      setDeviceId('');
      setShowForm(false);
      loadTotems();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Deseja realmente excluir este totem?')) {
      try {
        await apiFetch(`/api/totems/${id}`, { method: 'DELETE' });
        loadTotems();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="bg-white border border-[#e8edf2] rounded-2xl p-6 shadow-sm">
          <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider mb-4">Novo Totem</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && <div className="text-rose-500 text-xs font-mono bg-rose-50 border border-rose-100 p-3 rounded-xl">{error}</div>}
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome do Ponto</label>
              <input
                type="text"
                required
                className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Ex: Recepção Matriz"
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Device ID (Código Único)</label>
              <input
                type="text"
                required
                className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                placeholder="Ex: TOTEM-001"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)} 
                className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 rounded-full transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="px-5 py-2.5 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
              >
                Salvar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-white border border-[#e8edf2] rounded-[24px] flex flex-col overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#e8edf2] flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Monitoramento de Totens</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0b462c] hover:bg-[#082a1b] text-white text-[10px] font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            CADASTRAR NOVO TOTEM
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-[#e8edf2] bg-zinc-50/50">
              <tr>
                <th className="px-6 py-4">Nome do Ponto</th>
                <th className="px-6 py-4 font-sans uppercase">Device ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Última Sincronização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono text-zinc-600">
               {totems.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-[#8b9aa5] font-sans">Nenhum totem cadastrado.</td>
                  </tr>
               ) : (
                  totems.map(totem => (
                     <tr key={totem.id} className="border-b border-[#e8edf2] hover:bg-zinc-50/50 transition-colors">
                        <td className="px-6 py-4 font-sans text-zinc-800 font-bold">{totem.nome}</td>
                        <td className="px-6 py-4 text-zinc-500">{totem.device_id}</td>
                        <td className="px-6 py-4">
                           {totem.status === 'online' ? (
                             <span className="bg-[#e8f5ed] text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 text-[9px] uppercase font-bold tracking-wider">ONLINE</span>
                           ) : (
                             <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100 text-[9px] uppercase font-bold tracking-wider">OFFLINE</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500 font-sans">
                           {totem.ultima_sincronizacao ? new Date(totem.ultima_sincronizacao).toLocaleString() : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDelete(totem.id)} className="text-zinc-400 hover:text-rose-500 p-1.5 transition-all rounded-lg hover:bg-rose-50">
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
  );
}
