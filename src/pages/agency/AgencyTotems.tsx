import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Tv, Plus, Search, Trash2, Settings2 } from 'lucide-react';

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
        <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Novo Totem</h3>
          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            {error && <div className="text-rose-500 text-xs font-mono bg-rose-500/10 p-3 rounded">{error}</div>}
            
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome do Ponto</label>
              <input
                type="text"
                required
                className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
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
                className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                value={deviceId}
                onChange={e => setDeviceId(e.target.value)}
                placeholder="Ex: TOTEM-001"
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 rounded transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors">Salvar</button>
            </div>
          </form>
        </div>
      )}

      <div className="flex-1 bg-[#111113] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Monitoramento de Totens</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" />
            CADASTRAR NOVO TOTEM
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/30">
              <tr>
                <th className="px-6 py-4">Nome do Ponto</th>
                <th className="px-6 py-4 font-serif italic uppercase">Device ID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Última Sincronização</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="text-xs font-mono text-zinc-400">
               {totems.length === 0 && !loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">Nenhum totem cadastrado.</td>
                  </tr>
               ) : (
                  totems.map(totem => (
                     <tr key={totem.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                        <td className="px-6 py-4 font-sans text-white">{totem.nome}</td>
                        <td className="px-6 py-4">{totem.device_id}</td>
                        <td className="px-6 py-4">
                           {totem.status === 'online' ? (
                             <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest">ONLINE</span>
                           ) : (
                             <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 text-[10px] uppercase font-bold tracking-widest">OFFLINE</span>
                           )}
                        </td>
                        <td className="px-6 py-4 text-zinc-500">
                           {totem.ultima_sincronizacao ? new Date(totem.ultima_sincronizacao).toLocaleString() : 'Nunca'}
                        </td>
                        <td className="px-6 py-4 text-right">
                           <button onClick={() => handleDelete(totem.id)} className="text-zinc-500 hover:text-rose-400 p-1 transition-colors">
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
