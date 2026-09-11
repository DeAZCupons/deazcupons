'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function CompletarCadastroParceiro() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)
  const [sessionValid, setSessionValid] = useState(false)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    checkSession()
  }, [])

  async function checkSession() {
    // O link do e-mail de convite já autentica o navegador automaticamente
    // (o Supabase detecta o token na URL e cria a sessão).
    const { data: { session } } = await supabase.auth.getSession()
    setSessionValid(!!session)
    setChecking(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg('')

    if (password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMsg('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      const { data: { user }, error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) throw updateError

      // Garantia extra: caso o vínculo não tenha sido feito no convite,
      // linka aqui pelo e-mail (só afeta a linha que ainda estiver sem user_id).
      if (user?.email) {
        await supabase
          .from('partners')
          .update({ user_id: user.id })
          .eq('email', user.email)
          .is('user_id', null)
      }

      router.push('/dashboard/parceiro')
    } catch (err: any) {
      setErrorMsg(err.message || 'Não foi possível concluir o cadastro.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Verificando convite...</p>
      </div>
    )
  }

  if (!sessionValid) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <h1 className="text-xl font-bold text-slate-800 mb-2">Link inválido ou expirado</h1>
          <p className="text-slate-500">
            Peça pra equipe DeAZCupons reenviar o convite de acesso ao seu e-mail.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-xl font-bold text-slate-800 mb-1">Bem-vindo(a)!</h1>
        <p className="text-slate-500 text-sm mb-6">
          Defina uma senha para acessar o seu Painel de Parceiro.
        </p>

        <label className="block text-sm text-slate-600 mb-1">Senha</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 border rounded mb-4 text-black outline-[#00B9F2]"
        />

        <label className="block text-sm text-slate-600 mb-1">Confirmar senha</label>
        <input
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          className="w-full p-3 border rounded mb-6 text-black outline-[#00B9F2]"
        />

        {errorMsg && <p className="text-red-500 text-sm mb-4">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#00B9F2] text-white font-bold py-3 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Salvando...' : 'Concluir cadastro e entrar'}
        </button>
      </form>
    </div>
  )
}
