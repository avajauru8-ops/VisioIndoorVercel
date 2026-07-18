import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  MonitorPlay, 
  Tv, 
  Landmark, 
  FileText, 
  Newspaper, 
  Smartphone, 
  Search, 
  Mail, 
  Bell,
  Menu,
  X
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [sysSettings, setSysSettings] = useState<any>({
    nome_painel: 'VisioIndoor',
    logo_url: '',
    show_apk_banner: true,
    apk_banner_title: 'Player Android',
    apk_banner_desc: 'Baixe o APK para rodar suas playlists em TVs ou Totens.',
    apk_banner_btn_text: 'Instalar Player',
    apk_file_url: ''
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await apiFetch('/api/admin/settings');
        if (data) setSysSettings(data);
      } catch (err) {
        console.error('Erro ao carregar configurações no layout:', err);
      }
    };
    if (isAuthenticated) {
      loadSettings();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, category: 'MENU' },
    { name: 'Usuários & Licenças', path: '/admin/users', icon: Users, category: 'MENU' },
    { name: 'Totens Cadastrados', path: '/admin/totems', icon: Tv, category: 'MENU' },
    { name: 'Player Android', path: '/admin/integration', icon: Smartphone, category: 'MENU' },
    { name: 'Configurações', path: '/admin/settings', icon: Settings, category: 'GERAL' },
  ];

  const agencyLinks = [
    { name: 'Dashboard', path: '/agency', icon: LayoutDashboard, category: 'MENU' },
    { name: 'Minhas Telas', path: '/agency/totems', icon: Tv, category: 'MENU' },
    { name: 'Playlists', path: '/agency/playlists', icon: MonitorPlay, category: 'MENU' },
    { name: 'Utilizar Notícias', path: '/agency/news', icon: Newspaper, category: 'MENU' },
    { name: 'Mídia Kit Web', path: '/agency/media-kit', icon: Newspaper, category: 'MENU' },
    { name: 'Gerador de Contratos', path: '/agency/contracts', icon: FileText, category: 'MENU' },
    { name: 'Dados da Agência', path: '/agency/profile', icon: Landmark, category: 'GERAL' },
  ];

  const rawLinks = user?.nivel === 'admin' ? adminLinks : agencyLinks;

  // Group links by category
  const menuLinks = rawLinks.filter(link => link.category === 'MENU');
  const generalLinks = rawLinks.filter(link => link.category === 'GERAL');

  // Sidebar content component to dry up code
  const SidebarContent = () => (
    <>
      <div className="flex flex-col flex-1 min-h-0">
        {/* Brand Logo */}
        <div className="p-6 border-b border-[#e8edf2] flex items-center justify-between relative">
          <div className={cn("flex items-center gap-2", sysSettings.logo_url ? "mx-auto justify-center" : "")}>
            {sysSettings.logo_url ? (
              <img src={sysSettings.logo_url} alt="Logo" className="h-16 max-w-[180px] object-contain shrink-0" />
            ) : (
              <>
                <div className="w-8 h-8 rounded-full bg-emerald-50 border-2 border-emerald-600 flex items-center justify-center shadow-sm">
                  <div className="w-4 h-4 rounded-full border border-emerald-600 flex items-center justify-center font-bold text-[8px] text-[#0b462c]">
                    V
                  </div>
                </div>
                <div>
                  <h1 className="text-base font-extrabold tracking-tight text-[#0b462c] uppercase truncate max-w-[120px]">
                    {sysSettings.nome_painel || 'VISIOINDOOR'}
                  </h1>
                  <p className="text-[9px] text-[#8b9aa5] uppercase tracking-widest font-bold">
                    {user?.nivel === 'admin' ? 'Administrador' : 'Mídia Indoor'}
                  </p>
                </div>
              </>
            )}
          </div>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="lg:hidden absolute right-6 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto">
          {/* Category: MENU */}
          <div>
            <p className="px-3 text-[10px] font-bold text-[#8b9aa5] uppercase tracking-widest mb-3">Menu</p>
            <nav className="space-y-1">
              {menuLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || (link.path !== '/agency' && link.path !== '/admin' && location.pathname.startsWith(link.path + '/'));
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative",
                      isActive 
                        ? "bg-[#e8f5ed] text-[#0b462c] font-semibold" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-600 rounded-r" />
                    )}
                    <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          {/* Category: GERAL */}
          <div>
            <p className="px-3 text-[10px] font-bold text-[#8b9aa5] uppercase tracking-widest mb-3">Geral</p>
            <nav className="space-y-1">
              {generalLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer group relative",
                      isActive 
                        ? "bg-[#e8f5ed] text-[#0b462c] font-semibold" 
                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800"
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-600 rounded-r" />
                    )}
                    <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-zinc-400 group-hover:text-zinc-600")} />
                    <span className="text-sm">{link.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </div>

      {/* Sidebar Banner */}
      {sysSettings.show_apk_banner && (
        <div className="px-4 py-2 shrink-0 border-t border-[#e8edf2] bg-zinc-50/50">
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-br from-[#0b462c] to-[#082a1b] text-white text-xs relative overflow-hidden shadow-sm">
            <div className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-emerald-500/20 blur-lg"></div>
            <div className="relative z-10 space-y-2">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm">
                📲
              </div>
              <p className="font-bold text-white text-xs leading-tight">{sysSettings.apk_banner_title || 'Player Android'}</p>
              <p className="text-[10px] text-emerald-200/80 leading-normal">
                {sysSettings.apk_banner_desc || 'Baixe o APK para rodar suas playlists em TVs ou Totens.'}
              </p>
              {sysSettings.apk_file_url ? (
                <a 
                  href={sysSettings.apk_file_url} 
                  download="totemplayer.apk"
                  className="block text-center bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] uppercase py-2 rounded-xl transition-all shadow-sm"
                >
                  {sysSettings.apk_banner_btn_text || 'Instalar Player'}
                </a>
              ) : (
                <Link 
                  to="/admin/integration"
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="block text-center bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-[10px] uppercase py-2 rounded-xl transition-all shadow-sm"
                >
                  {sysSettings.apk_banner_btn_text || 'Instalar Player'}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="flex h-screen bg-[#f4f6f8] text-zinc-800 font-sans overflow-hidden">
      {/* Desktop Sidebar (visible only on lg screens and larger) */}
      <aside className="hidden lg:flex w-66 bg-white border-r border-[#e8edf2] flex-col justify-between shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile/Tablet Sidebar Drawer (visible on mobile, animated slide) */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-66 bg-white z-50 flex flex-col justify-between shadow-xl transition-transform duration-300 lg:hidden",
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <SidebarContent />
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white border-b border-[#e8edf2] flex items-center justify-between px-4 sm:px-8 shrink-0">
          
          <div className="flex items-center gap-3">
            {/* Hamburger Button (visible only on small screens) */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-zinc-50 border border-zinc-200 text-zinc-600 transition-colors"
              title="Abrir Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Left: Search Box */}
            <div className="relative w-40 sm:w-60 md:w-80">
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="w-4 h-4 text-zinc-400" />
              </span>
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full bg-[#f4f6f8] border border-zinc-200 rounded-full pl-9 pr-10 py-2 text-xs text-[#0b462c] placeholder-zinc-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-sans" 
              />
              <span className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 bg-white border border-zinc-200 rounded px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 shadow-sm pointer-none">
                ⌘ F
              </span>
            </div>
          </div>

          {/* Right: Quick actions, notifications and Profile */}
          <div className="flex items-center gap-2 sm:gap-6">
            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-50 border border-[#e8edf2] flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all relative">
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></span>
            </button>
            <button className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-zinc-50 border border-[#e8edf2] flex items-center justify-center text-zinc-500 hover:text-zinc-800 transition-all relative">
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-emerald-500 rounded-full"></span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-zinc-200" />

            {/* Profile Avatar Card */}
            <div className="flex items-center gap-1.5 sm:gap-3">
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-zinc-800 leading-none">{user?.nome}</p>
                <p className="text-[10px] text-zinc-400 mt-1 leading-none truncate max-w-[120px]">{user?.email}</p>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-emerald-500 to-[#0b462c] flex items-center justify-center text-xs font-extrabold text-white shadow-sm border border-emerald-100 relative shrink-0">
                {user?.nome.substring(0, 2).toUpperCase()}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </div>
              <button
                onClick={logout}
                className="p-1 sm:p-1.5 text-zinc-400 hover:text-rose-500 transition-all rounded-lg hover:bg-rose-50 shrink-0"
                title="Sair"
              >
                <LogOut className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Content Body Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
