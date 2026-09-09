'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase' // Certifique-se que este caminho está correto
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Mail, Lock, Tag, ArrowRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function UserLogin() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Realiza o login no Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) throw error

      const user = data.user

      // --- INÍCIO DA LÓGICA DE REDIRECIONAMENTO ---

      // A. Verificar se é Administrador (Substitua pelo seu e-mail de admin)
      if (user?.email === 'leo.perret@gmail.com') {
        toast.success('Acesso Administrativo detectado!')
        router.push('/admin')
        return
      }

      // B. Verificar se é um Parceiro...
      const { data: partner, error: partnerError } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', user?.id)
        .maybeSingle()

      if (partnerError) throw partnerError

      if (partner) {
        router.push('/dashboard/parceiro')
        return
      }

      // C. Usuário Comum (se não for admin nem parceiro)
      router.push('/vitrine')
      
      // --- FIM DA LÓGICA DE REDIRECIONAMENTO ---

    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login. Verifique seus dados.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="bg-[#00B9F2] p-2 rounded-xl">
          <Tag className="text-white" size={24} />
        </div>
        <span className="font-bold text-2xl text-slate-800 tracking-tight">
          AZ <span className="text-[#00B9F2]">CUPONS</span>
        </span>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Acesse sua conta</h1>
            <p className="text-slate-500 mt-2">Use seu e-mail e senha para acessar o painel</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  required 
                  type="email"
                  placeholder="seu@email.com"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2] transition-all text-gray-800" 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <label className="block text-xs font-bold uppercase text-slate-500">Senha</label>
                <Link href="#" className="text-xs text-[#00B9F2] font-semibold hover:underline">Esqueci a senha</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                <input 
                  required 
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border rounded-xl outline-[#00B9F2] transition-all text-gray-800" 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <button 
              disabled={loading}
              className="w-full py-4 bg-[#00B9F2] text-white rounded-xl font-bold hover:bg-[#009dc2] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00B9F2]/20"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Entrar na minha conta'}
            </button>
          </form>
        </div>

        <div className="p-6 bg-slate-50 border-t text-center">
          <p className="text-sm text-slate-600">
            Ainda não tem conta? {' '}
            <Link href="/usuario" className="text-[#00B9F2] font-bold hover:underline inline-flex items-center gap-1">
              Cadastre-se grátis <ArrowRight size={14} />
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}