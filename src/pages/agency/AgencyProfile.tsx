import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Landmark, UploadCloud } from 'lucide-react';

export default function AgencyProfile() {
  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiFetch('/api/agency/profile');
        setProfile(data || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      Object.keys(profile).forEach(key => {
        if (profile[key] !== null && profile[key] !== undefined) {
           formData.append(key, profile[key]);
        }
      });
      if (file) {
        formData.append('logo', file);
      }

      await apiFetch('/api/agency/profile', {
        method: 'POST',
        body: formData,
      });
      alert('Perfil atualizado com sucesso!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar perfil.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Dados da Agência</h2>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Configure informações essenciais da sua agência e os dados para contratos.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e8edf2] rounded-[24px] p-8 space-y-6 shadow-sm">
         
         <div className="flex items-center gap-6 pb-6 border-b border-[#e8edf2]">
            <div className="w-24 h-24 rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-inner">
               {profile.logo_url || file ? (
                 <img src={file ? URL.createObjectURL(file) : profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <UploadCloud className="w-8 h-8 text-zinc-300" />
               )}
               <div className="absolute inset-0 bg-[#0b462c]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                 <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">Alterar</span>
               </div>
            </div>
            <div>
               <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider mb-1">Logomarca da Agência</h3>
               <p className="text-[10px] text-zinc-400 font-medium">Recomendado formato quadrado transparente (PNG)</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome da Agência</label>
              <input type="text" name="nome" value={profile.nome || ''} onChange={handleChange} required className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">CPF ou CNPJ</label>
              <input type="text" name="cpf_cnpj" value={profile.cpf_cnpj || ''} onChange={handleChange} required className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Endereço Completo</label>
              <input type="text" name="endereco" value={profile.endereco || ''} onChange={handleChange} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidade Sede</label>
              <input type="text" name="cidade" value={profile.cidade || ''} onChange={handleChange} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Estado</label>
              <input type="text" name="estado" value={profile.estado || ''} onChange={handleChange} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">WhatsApp de Contato</label>
              <input type="text" name="whatsapp" value={profile.whatsapp || ''} onChange={handleChange} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm font-mono focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="Ex: (00) 00000-0000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidades de Atuação</label>
              <input type="text" name="cidades_atuacao" value={profile.cidades_atuacao || ''} onChange={handleChange} className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" placeholder="Ex: São Paulo, Campinas" />
            </div>
         </div>

         <div className="pt-6 flex justify-end border-t border-[#e8edf2] mt-6">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-[#0b462c] hover:bg-[#082a1b] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? 'SALVANDO...' : 'SALVAR INFORMAÇÕES'}
            </button>
         </div>
      </form>
    </div>
  );
}
