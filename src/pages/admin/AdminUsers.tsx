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
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editSenha, setEditSenha] = useState('');

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
      setNome('');
      setCpf('');
      setEmail('');
      setSenha('');
      setValidade('');
      loadUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    try {
      await apiFetch(`/api/admin/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
           nome: editingUser.nome,
           email: editingUser.email,
           senha: editSenha,
           nivel: editingUser.nivel,
           status_licenca: editingUser.status_licenca, 
           validade_licenca: new Date(editingUser.validade_licenca).toISOString() 
        }),
      });
      setEditingUser(null);
      setEditSenha('');
      loadUsers();
    } catch (err: any) {
      alert(err.message || 'Erro ao atualizar usuário');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Gestão de Usuários</h2>
          <p className="text-xs text-[#8b9aa5] font-medium mt-1">Gerencie clientes, agências e suas respectivas licenças do sistema.</p>
        </div>
      </div>

      {showForm && (
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm">
          <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider mb-4">Cadastrar Novo Usuário</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome</label>
               <input type="text" required value={nome} onChange={e=>setNome(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">CPF (Obrigatório)</label>
               <input type="text" required value={cpf} onChange={e=>setCpf(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
               <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Senha Provisória</label>
               <input type="password" required value={senha} onChange={e=>setSenha(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none transition-all" />
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nível de Acesso</label>
               <select value={nivel} onChange={e=>setNivel(e.target.value as any)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none">
                 <option value="agencia">Agência (Cliente)</option>
                 <option value="admin">Administrador</option>
               </select>
             </div>
             <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Data de Expiração da Licença</label>
               <input type="date" required value={validade} onChange={e=>setValidade(e.target.value)} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none [color-scheme:light]" />
             </div>
             <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 rounded-full transition-colors">Cancelar</button>
                <button type="submit" className="px-5 py-2.5 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">Salvar Usuário</button>
             </div>
          </form>
        </div>
      )}

      {editingUser && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
           <div className="bg-white border border-[#e8edf2] rounded-[24px] p-8 w-full max-w-lg shadow-lg animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <h3 className="text-[#0b462c] text-sm font-extrabold uppercase tracking-wider mb-6">Editar Usuário: {editingUser.nome}</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome</label>
                   <input 
                     type="text" 
                     required 
                     value={editingUser.nome} 
                     onChange={e => setEditingUser({...editingUser, nome: e.target.value})} 
                     className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all" 
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
                   <input 
                     type="email" 
                     required 
                     value={editingUser.email} 
                     onChange={e => setEditingUser({...editingUser, email: e.target.value})} 
                     className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none transition-all" 
                   />
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nova Senha (Deixe em branco para manter a atual)</label>
                   <input 
                     type="password" 
                     value={editSenha} 
                     onChange={e => setEditSenha(e.target.value)} 
                     placeholder="••••••"
                     className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none transition-all" 
                   />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nível de Acesso</label>
                     <select 
                       value={editingUser.nivel} 
                       onChange={e => setEditingUser({...editingUser, nivel: e.target.value as any})} 
                       className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none"
                     >
                       <option value="agencia">Agência (Cliente)</option>
                       <option value="admin">Administrador</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Status da Licença</label>
                     <select 
                       value={editingUser.status_licenca} 
                       onChange={e => setEditingUser({...editingUser, status_licenca: e.target.value as any})} 
                       className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none"
                     >
                       <option value="ativa">Ativa</option>
                       <option value="expirada">Expirada / Suspensa</option>
                     </select>
                   </div>
                 </div>
                 <div>
                   <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Data de Expiração da Licença</label>
                   <input 
                     type="date" 
                     required
                     value={editingUser.validade_licenca.split('T')[0]} 
                     onChange={e => setEditingUser({...editingUser, validade_licenca: e.target.value})} 
                     className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-3 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 outline-none [color-scheme:light]" 
                   />
                 </div>
                 <div className="flex justify-end gap-3 pt-6">
                    <button type="button" onClick={() => { setEditingUser(null); setEditSenha(''); }} className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-800 border border-zinc-200 hover:border-zinc-300 rounded-full transition-colors">Cancelar</button>
                    <button type="submit" className="px-5 py-2.5 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm">Salvar Alterações</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      <div className="flex-1 bg-white border border-[#e8edf2] rounded-[24px] flex flex-col overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-[#e8edf2] flex justify-between items-center bg-zinc-50/50">
          <h2 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Gestão de Usuários</h2>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-[#0b462c] hover:bg-[#082a1b] text-white text-[10px] font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            NOVO USUÁRIO
          </button>
        </div>
         <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 border-b border-[#e8edf2] bg-zinc-50/50">
                 <tr>
                    <th className="px-6 py-4">Nome / Email</th>
                    <th className="px-6 py-4">Nível</th>
                    <th className="px-6 py-4">Licença</th>
                    <th className="px-6 py-4 font-sans uppercase">Validade</th>
                    <th className="px-6 py-4 text-right">Ações</th>
                 </tr>
              </thead>
              <tbody className="text-xs font-mono text-zinc-600">
                 {users.map(u => (
                    <tr key={u.id} className="border-b border-[#e8edf2] hover:bg-zinc-50/50 transition-colors">
                       <td className="px-6 py-4 font-sans">
                          <div className="text-zinc-800 font-bold text-sm leading-none">{u.nome}</div>
                          <div className="text-[10px] text-zinc-400 font-mono mt-1.5 leading-none">{u.email}</div>
                       </td>
                       <td className="px-6 py-4 font-sans text-[10px] uppercase font-bold tracking-widest">
                          {u.nivel === 'admin' ? (
                             <span className="text-[#0b462c]">Admin</span>
                          ) : (
                             <span className="text-zinc-400">Agência</span>
                          )}
                       </td>
                       <td className="px-6 py-4">
                          {u.status_licenca === 'ativa' ? (
                            <span className="bg-[#e8f5ed] text-emerald-600 px-2.5 py-1 rounded-full border border-emerald-100 text-[9px] uppercase font-bold tracking-wider">ATIVA</span>
                          ) : (
                            <span className="bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full border border-rose-100 text-[9px] uppercase font-bold tracking-wider">EXPIRADA</span>
                          )}
                       </td>
                       <td className="px-6 py-4 text-zinc-500 font-sans">
                          {format(new Date(u.validade_licenca), 'dd/MM/yyyy')}
                       </td>
                       <td className="px-6 py-4 text-right font-sans">
                          <button onClick={() => setEditingUser(u)} className="text-zinc-500 hover:text-[#0b462c] transition-all text-[9px] font-extrabold tracking-widest uppercase border border-zinc-200 hover:border-[#e8edf2] rounded-full px-4 py-2 bg-zinc-50 hover:bg-[#e8f5ed]/30 shadow-xs">
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
