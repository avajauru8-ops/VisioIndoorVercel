import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Users, 
  Tv, 
  Landmark, 
  ArrowUpRight, 
  Plus, 
  ShieldCheck, 
  AlertCircle,
  FileText,
  Smartphone
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface UserAccount {
  id: string;
  nome: string;
  email: string;
  nivel: 'admin' | 'agencia';
  status_licenca: 'ativa' | 'expirada';
  validade_licenca: string;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, totems: 0, activeLicences: 0 });
  const [recentUsers, setRecentUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, totems] = await Promise.all([
          apiFetch('/api/admin/users'),
          apiFetch('/api/totems') // Admin sees all
        ]);
        
        const activeLicences = users.filter((u: any) => u.status_licenca === 'ativa').length;
        
        setStats({ 
          users: users.length, 
          totems: totems.length,
          activeLicences
        });
        
        setRecentUsers(users.slice(0, 4));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Administração Global</h2>
          <p className="text-xs text-[#8b9aa5] font-medium mt-1">
            Controle de usuários, licenças ativas e monitoramento geral do VisioIndoor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/users" 
            className="px-4 py-2.5 rounded-full bg-[#0b462c] hover:bg-[#082a1b] text-xs font-bold text-white transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Novo Usuário / Agência
          </Link>
        </div>
      </div>

      {/* Metrics Row (4 Columns matching style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1: Total de Usuários/Agências (Dark green card) */}
        <Link to="/admin/users" className="bg-[#0b462c] text-white p-6 rounded-[24px] relative overflow-hidden shadow-md flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300 block">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200">Clientes & Agências</span>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">{stats.users}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/20 text-emerald-200">
                Ativos
              </span>
              <span className="text-[10px] text-emerald-200/70">Contas administradas</span>
            </div>
          </div>
        </Link>

        {/* Card 2: Totens Totais */}
        <Link to="/admin/totems" className="bg-white border border-[#e8edf2] p-6 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300 block">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8b9aa5]">Totens Globais</span>
            <span className="w-8 h-8 rounded-full bg-[#f4f6f8] flex items-center justify-center text-[#0b462c] text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-[#0b462c]">{stats.totems}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#e8f5ed] text-emerald-600">
                Monitorados
              </span>
              <span className="text-[10px] text-[#8b9aa5]">Telas registradas no app</span>
            </div>
          </div>
        </Link>

        {/* Card 3: Licenças Ativas */}
        <Link to="/admin/users" className="bg-white border border-[#e8edf2] p-6 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300 block">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8b9aa5]">Licenças Ativas</span>
            <span className="w-8 h-8 rounded-full bg-[#f4f6f8] flex items-center justify-center text-[#0b462c] text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-zinc-800">{stats.activeLicences}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#eef2f6] text-emerald-600">
                {stats.users > 0 ? Math.round((stats.activeLicences / stats.users) * 100) : 100}% taxa de ativação
              </span>
              <span className="text-[10px] text-[#8b9aa5]">Em conformidade</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Admin Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent users list (Left col-span-2) */}
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm min-h-[300px] lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Últimos Clientes / Agências</h4>
              <Link 
                to="/admin/users" 
                className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100"
              >
                Ver todos
              </Link>
            </div>
            <p className="text-[10px] text-[#8b9aa5] mt-1 font-medium">Contas criadas recentemente no sistema</p>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[220px] justify-center flex flex-col">
            {recentUsers.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-50 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#e8f5ed] text-[#0b462c] text-xs font-bold flex items-center justify-center">
                    {client.nome.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-700">{client.nome}</p>
                    <p className="text-[10px] text-[#8b9aa5] leading-none mt-0.5">{client.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold ${
                    client.status_licenca === 'ativa' ? 'bg-[#e8f5ed] text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {client.status_licenca === 'ativa' ? 'Licença Ativa' : 'Expirada'}
                  </span>
                  <span className="text-[9px] font-bold text-zinc-400">
                    Validade: {new Date(client.validade_licenca).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
            ))}
            {recentUsers.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-8 text-zinc-400">
                <AlertCircle className="w-7 h-7 mb-1.5 opacity-40 text-[#8b9aa5]" />
                <p className="text-[11px]">Nenhum cliente cadastrado.</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick actions panel (Right col) */}
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm min-h-[300px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Ações Administrativas</h4>
            <p className="text-[10px] text-[#8b9aa5] mt-1 font-medium">Acesso rápido aos módulos de administração</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center my-4">
            <Link 
              to="/admin/users" 
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all text-zinc-700 hover:text-[#0b462c]"
            >
              <Users className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-xs font-bold">Gerenciar Licenças</p>
                <p className="text-[9px] text-[#8b9aa5]">Alterar prazos e status de contas</p>
              </div>
            </Link>

            <Link 
              to="/admin/integration" 
              className="flex items-center gap-3 p-3 rounded-xl border border-zinc-100 hover:border-emerald-100 hover:bg-emerald-50/20 transition-all text-zinc-700 hover:text-[#0b462c]"
            >
              <Smartphone className="w-5 h-5 text-emerald-600" />
              <div className="text-left">
                <p className="text-xs font-bold">Player Android</p>
                <p className="text-[9px] text-[#8b9aa5]">Gerenciar APK, banner e integração</p>
              </div>
            </Link>
          </div>

          <Link 
            to="/admin/settings" 
            className="w-full bg-[#0b462c] hover:bg-[#082a1b] text-white text-xs font-bold text-center py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Configurações Gerais
          </Link>
        </div>
      </div>
    </div>
  );
}
