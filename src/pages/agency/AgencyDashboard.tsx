import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Tv, MonitorPlay, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ online: 0, offline: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const totems = await apiFetch('/api/totems');
        let online = 0;
        let offline = 0;
        totems.forEach((t: any) => {
          if (t.status === 'online') online++;
          else offline++;
        });
        setStats({ online, offline, total: totems.length });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const pieData = [
    { name: 'Online', value: stats.online, color: '#10b981' },
    { name: 'Offline', value: stats.offline, color: '#f43f5e' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Dashboard da Agência</h2>
          <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Resumo das suas telas e mídias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Stats Card */}
         <div className="col-span-1 bg-[#111113] border border-zinc-800 rounded-xl p-6 flex flex-col">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Saúde das Telas</h3>
            <div className="h-48 mt-4">
               {stats.total > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={50}
                       outerRadius={70}
                       paddingAngle={5}
                       dataKey="value"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                     </Pie>
                     <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#111113', border: '1px solid #27272a', borderRadius: '4px', fontSize: '10px', fontFamily: 'monospace' }}
                        itemStyle={{ color: '#e5e7eb' }}
                     />
                   </PieChart>
                 </ResponsiveContainer>
               ) : (
                 <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                    <p className="text-xs">Nenhuma tela cadastrada</p>
                 </div>
               )}
            </div>
            
            <div className="mt-auto space-y-1">
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"></span><span className="text-[10px] font-mono text-zinc-400">Online ({stats.online})</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 bg-rose-500 rounded-full"></span><span className="text-[10px] font-mono text-zinc-400">Offline ({stats.offline})</span></div>
            </div>
         </div>

         {/* Quick Links */}
         <div className="col-span-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
             <Link to="/agency/totems" className="bg-[#111113] border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all flex flex-col justify-between">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Minhas Telas</h3>
                <div className="mt-4">
                  <p className="text-3xl font-mono font-bold text-white tracking-tight">{stats.total}</p>
                  <p className="text-[10px] text-zinc-500 mt-1 italic font-serif">Totens cadastrados</p>
                </div>
             </Link>

             <Link to="/agency/playlists" className="bg-[#111113] border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all flex flex-col justify-between">
                <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Gerenciar Playlists</h3>
                <div className="mt-4 flex items-center justify-center h-[52px]">
                  <MonitorPlay className="w-8 h-8 text-indigo-400" />
                </div>
             </Link>
         </div>
      </div>
    </div>
  );
}
