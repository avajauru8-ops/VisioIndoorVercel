import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Settings, UploadCloud } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch('/api/admin/settings');
        setSettings(data || { nome_painel: 'VisioIndor' });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('nome_painel', settings.nome_painel);
      if (file) {
        formData.append('logo', file);
      } else if (settings.logo_url) {
        formData.append('logo_url', settings.logo_url);
      }

      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: formData,
      });
      alert('Configurações salvas!');
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Configurações Globais
        </h2>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Personalize a identidade visual do painel.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e8edf2] rounded-[24px] p-8 space-y-6 shadow-sm">
         <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Nome do Sistema / Painel</label>
            <input 
              type="text" 
              required 
              value={settings.nome_painel || ''} 
              onChange={e => setSettings({...settings, nome_painel: e.target.value})} 
              className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
            />
         </div>

         <div className="pt-4 border-t border-[#e8edf2]">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Logomarca do Painel (Canto superior esquerdo)</label>
            <div className="flex items-center gap-6">
               <div className="w-32 h-16 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 relative group p-2">
                  {settings.logo_url || file ? (
                    <img src={file ? URL.createObjectURL(file) : settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-zinc-300" />
                  )}
                  <div className="absolute inset-0 bg-[#0b462c]/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer">
                    <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                    <span className="text-[10px] font-bold text-white text-center uppercase tracking-widest">Trocar<br/>Logo</span>
                  </div>
               </div>
               <p className="text-xs text-zinc-400 font-medium max-w-xs">
                  Recomendado: Formato horizontal, fundo transparente, altura máxima de 60px.
               </p>
            </div>
         </div>

         <div className="pt-6 flex justify-end border-t border-[#e8edf2]">
            <button 
              type="submit" 
              disabled={saving} 
              className="bg-[#0b462c] hover:bg-[#082a1b] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
            >
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
         </div>
      </form>
    </div>
  );
}
