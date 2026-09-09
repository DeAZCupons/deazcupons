'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false) // Feedback visual
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    console.log("Tentando logar com:", email)

    try {
      // 1. Autenticação no Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email: email.trim(), 
        password 
      })
      
      if (authError) {
        console.error("Erro na autenticação:", authError.message)
        alert('Erro no Login: ' + authError.message)
        setLoading(false)
        return
      }

      console.log("Usuário autenticado com sucesso:", data.user.id)

      // 2. Verificação na tabela admin_users
      const { data: admin, error: dbError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle()

      if (dbError) {
        console.error("Erro ao consultar tabela admin_users:", dbError.message)
        alert("Erro no banco de dados: " + dbError.message)
        setLoading(false)
        return
      }

      if (admin) {
        console.log("Admin detectado, redirecionando...")
        router.push('/admin')
      } else {
        console.warn("Usuário logado, mas não está na tabela admin_users")
        alert("Você não tem permissão de administrador.")
        // Opcional: deslogar se não for admin para não ficar preso
        await supabase.auth.signOut()
      }

    } catch (err) {
      console.error("Erro inesperado:", err)
      alert("Ocorreu um erro inesperado. Verifique o console (F12).")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F6F9]">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded shadow-md w-full max-w-sm">
        <div className="flex justify-center mb-8">
            <span className="font-bold text-2xl text-slate-800">DE AZ <span className="text-[#00B9F2]">CUPONS</span></span>
        </div>
        
        <h1 className="text-xl font-bold mb-6 text-center text-[#3E506F]">Acesso ao Sistema</h1>
        
        <input 
          type="email" 
          placeholder="E-mail" 
          required
          className="w-full p-3 border rounded mb-4 text-black outline-[#00B9F2]" 
          onChange={e => setEmail(e.target.value)} 
          disabled={loading}
        />
        
        <input 
          type="password" 
          placeholder="Senha" 
          required
          className="w-full p-3 border rounded mb-6 text-black outline-[#00B9F2]" 
          onChange={e => setPassword(e.target.value)} 
          disabled={loading}
        />
        
        <button 
          type="submit" 
          disabled={loading}
          className={`w-full p-3 rounded font-bold text-white transition-all ${loading ? 'bg-gray-400' : 'bg-[#3E506F] hover:bg-[#2A3952]'}`}
        >
          {loading ? 'CARREGANDO...' : 'ENTRAR'}
        </button>
      </form>
    </main>
  )
}