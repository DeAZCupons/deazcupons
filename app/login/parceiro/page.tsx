"use client";
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import Image from 'next/image';

export default function LoginParceiro() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError('E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    // Verificar se este usuário é de fato um parceiro
    const { data: partner } = await supabase
      .from('partners')
      .select('id')
      .eq('user_id', data.user.id)
      .single();

    if (!partner) {
      await supabase.auth.signOut();
      setError('Esta conta não está vinculada a um parceiro.');
      setLoading(false);
      return;
    }

    router.push('/dashboard/parceiro');
  }

  return (
    <div className="min-h-screen bg-[#F2F0EF] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-[#00B9F2] font-black text-3xl italic mb-2">DE AZ <span className="text-gray-800 uppercase not-italic text-xl tracking-tighter">Parceiros</span></h1>
          <p className="text-gray-500 text-sm">Acesse seu painel de gestão de cupons</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">E-mail Corporativo</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full p-3.5 pl-10 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B9F2] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full p-3.5 pl-10 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B9F2] transition-all"
                required
              />
            </div>
          </div>

          {error && (
            <p className="text-red-500 text-sm font-medium text-center">{error}</p>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#00B9F2] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#0092bf] transition-all shadow-lg shadow-[#00B9F2]/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : (
              <>Entrar no Painel <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-sm text-gray-500">Ainda não é um parceiro?</p>
          <button className="text-[#00B9F2] font-bold text-sm hover:underline mt-1">
            Cadastre sua empresa aqui
          </button>
        </div>
      </div>
    </div>
  );
}