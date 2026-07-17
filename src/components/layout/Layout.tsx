import React from 'react';
import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Users, Settings, LogOut, MonitorPlay, Tv, Landmark, FileText, Newspaper, Smartphone } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Usuários & Licenças', path: '/admin/users', icon: Users },
    { name: 'Configurações', path: '/admin/settings', icon: Settings },
    { name: 'Integração App', path: '/admin/integration', icon: Smartphone },
  ];

  const agencyLinks = [
    { name: 'Dashboard', path: '/agency', icon: LayoutDashboard },
    { name: 'Minhas Telas', path: '/agency/totems', icon: Tv },
    { name: 'Playlists', path: '/agency/playlists', icon: MonitorPlay },
    { name: 'Utilizar Notícias', path: '/agency/news', icon: Newspaper },
    { name: 'Dados da Agência', path: '/agency/profile', icon: Landmark },
    { name: 'Mídia Kit Web', path: '/agency/media-kit', icon: Newspaper },
    { name: 'Gerador de Contratos', path: '/agency/contracts', icon: FileText },
  ];

  const links = user?.nivel === 'admin' ? adminLinks : agencyLinks;

  return (
    <div className="flex h-screen bg-[#09090b] text-zinc-100 font-sans overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#111113] border-r border-zinc-800 flex flex-col">
        <div className="p-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center font-bold text-white italic">V</div>
            <h1 className="text-xl font-bold tracking-tight text-white">VISIO<span className="text-indigo-400">INDOR</span></h1>
          </div>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest">{user?.nivel === 'admin' ? 'Administrador' : 'SaaS Mídia Indoor'}</p>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path || location.pathname.startsWith(link.path + '/');
            return (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer",
                  isActive 
                    ? "bg-zinc-800 text-white" 
                    : "text-zinc-400 hover:bg-zinc-800/50"
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{link.name}</span>
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center text-xs font-bold text-white">
                  {user?.nome.charAt(0)}
               </div>
               <div className="overflow-hidden">
                 <p className="text-xs font-bold text-white truncate">{user?.nome}</p>
                 <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
               </div>
            </div>
            <button
              onClick={logout}
              className="p-2 text-zinc-500 hover:text-rose-400 transition-colors"
              title="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-zinc-800 bg-[#111113] flex items-center justify-between px-8">
           <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {links.find(l => location.pathname === l.path)?.name || 'VisioIndor'}
           </h2>
           <div className="flex items-center gap-4">
              <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-3 py-1 rounded-full border border-emerald-500/20">
                 LICENÇA ATIVA
              </span>
           </div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
