import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Cell, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie
} from 'recharts';
import { 
  Tv, 
  MonitorPlay, 
  AlertCircle, 
  CheckCircle2, 
  ArrowUpRight, 
  Plus, 
  Play, 
  Pause, 
  Clock,
  Sparkles
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface Totem {
  id: number;
  nome: string;
  device_id: string;
  status: 'online' | 'offline';
  ultima_sincronizacao: string | null;
}

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [totems, setTotems] = useState<Totem[]>([]);
  const [playlistsCount, setPlaylistsCount] = useState(0);
  const [stats, setStats] = useState({ online: 0, offline: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  
  // Time Tracker State
  const [time, setTime] = useState(new Date());
  const [isRunning, setIsRunning] = useState(true);

  // Load dashboard data
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [totemsData, playlistsData] = await Promise.all([
          apiFetch('/api/totems'),
          apiFetch('/api/playlists')
        ]);
        
        setTotems(totemsData);
        setPlaylistsCount(playlistsData.length);
        
        let online = 0;
        let offline = 0;
        totemsData.forEach((t: any) => {
          if (t.status === 'online') online++;
          else offline++;
        });
        setStats({ online, offline, total: totemsData.length });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  // Clock tick effect
  useEffect(() => {
    if (!isRunning) return;
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning]);

  // Format clock
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  // Calculated network health percentage
  const networkHealth = stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 100;

  // Pie chart data for Health gauge
  const healthPieData = [
    { name: 'Online', value: stats.online || 1, color: '#10b981' },
    { name: 'Offline', value: stats.offline, color: '#f3f4f6' }
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-[#0b462c] tracking-tight">Dashboard da Agência</h2>
          <p className="text-xs text-[#8b9aa5] font-medium mt-1">
            Gerencie, priorize e acompanhe suas telas com inteligência.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/agency/playlists" 
            className="px-4 py-2.5 rounded-full bg-white border border-[#e8edf2] text-xs font-bold text-[#0b462c] hover:bg-zinc-50 transition-all flex items-center gap-2 shadow-sm"
          >
            Configurar Playlists
          </Link>
          <Link 
            to="/agency/totems" 
            className="px-4 py-2.5 rounded-full bg-[#0b462c] hover:bg-[#082a1b] text-xs font-bold text-white transition-all flex items-center gap-2 shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" /> Cadastrar Tela
          </Link>
        </div>
      </div>

      {/* Metrics Row (4 Columns matching reference style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total de Telas (Dark Green theme) */}
        <div className="bg-[#0b462c] text-white p-6 rounded-[24px] relative overflow-hidden shadow-md flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-emerald-500/10 blur-xl"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-200">Total de Telas</span>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight">{stats.total}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-emerald-500/20 text-emerald-200">
                ★ Ativas
              </span>
              <span className="text-[10px] text-emerald-200/70">Disponíveis na rede</span>
            </div>
          </div>
        </div>

        {/* Card 2: Telas Online */}
        <div className="bg-white border border-[#e8edf2] p-6 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8b9aa5]">Telas Online</span>
            <span className="w-8 h-8 rounded-full bg-[#f4f6f8] flex items-center justify-center text-[#0b462c] text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-[#0b462c]">{stats.online}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#e8f5ed] text-emerald-600">
                {(stats.total > 0 ? Math.round((stats.online / stats.total) * 100) : 100)}% online
              </span>
              <span className="text-[10px] text-[#8b9aa5]">Em tempo real</span>
            </div>
          </div>
        </div>

        {/* Card 3: Telas Offline */}
        <div className="bg-white border border-[#e8edf2] p-6 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8b9aa5]">Telas Offline</span>
            <span className="w-8 h-8 rounded-full bg-[#f4f6f8] flex items-center justify-center text-[#0b462c] text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-zinc-800">{stats.offline}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold ${stats.offline > 0 ? 'bg-rose-50 text-rose-600' : 'bg-[#e8f5ed] text-emerald-600'}`}>
                {stats.offline > 0 ? 'Atenção necessária' : 'Tudo perfeito'}
              </span>
              <span className="text-[10px] text-[#8b9aa5]">Sem sincronizar</span>
            </div>
          </div>
        </div>

        {/* Card 4: Playlists Ativas */}
        <div className="bg-white border border-[#e8edf2] p-6 rounded-[24px] shadow-sm flex flex-col justify-between min-h-[140px] group hover:-translate-y-1 transition-all duration-300">
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#8b9aa5]">Playlists</span>
            <span className="w-8 h-8 rounded-full bg-[#f4f6f8] flex items-center justify-center text-[#0b462c] text-xs">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-zinc-800">{playlistsCount}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-semibold bg-[#eef2f6] text-zinc-600">
                Ativas
              </span>
              <span className="text-[10px] text-[#8b9aa5]">Arquivos rodando</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Analytical Cards (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reminders / Status Updates */}
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div>
            <h4 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Lembretes & Alertas</h4>
            <p className="text-[10px] text-[#8b9aa5] mt-1">Notificações e ações importantes do sistema</p>
          </div>

          <div className="my-6 space-y-4">
            <div className="p-4 rounded-2xl bg-[#fcfdfe] border border-[#e8edf2] flex items-start gap-3">
              <span className="w-2 h-2 mt-1.5 bg-emerald-500 rounded-full shrink-0"></span>
              <div>
                <p className="text-xs font-bold text-[#0b462c]">Sincronização OK</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Todas as playlists ativas foram transmitidas com sucesso.</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#fffaf5] border border-[#ffe8d6] flex items-start gap-3">
              <span className="w-2 h-2 mt-1.5 bg-amber-500 rounded-full shrink-0"></span>
              <div>
                <p className="text-xs font-bold text-amber-800">Próximos Vencimentos</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Renove as licenças dos totens da agência até o próximo mês.</p>
              </div>
            </div>
          </div>

          <Link 
            to="/agency/playlists" 
            className="w-full bg-[#0b462c] hover:bg-[#082a1b] text-white text-xs font-bold text-center py-3 px-4 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2"
          >
            <Clock className="w-4 h-4" /> Atualizar Conteúdos
          </Link>
        </div>

        {/* Recent Telas / Totens list */}
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Telas Recentes</h4>
              <p className="text-[10px] text-[#8b9aa5] mt-1">Conexão recente dos totens</p>
            </div>
            <Link 
              to="/agency/totems" 
              className="text-[10px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-100"
            >
              + Ver todas
            </Link>
          </div>

          <div className="mt-4 space-y-3 flex-1 overflow-y-auto max-h-[190px] pr-1">
            {totems.slice(0, 3).map((totem) => (
              <div key={totem.id} className="flex items-center justify-between p-3 rounded-xl border border-zinc-50 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${totem.status === 'online' ? 'bg-[#e8f5ed] text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    <Tv className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-700">{totem.nome}</p>
                    <p className="text-[9px] text-[#8b9aa5] font-mono leading-none mt-0.5">{totem.device_id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${totem.status === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-400'}`}></span>
                  <span className="text-[9px] font-bold uppercase text-zinc-400">{totem.status}</span>
                </div>
              </div>
            ))}
            {totems.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center py-8 text-zinc-400">
                <AlertCircle className="w-7 h-7 mb-1.5 opacity-40 text-[#8b9aa5]" />
                <p className="text-[11px]">Nenhuma tela cadastrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Gauge (Network health) */}
        <div className="bg-white border border-[#e8edf2] rounded-[24px] p-6 shadow-sm min-h-[280px] flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-extrabold text-[#0b462c] uppercase tracking-wider">Saúde da Rede</h4>
            <p className="text-[10px] text-[#8b9aa5] mt-1">Percentual de conexão geral dos totens</p>
          </div>

          <div className="relative h-28 my-2 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={healthPieData}
                  cx="50%"
                  cy="90%"
                  startAngle={180}
                  endAngle={0}
                  innerRadius={60}
                  outerRadius={75}
                  paddingAngle={0}
                  dataKey="value"
                >
                  {healthPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-1 text-center">
              <span className="text-3xl font-extrabold text-[#0b462c]">{networkHealth}%</span>
              <p className="text-[9px] font-bold text-[#8b9aa5] uppercase tracking-widest leading-none mt-1">Conectado</p>
            </div>
          </div>

          {/* Legend */}
          <div className="flex justify-center items-center gap-6 mt-2 text-[10px] font-bold text-zinc-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
              <span>Online ({stats.online})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-zinc-200 rounded-full"></span>
              <span>Offline ({stats.offline})</span>
            </div>
          </div>
        </div>

        {/* Time Tracker Widget */}
        <div className="bg-gradient-to-br from-[#0b462c] to-[#082a1b] text-white rounded-[24px] p-6 shadow-md min-h-[280px] flex flex-col justify-between relative overflow-hidden group">
          {/* Waves and decorative grid */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200 via-transparent to-transparent pointer-events-none"></div>
          
          <div className="flex justify-between items-start relative z-10">
            <div>
              <h4 className="text-sm font-extrabold uppercase tracking-widest text-emerald-200">Tempo de Atividade</h4>
              <p className="text-[10px] text-emerald-300 mt-1">Monitoramento de transmissão</p>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs">
              <Sparkles className="w-4 h-4 text-emerald-200" />
            </span>
          </div>

          {/* Time display */}
          <div className="text-center my-4 relative z-10">
            <span className="text-4xl font-extrabold font-mono tracking-tight text-white">{formatTime(time)}</span>
            <div className="flex items-center justify-center gap-1 mt-1 text-[10px] text-emerald-300">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              <span>Servidor Ativo</span>
            </div>
          </div>

          {/* Controller buttons */}
          <div className="flex items-center justify-center gap-4 relative z-10">
            <button 
              onClick={() => setIsRunning(!isRunning)}
              className="w-10 h-10 rounded-full bg-white text-[#0b462c] hover:bg-emerald-100 transition-all flex items-center justify-center shadow-md cursor-pointer active:scale-95"
              title={isRunning ? "Pausar" : "Iniciar"}
            >
              {isRunning ? <Pause className="w-4.5 h-4.5 fill-current" /> : <Play className="w-4.5 h-4.5 fill-current ml-0.5" />}
            </button>
            <button 
              onClick={() => setTime(new Date())}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-all flex items-center justify-center text-white cursor-pointer active:scale-95"
              title="Resetar"
            >
              <Clock className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
