import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Smartphone, Code, Copy, CheckCircle, UploadCloud, ToggleLeft, ToggleRight, FileDown } from 'lucide-react';

export default function AdminIntegration() {
  const [copied, setCopied] = useState(false);
  const [baseUrl, setBaseUrl] = useState('');
  
  // Settings State
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
  
  const [apkFile, setApkFile] = useState<File | null>(null);

  useEffect(() => {
    // Get the current origin (protocol + hostname + port if present)
    const origin = window.location.origin;
    setBaseUrl(`${origin}/api.php?device_id=`);

    const loadSettings = async () => {
      try {
        const data = await apiFetch('/api/admin/settings');
        if (data) setSettings(data);
      } catch (err) {
        console.error('Erro ao carregar configurações de integração:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(baseUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveBannerSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('nome_painel', settings.nome_painel || 'VisioIndoor');
      formData.append('show_apk_banner', String(settings.show_apk_banner));
      formData.append('apk_banner_title', settings.apk_banner_title || 'Player Android');
      formData.append('apk_banner_desc', settings.apk_banner_desc || 'Baixe o APK para rodar suas playlists em TVs ou Totens.');
      formData.append('apk_banner_btn_text', settings.apk_banner_btn_text || 'Instalar Player');
      
      if (settings.logo_url) {
        formData.append('logo_url', settings.logo_url);
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
      
      alert('Configurações do Player salvas com sucesso!');
      window.location.reload(); // Reload page to immediately reflect changes on sidebar
    } catch (err) {
      console.error(err);
      alert('Erro ao salvar configurações do Player.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="space-y-8 max-w-4xl pb-12">
      <header>
        <h1 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Gerenciamento do Player Android</h1>
        <p className="text-xs text-[#8b9aa5] font-medium mt-1">Configure o APK do totem, edite as informações do banner de download e gerencie a integração.</p>
      </header>

      {/* Seção 1: Configuração do Banner & Upload de APK */}
      <form onSubmit={handleSaveBannerSettings} className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#e8edf2] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-[#0b462c]">Banner de Download na Barra Lateral</h2>
              <p className="text-[10px] text-zinc-400 font-medium">Controle a exibição e os textos do cartão de download do APK.</p>
            </div>
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
          <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Título do Banner</label>
                <input 
                  type="text" 
                  required 
                  value={settings.apk_banner_title || ''} 
                  onChange={e => setSettings({...settings, apk_banner_title: e.target.value})} 
                  className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Texto do Botão</label>
                <input 
                  type="text" 
                  required 
                  value={settings.apk_banner_btn_text || ''} 
                  onChange={e => setSettings({...settings, apk_banner_btn_text: e.target.value})} 
                  className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all" 
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
                className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-zinc-800 text-sm focus:border-emerald-500 outline-none transition-all resize-none" 
              />
            </div>
          </div>
        )}

        <div className={`pt-4 ${settings.show_apk_banner ? 'border-t border-[#e8edf2]' : ''}`}>
          <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Arquivo APK do Player</label>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 bg-[#f4f6f8] border border-zinc-200 rounded-xl px-4 py-2.5 text-xs text-zinc-600 truncate font-mono h-11 flex items-center shadow-inner">
              {apkFile ? apkFile.name : (settings.apk_file_url ? 'totemplayer.apk (Salvo no servidor)' : 'Nenhum arquivo APK enviado')}
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
                className="px-5 h-11 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-zinc-600 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Novo APK
              </button>
            </div>
          </div>
          {settings.apk_file_url && (
            <p className="text-[10px] text-emerald-600 mt-2.5 font-medium flex items-center gap-1">
              <FileDown className="w-3.5 h-3.5" />
              <a href={settings.apk_file_url} download className="underline hover:text-emerald-700">Baixar APK atualmente instalado</a>
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-[#e8edf2] flex justify-end">
          <button 
            type="submit" 
            disabled={saving} 
            className="bg-[#0b462c] hover:bg-[#082a1b] text-white px-6 py-3 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 shadow-sm"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>

      {/* Seção 2: Detalhes de Integração API */}
      <div className="bg-white border border-[#e8edf2] rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-6 border-b border-[#e8edf2] flex items-center gap-4 bg-zinc-50/50">
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-[#0b462c]">Configuração de Integração</h2>
            <p className="text-xs text-zinc-400">Endpoints técnicos para o programador do totem.</p>
          </div>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider block">Endpoint Base (BASE_URL)</label>
            <div className="flex bg-[#f4f6f8] border border-zinc-200 rounded-xl p-1.5 items-center">
              <div className="flex-1 px-3 py-1.5 text-xs text-zinc-700 font-mono truncate overflow-x-auto flex items-center">
                {baseUrl}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0b462c] hover:bg-[#082a1b] text-white rounded-xl transition-all text-xs font-bold shadow-sm"
              >
                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>
            <p className="text-[10px] text-zinc-400 font-medium">
              O aplicativo irá adicionar o Android ID automaticamente no final da URL.
            </p>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Mapeamento de Variável Java:</h3>
            <div className="bg-[#f4f6f8] border border-zinc-200 rounded-xl p-4 font-mono text-xs overflow-x-auto relative group">
              <div className="text-zinc-700">
                <span className="text-emerald-700 font-bold">private</span> <span className="text-emerald-700 font-bold">static</span> <span className="text-emerald-700 font-bold">final</span> <span className="text-emerald-500 font-bold">String</span> BASE_URL = <span className="text-amber-600">"{baseUrl}"</span>;
              </div>
            </div>
            <p className="text-xs text-zinc-500">
              Substitua a variável <code className="bg-zinc-100 px-1.5 py-0.5 rounded text-emerald-700 font-mono font-bold">BASE_URL</code> na classe principal do projeto do Totem.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
