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
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-500" />
          Configurações Globais
        </h2>
        <p className="text-sm text-gray-400 mt-1">Personalize a identidade visual do painel.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-gray-950 border border-gray-800 rounded-xl p-8 space-y-6">
         <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Nome do Sistema / Painel</label>
            <input 
              type="text" 
              required 
              value={settings.nome_painel || ''} 
              onChange={e => setSettings({...settings, nome_painel: e.target.value})} 
              className="w-full bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-white focus:ring-1 focus:ring-blue-500 outline-none transition-all" 
            />
         </div>

         <div className="pt-4 border-t border-gray-800">
            <label className="block text-sm font-medium text-gray-400 mb-3">Logomarca do Painel (Canto superior esquerdo)</label>
            <div className="flex items-center gap-6">
              <div className="w-32 h-16 rounded-lg bg-gray-900 border-2 border-dashed border-gray-700 flex items-center justify-center overflow-hidden shrink-0 relative group p-2">
                 {settings.logo_url || file ? (
                   <img src={file ? URL.createObjectURL(file) : settings.logo_url} alt="Logo" className="w-full h-full object-contain" />
                 ) : (
                   <UploadCloud className="w-6 h-6 text-gray-600" />
                 )}
                 <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <input type="file" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" />
                   <span className="text-xs font-medium text-white text-center">Trocar<br/>Logo</span>
                 </div>
              </div>
              <p className="text-xs text-gray-500 max-w-xs">
                 Recomendado: Formato horizontal, fundo transparente, altura máxima de 60px.
              </p>
            </div>
         </div>

         <div className="pt-6 flex justify-end">
           <button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
             {saving ? 'Salvando...' : 'Salvar Alterações'}
           </button>
         </div>
      </form>
    </div>
  );
}
