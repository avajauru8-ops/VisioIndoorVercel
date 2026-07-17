import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, senha }),
      });
      login(data.token, data.user);
      navigate(data.user.nivel === 'admin' ? '/admin' : '/agency');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4 font-sans text-zinc-100">
      <div className="max-w-md w-full bg-[#111113] p-10 rounded-xl border border-zinc-800 shadow-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-600 rounded flex items-center justify-center font-bold text-white italic text-xl">V</div>
            <h1 className="text-2xl font-bold tracking-tight text-white">VISIO<span className="text-indigo-400">INDOR</span></h1>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Acesse sua conta</p>
        </div>
        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-3 rounded text-xs font-mono text-center">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full rounded bg-[#09090b] border border-zinc-800 text-white px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Senha</label>
              <input
                type="password"
                required
                className="w-full rounded bg-[#09090b] border border-zinc-800 text-white px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-mono"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider py-3 px-4 rounded transition-all disabled:opacity-50"
          >
            {loading ? 'AUTENTICANDO...' : 'ENTRAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
