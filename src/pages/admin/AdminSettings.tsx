import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Settings, UploadCloud, FileDown, ToggleLeft, ToggleRight } from 'lucide-react';

export default function AdminSettings() {
  const [settings, setSettings] = useState<any>({
    nome_painel: 'VisioIndoor',
    logo_url: '',
    show_apk_banner: true,
    apk_banner_title: 'Player Android',
    apk_banner_desc: 'Baixe o APK para rodar suas playlists em TVs ou Totens.',
    apk_banner_btn_text: 'Instalar Player',
    apk_file_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [file, setFile] = useState<File | null>(null);
  const [apkFile, setApkFile] = useState<File | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch('/api/admin/settings');
        if (data) setSettings(data);
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
      formData.append('nome_painel', settings.nome_painel || 'VisioIndoor');
      formData.append('show_apk_banner', String(settings.show_apk_banner));
      formData.append('apk_banner_title', settings.apk_banner_title || 'Player Android');
      formData.append('apk_banner_desc', settings.apk_banner_desc || 'Baixe o APK para rodar suas playlists em TVs ou Totens.');
      formData.append('apk_banner_btn_text', settings.apk_banner_btn_text || 'Instalar Player');
      
      if (file) {
        formData.append('logo', file);
      } else {
        formData.append('logo_url', settings.logo_url || '');
      }

      if (apkFile) {
        formData.append('apk', apkFile);
      } else if (settings.apk_file_url) {
        formData.append('apk_file_url', settings.apk_file_url);
      }

      await apiFetch('/api/admin/settings', {
        method: 'PUT',
        body: formData,
      });
      alert('Configurações salvas com sucesso!');
      window.location.reload(); // Reload to refresh layout sidebar state immediately
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar as configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-emerald-600" />
          Configurações Globais
        </h2>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">
          Personalize a identidade visual e controle as informações do aplicativo totem no painel.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-[#e8edf2] rounded-[24px] p-8 space-y-6 shadow-sm">
         {/* Seção 1: Identidade */}
         <div className="space-y-4">
            <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider">Identidade do Painel</h3>
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

            <div>
               <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Logomarca do Painel (Canto superior esquerdo)</label>
               <div className="flex items-center gap-6">
                  <div className="w-32 h-16 rounded-xl bg-zinc-50 border-2 border-dashed border-zinc-200 flex items-center justify-center overflow-hidden shrink-0 relative group p-2 shadow-inner">
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
                  <div>
                     {(settings.logo_url || file) && (
                       <button
                         type="button"
                         onClick={() => {
                           setSettings({ ...settings, logo_url: '' });
                           setFile(null);
                         }}
                         className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors uppercase tracking-wider mb-2 block"
                       >
                         Remover Logomarca
                       </button>
                     )}
                     <p className="text-xs text-zinc-400 font-medium max-w-xs">
                        Recomendado: Formato horizontal, fundo transparente, altura máxima de 60px.
                     </p>
                  </div>
               </div>
            </div>
         </div>

         {/* Seção 2: Banner do APK */}
         <div className="pt-6 border-t border-[#e8edf2] space-y-6">
            <div className="flex items-center justify-between">
               <div>
                  <h3 className="text-[#0b462c] text-xs font-bold uppercase tracking-wider">Banner do Player Android</h3>
                  <p className="text-[10px] text-zinc-400 font-medium mt-0.5">Controle a exibição do cartão de download do APK na barra lateral.</p>
               </div>
               <button 
                 type="button"
                 onClick={() => setSettings({...settings, show_apk_banner: !settings.show_apk_banner})}
                 className="p-1 rounded-lg text-zinc-500 hover:text-zinc-800 transition-colors"
               >
                  {settings.show_apk_banner ? (
                    <ToggleRight className="w-10 h-10 text-emerald-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-zinc-300" />
                  )}
               </button>
            </div>

            {settings.show_apk_banner && (
               <div className="space-y-4 border border-[#e8edf2] p-6 rounded-2xl bg-zinc-50/50 animate-in fade-in slide-in-from-top-4 duration-250">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Título do Banner</label>
                        <input 
                          type="text" 
                          required 
                          value={settings.apk_banner_title || ''} 
                          onChange={e => setSettings({...settings, apk_banner_title: e.target.value})} 
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
                        />
                     </div>
                     <div>
                        <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Texto do Botão</label>
                        <input 
                          type="text" 
                          required 
                          value={settings.apk_banner_btn_text || ''} 
                          onChange={e => setSettings({...settings, apk_banner_btn_text: e.target.value})} 
                          className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
                        />
                     </div>
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Descrição do Banner</label>
                     <textarea 
                       required 
                       value={settings.apk_banner_desc || ''} 
                       onChange={e => setSettings({...settings, apk_banner_desc: e.target.value})} 
                       rows={2}
                       className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all resize-none" 
                     />
                  </div>

                  <div>
                     <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Arquivo APK do Player</label>
                     <div className="flex items-center gap-4">
                        <div className="flex-1 bg-white border border-zinc-200 rounded-xl px-4 py-2 text-xs text-zinc-600 truncate font-mono h-10 flex items-center relative">
                           {apkFile ? apkFile.name : (settings.apk_file_url ? 'totemplayer.apk (Arquivo no servidor)' : 'Nenhum APK enviado')}
                        </div>
                        <div className="relative shrink-0">
                           <input 
                             type="file" 
                             onChange={e => setApkFile(e.target.files?.[0] || null)} 
                             className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                             accept=".apk" 
                           />
                           <button 
                             type="button" 
                             className="px-4 h-10 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                           >
                              <UploadCloud className="w-4 h-4" />
                              Selecionar APK
                           </button>
                        </div>
                     </div>
                     {settings.apk_file_url && (
                        <p className="text-[10px] text-emerald-600 mt-2 font-medium flex items-center gap-1">
                           <FileDown className="w-3.5 h-3.5" />
                           <a href={settings.apk_file_url} download className="underline hover:text-emerald-700">Baixar APK atual</a>
                        </p>
                     )}
                  </div>
               </div>
            )}
         </div>

         {/* Submissão */}
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
