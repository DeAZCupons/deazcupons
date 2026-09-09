'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { ShieldCheck, Lock, User, IdCard, MapPin, Phone } from 'lucide-react'

function FormConfirmacao() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  
  const email = searchParams.get('email') || ''
  const nomeUrl = searchParams.get('nome') || ''

  const [formData, setFormData] = useState({
    nome: nomeUrl,
    whatsapp: '',
    cpf: '',
    address: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Chama a API para criar/atualizar no banco e no Auth (Server Side)
      const response = await fetch('/api/b2c/finalize', { // Removi o /api duplicado
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.nome,
          email: email,
          whatsapp: formData.whatsapp,
          cpf: formData.cpf,
          address: formData.address,
          password: formData.password,
        }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Falha ao processar cadastro');
      }

      // --- O PULO DO GATO ESTÁ AQUI ---
      // 2. Agora que o usuário existe, fazemos o Login no navegador
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email: email,
        password: formData.password,
      });

      if (loginError) throw loginError;

      toast.success('Perfil ativado! Entrando na vitrine...');
      
      // 3. Agora sim, com a sessão ativa, o redirecionamento vai funcionar
      setTimeout(() => {
        router.push('/vitrine');
      }, 1000);

    } catch (error: any) {
      console.error("Erro:", error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-10 p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-[#00B9F2]/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="text-[#00B9F2]" size={32} />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Finalize seu Perfil</h2>
        <p className="text-slate-500 text-sm mt-2">Confirme seus dados para acessar seus cupons.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Adicionei o campo de Nome para ele poder conferir/editar */}
        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={18} />
            <input required value={formData.nome} className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, nome: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">CPF</label>
          <div className="relative">
            <IdCard className="absolute left-3 top-3 text-slate-400" size={18} />
            <input required placeholder="000.000.000-00" className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, cpf: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">WhatsApp</label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 text-slate-400" size={18} />
            <input required placeholder="(00) 00000-0000" className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Endereço Completo</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
            <input required placeholder="Rua, Número, Bairro, Cidade" className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Crie uma Senha de Acesso</label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
            <input type="password" required className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2]" 
              onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
        </div>

        <button 
          type="submit"
          disabled={loading || !email} 
          className="w-full py-4 bg-[#00B9F2] text-white rounded-xl font-bold hover:bg-[#009dc2] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Processando...
            </>
          ) : (
            'Ativar meus Cupons'
          )}
        </button>
        
        {!email && <p className="text-red-500 text-xs text-center">Link inválido. Acesse através do e-mail recebido.</p>}
      </form>
    </div>
  )
}

export default function Page() {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <Suspense fallback={<div>Carregando...</div>}>
        <FormConfirmacao />
      </Suspense>
    </div>
  )
}
