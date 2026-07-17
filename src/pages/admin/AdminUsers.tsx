import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Users, Plus, Key, Shield, Calendar, Search } from 'lucide-react';
import { format } from 'date-fns';

interface User {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  nivel: 'admin' | 'agencia';
  status_licenca: 'ativa' | 'expirada';
  validade_licenca: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLicense, setEditingLicense] = useState<User | null>(null);

  // Form
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nivel, setNivel] = useState<'admin' | 'agencia'>('agencia');
  const [validade, setValidade] = useState('');

  const loadUsers = async () => {
    try {
      const data = await apiFetch('/api/admin/users');
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({ nome, cpf, email, senha, nivel, validade_licenca: new Date(validade).toISOString() }),
      });
      setShowForm(false);
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLicense) return;
    try {
      await apiFetch(`/api/admin/users/${editingLicense.id}/license`, {
        method: 'PUT',
        body: JSON.stringify({ 
           status_licenca: editingLicense.status_licenca, 
           validade_licenca: new Date(editingLicense.validade_licenca).toISOString() 
        }),
      });
      setEditingLicense(null);
      loadUsers();
    } catch (err) {
      alert('Erro ao atualizar licença');
    }
  };

  return (
    <div className="space-y-6">
      {showForm && (
        <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6">
          <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Cadastrar Novo Usuário</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome</label>
               <input type="text" required value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">CPF (Obrigatório)</label>
               <input type="text" required value={cpf} onChange={e=>setCpf(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
               <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Senha Provisória</label>
               <input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nível de Acesso</label>
               <select value={nivel} onChange={e=>setNivel(e.target.value as any)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none">
                 <option value="agencia">Agência (Cliente)</option>
                 <option value="admin">Administrador</option>
               </select>
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Data de Expiração da Licença</label>
               <input type="date" required value={validade} onChange={e=>setValidade(e.target.value)} className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none [color-scheme:dark]" />
             </div>
             <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 rounded transition-colors">Cancelar</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors">Salvar Usuário</button>
             </div>
          </form>
        </div>
      )}

      {editingLicense && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-[#111113] border border-zinc-800 rounded-xl p-6 w-full max-w-md">
              <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">Gerenciar Licença: {editingLicense.nome}</h3>
              <form onSubmit={handleUpdateLicense} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Status da Licença</label>
                   <select 
                     value={editingLicense.status_licenca} 
                     onChange={e => setEditingLicense({...editingLicense, status_licenca: e.target.value as any})} 
                     className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm focus:border-indigo-500 outline-none"
                   >
                     <option value="ativa">Ativa</option>
                     <option value="expirada">Expirada / Suspensa</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Data de Expiração</label>
                   <input 
                     type="date" 
                     value={editingLicense.validade_licenca.split('T')[0]} 
                     onChange={e => setEditingLicense({...editingLicense, validade_licenca: e.target.value})} 
                     className="w-full bg-[#09090b] border border-zinc-800 rounded px-3 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none [color-scheme:dark]" 
                   />
                 </div>
                 <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => setEditingLicense(null)} className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-white border border-transparent hover:border-zinc-700 rounded transition-colors">Cancelar</button>
                    <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold uppercase tracking-widest transition-colors">Atualizar Licença</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="flex-1 bg-[#111113] border border-zinc-800 rounded-xl flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Gestão de Usuários</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded transition-all flex items-center gap-2"
          >
            <Plus className="w-3 h-3" />
            NOVO USUÁRIO
          </button>
        </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-zinc-800 bg-zinc-900/30">
                 <tr>
                    <th className="px-6 py-4">Nome / Email</th>
                    <th className="px-6 py-4">Nível</th>
                    <th className="px-6 py-4">Licença</th>
                    <th className="px-6 py-4 font-serif italic uppercase">Validade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="text-xs font-mono text-zinc-400">
                 {users.map(u => (
                    <tr key={u.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/20 transition-colors">
                       <td className="px-6 py-4">
                          <div className="font-sans text-white font-medium">{u.nome}</div>
                          <div className="text-[10px] text-zinc-500 mt-0.5">{u.email}</div>
                       </td>
                       <td className="px-6 py-4 font-sans text-[10px] uppercase font-bold tracking-widest">
                          {u.nivel === 'admin' ? (
                             <span className="text-indigo-400">Admin</span>
                          ) : (
                             <span className="text-zinc-500">Agência</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                          {u.status_licenca === 'ativa' ? (
                            <span className="bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] uppercase font-bold tracking-widest">ATIVA</span>
                          ) : (
                            <span className="bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded border border-rose-500/30 text-[10px] uppercase font-bold tracking-widest">EXPIRADA</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                          {format(new Date(u.validade_licenca), 'dd/MM/yyyy')}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button onClick={() => setEditingLicense(u)} className="text-zinc-500 hover:text-indigo-400 transition-colors text-[10px] font-bold tracking-widest uppercase border border-zinc-800 hover:border-indigo-500/50 rounded px-3 py-1.5 bg-zinc-900/50">
                             Editar
                          </button>
                       </td>
                    </tr>
                 ))}
              </tbody>
           </table>
         </div>
      </div>
    </div>
  );
}
