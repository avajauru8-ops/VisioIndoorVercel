import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Tv, Edit, Trash2, Search, CheckCircle, XCircle, Calendar, User, Info, AlertTriangle, X } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminTotems() {
  const [totems, setTotems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Edit State
  const [editingTotem, setEditingTotem] = useState<any | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editDeviceId, setEditDeviceId] = useState('');
  const [saving, setSaving] = useState(false);

  // Delete State
  const [deletingTotem, setDeletingTotem] = useState<any | null>(null);

  const loadTotems = async () => {
    try {
      const data = await apiFetch('/api/totems');
      setTotems(data || []);
    } catch (err) {
      console.error('Erro ao carregar totens:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTotems();
  }, []);

  const handleEdit = (totem: any) => {
    setEditingTotem(totem);
    setEditNome(totem.nome);
    setEditDeviceId(totem.device_id);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTotem) return;
    setSaving(true);
    try {
      await apiFetch(`/api/totems/${editingTotem.id}`, {
        method: 'PUT',
        body: JSON.stringify({ nome: editNome, device_id: editDeviceId }),
      });
      alert('Totem atualizado com sucesso!');
      setEditingTotem(null);
      loadTotems();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar totem.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTotem) return;
    try {
      await apiFetch(`/api/totems/${deletingTotem.id}`, {
        method: 'DELETE',
      });
      alert('Totem removido com sucesso!');
      setDeletingTotem(null);
      loadTotems();
    } catch (err: any) {
      alert(err.message || 'Erro ao remover totem.');
    }
  };

  const filteredTotems = totems.filter(t => 
    t.nome.toLowerCase().includes(search.toLowerCase()) ||
    t.device_id.toLowerCase().includes(search.toLowerCase()) ||
    t.usuario_nome.toLowerCase().includes(search.toLowerCase()) ||
    t.usuario_email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-emerald-600" />
            Totens Cadastrados
          </h2>
          <p className="text-xs text-[#8b9aa5] font-medium mt-1">
            Monitore e gerencie todos os dispositivos totens/telas cadastrados por agências.
          </p>
        </div>
        
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-zinc-400" />
          </span>
          <input 
            type="text" 
            placeholder="Buscar por nome, ID ou agência..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-white border border-zinc-200 rounded-full pl-9 pr-4 py-2 text-xs text-[#0b462c] placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" 
          />
        </div>
      </div>

      <div className="bg-white border border-[#e8edf2] rounded-[24px] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-sm text-zinc-400">Carregando totens...</div>
          ) : filteredTotems.length === 0 ? (
            <div className="p-12 text-center text-sm text-zinc-400">Nenhum totem cadastrado encontrado.</div>
          ) : (
            <table className="w-full text-left text-xs font-sans text-zinc-600">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-[#e8edf2] bg-zinc-50/50">
                <tr>
                  <th className="px-6 py-4">Nome do Dispositivo</th>
                  <th className="px-6 py-4">ID do Dispositivo (Vinc.)</th>
                  <th className="px-6 py-4">Cadastrado Por (Agência)</th>
                  <th className="px-6 py-4">Data de Cadastro</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e8edf2]">
                {filteredTotems.map((totem) => (
                  <tr key={totem.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-zinc-800 flex items-center gap-2">
                      <Tv className="w-4 h-4 text-zinc-400" />
                      {totem.nome}
                    </td>
                    <td className="px-6 py-4 font-mono text-zinc-500">{totem.device_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-zinc-700">{totem.usuario_nome}</div>
                      <div className="text-[10px] text-zinc-400 leading-none mt-0.5">{totem.usuario_email}</div>
                    </td>
                    <td className="px-6 py-4 text-zinc-500">
                      {totem.data_cadastro ? format(new Date(totem.data_cadastro), 'dd/MM/yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        totem.status === 'online' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-zinc-100 text-zinc-400 border border-zinc-200'
                      }`}>
                        {totem.status === 'online' ? (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Online
                          </>
                        ) : (
                          <>
                            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                            Offline
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(totem)}
                          className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => setDeletingTotem(totem)}
                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                          title="Remover"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTotem && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] border border-[#e8edf2] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#e8edf2] pb-4 mb-4">
              <h3 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-600" />
                Editar Totem
              </h3>
              <button 
                onClick={() => setEditingTotem(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome do Totem</label>
                <input 
                  type="text" 
                  required
                  value={editNome}
                  onChange={e => setEditNome(e.target.value)}
                  className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">ID do Dispositivo (Device ID)</label>
                <input 
                  type="text" 
                  required
                  value={editDeviceId}
                  onChange={e => setEditDeviceId(e.target.value)}
                  className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all font-mono"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#e8edf2]">
                <button 
                  type="button" 
                  onClick={() => setEditingTotem(null)}
                  className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="px-5 py-2 bg-[#0b462c] hover:bg-[#082a1b] text-white text-xs font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTotem && (
        <div className="fixed inset-0 bg-black/45 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-[24px] border border-[#e8edf2] max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-rose-600 border-b border-[#e8edf2] pb-4 mb-4">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-sm font-extrabold uppercase tracking-wider">Confirmar Remoção</h3>
            </div>
            
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">
              Tem certeza que deseja remover o totem <strong className="text-zinc-800">"{deletingTotem.nome}"</strong> ({deletingTotem.device_id})? 
              Essa ação é definitiva e desconectará o dispositivo da rede de exibição imediatamente.
            </p>

            <div className="flex justify-end gap-3 border-t border-[#e8edf2] pt-4">
              <button 
                type="button" 
                onClick={() => setDeletingTotem(null)}
                className="px-4 py-2 text-xs font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button 
                type="button" 
                onClick={handleDeleteConfirm}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all"
              >
                Confirmar Remoção
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
