'use client'
import { useState } from 'react'

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    fullName: '', email: '', password: '',
    cpf: '', whatsapp: '', address: '', consent: false
  })
  const [status, setStatus] = useState({ loading: false, message: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.consent) {
      alert("Você precisa aceitar os termos de uso.")
      return
    }
    
    setStatus({ loading: true, message: '' })

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const result = await response.json()

      if (result.success) {
        setStatus({ loading: false, message: 'Sucesso! Verifique seu e-mail para confirmar o cadastro.' })
      } else {
        setStatus({ loading: false, message: 'Erro: ' + result.error })
      }
    } catch (err) {
      setStatus({ loading: false, message: 'Erro ao conectar com o servidor.' })
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl p-8 border border-gray-100">
        <h1 className="text-3xl font-bold text-blue-900 mb-2 text-center">De AZ Cupons</h1>
        <p className="text-gray-500 text-center mb-8">Crie sua conta para economizar agora</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="Nome Completo" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, fullName: e.target.value})} />
            
            <input required type="email" placeholder="E-mail" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="password" placeholder="Senha" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, password: e.target.value})} />
            
            <input required type="text" placeholder="CPF (Apenas números)" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, cpf: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input required type="text" placeholder="WhatsApp (DDD + Número)" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, whatsapp: e.target.value})} />
            
            <input required type="text" placeholder="Endereço Completo" className="p-3 border rounded-lg text-black bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={e => setFormData({...formData, address: e.target.value})} />
          </div>

          <div className="flex items-start gap-2 py-2">
            <input required type="checkbox" id="consent" className="mt-1 w-4 h-4 text-blue-600"
              onChange={e => setFormData({...formData, consent: e.target.checked})} />
            <label htmlFor="consent" className="text-xs text-gray-600 leading-tight">
              Eu aceito os Termos de Uso e a Política de Privacidade em conformidade com a LGPD. 
              Entendo que meus dados serão usados para fins de acesso à plataforma De AZ Cupons.
            </label>
          </div>

          <button type="submit" disabled={status.loading}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400">
            {status.loading ? 'Processando Segurança...' : 'FINALIZAR CADASTRO'}
          </button>

          {status.message && (
            <p className={`text-center text-sm font-medium p-3 rounded ${status.message.includes('Sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}