import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Tv, Landmark } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ users: 0, totems: 0 });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [users, totems] = await Promise.all([
          apiFetch('/api/admin/users'),
          apiFetch('/api/totems') // Admin sees all
        ]);
        setStats({ users: users.length, totems: totems.length });
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Administração Global</h2>
        <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Visão geral do sistema VISIOINDOR</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <Link to="/admin/users" className="bg-[#111113] border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all flex flex-col justify-between">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Usuários / Agências</h3>
            <div className="mt-4">
              <p className="text-3xl font-mono font-bold text-indigo-400">{stats.users}</p>
              <p className="text-[10px] text-zinc-500 mt-1 italic font-serif">Cadastros ativos no sistema</p>
            </div>
         </Link>

         <div className="bg-[#111113] border border-zinc-800 p-6 rounded-xl flex flex-col justify-between">
            <h3 className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Totens Registrados</h3>
            <div className="mt-4">
              <p className="text-3xl font-mono font-bold text-white">{stats.totems}</p>
              <p className="text-[10px] text-zinc-500 mt-1 italic font-serif">Globalmente em todas agências</p>
            </div>
         </div>
      </div>
    </div>
  );
}
