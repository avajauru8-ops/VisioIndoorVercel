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
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dados da Agência</h2>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Configure informações para contratos</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#111113] border border-zinc-800 rounded-xl p-8 space-y-6">
         
         <div className="flex items-center gap-6 pb-6 border-b border-zinc-800">
            <div className="w-24 h-24 rounded bg-[#09090b] border border-dashed border-zinc-700 flex items-center justify-center overflow-hidden shrink-0 relative group">
               {profile.logo_url || file ? (
                 <img src={file ? URL.createObjectURL(file) : profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
               ) : (
                 <UploadCloud className="w-8 h-8 text-zinc-700" />
               )}
               <div className="absolute inset-0 bg-[#111113]/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                 <span className="text-[10px] font-bold text-white uppercase tracking-widest">Alterar</span>
               </div>
            </div>
            <div>
               <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Logomarca</h3>
               <p className="text-[10px] font-mono text-zinc-500">Formato quadrado transparente (PNG)</p>
            </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome da Agência</label>
              <input type="text" name="nome" value={profile.nome || ''} onChange={handleChange} required className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">CPF ou CNPJ</label>
              <input type="text" name="cpf_cnpj" value={profile.cpf_cnpj || ''} onChange={handleChange} required className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none transition-all" />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Endereço Completo</label>
              <input type="text" name="endereco" value={profile.endereco || ''} onChange={handleChange} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidade Sede</label>
              <input type="text" name="cidade" value={profile.cidade || ''} onChange={handleChange} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Estado</label>
              <input type="text" name="estado" value={profile.estado || ''} onChange={handleChange} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">WhatsApp de Contato</label>
              <input type="text" name="whatsapp" value={profile.whatsapp || ''} onChange={handleChange} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm font-mono focus:border-indigo-500 outline-none transition-all" placeholder="Ex: (00) 00000-0000" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Cidades de Atuação</label>
              <input type="text" name="cidades_atuacao" value={profile.cidades_atuacao || ''} onChange={handleChange} className="w-full bg-[#09090b] border border-zinc-800 rounded px-4 py-2 text-white text-sm focus:border-indigo-500 outline-none transition-all" placeholder="Ex: São Paulo, Campinas" />
            </div>
         </div>

         <div className="pt-6 flex justify-end border-t border-zinc-800 mt-6">
           <button type="submit" disabled={saving} className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded text-[10px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
             {saving ? 'SALVANDO...' : 'SALVAR INFORMAÇÕES'}
           </button>
         </div>
      </form>
    </div>
  );
}
