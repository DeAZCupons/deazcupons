// app/confirmar/form-confirmacao.tsx
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShieldCheck, User, Phone, IdCard, MapPin, Lock } from 'lucide-react';

export function FormConfirmacao() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get('email') || '';
  
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    phone: '',
    cpf: '',
    address: '',
    password: '', // Para criar a conta no Supabase Auth
  });

  // Buscar nome se já tiver no lead
  useEffect(() => {
    // Aqui poderíamos fazer um fetch inicial para buscar o nome pelo e-mail
  }, [email]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/b2c/finalize-registration', {
        method: 'POST',
        body: JSON.stringify({ ...formData, email }),
      });

      if (res.ok) {
        toast.success('Perfil criado com sucesso!');
        router.push('/vitrine'); // Redireciona para os cupons
      } else {
        const error = await res.json();
        toast.error(error.message || 'Erro ao finalizar cadastro');
      }
    } catch (err) {
      toast.error('Erro de conexão.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required 
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, nome: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required 
              placeholder="(00) 00000-0000"
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-semibold text-slate-700">CPF</label>
          <div className="relative">
            <IdCard className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required 
              placeholder="000.000.000-00"
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, cpf: e.target.value})}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Endereço Completo</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              required 
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, address: e.target.value})}
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-sm font-semibold text-slate-700">Crie uma Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input 
              type="password"
              required 
              className="w-full pl-10 pr-4 py-2 border rounded-lg outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, password: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg flex gap-3 items-center border border-blue-100">
        <ShieldCheck className="text-[#00B9F2]" size={24} />
        <p className="text-xs text-slate-600">
          Seus dados estão protegidos por criptografia de ponta a ponta conforme a LGPD.
        </p>
      </div>

      <button 
        disabled={loading}
        className="w-full py-4 bg-[#00B9F2] text-white rounded-xl font-bold hover:bg-[#009dc2] transition-all"
      >
        {loading ? 'Processando...' : 'Finalizar e Ver Cupons'}
      </button>
    </form>
  );
}