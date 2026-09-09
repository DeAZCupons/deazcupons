'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

export default function NewTeamMember() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '', email: '', username: '', password: '', role: 'Secretária'
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const response = await fetch('/api/team/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })

    const result = await response.json()

    if (result.success) {
      alert("Membro da equipe cadastrado com sucesso!")
      router.push('/admin/config/team')
    } else {
      alert("Erro: " + result.error)
    }
    setLoading(false)
  }

  const labelStyle = "block text-[14px] text-[#7B8490] mb-2 font-medium"
  const inputStyle = "w-full h-[45px] border border-[#C8D2DC] rounded-[3px] px-4 text-[#1C2733] outline-none focus:border-blue-400 bg-white"

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black">
        <ArrowLeft size={18}/> Voltar
      </button>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm p-8">
        <h2 className="text-[17px] font-medium text-[#101828] mb-8 border-b pb-4">Cadastrar Novo Membro da Equipe</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Nome Completo:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>E-mail de Acesso:</label>
              <input required type="email" className={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Usuário (Username):</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Senha Inicial:</label>
              <input required type="password" placeholder="Mínimo 6 caracteres" className={inputStyle} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Função no Dashboard:</label>
            <select className={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Administrador">Administrador</option>
              <option value="Gestor">Gestor</option>
              <option value="Estagiário">Estagiário</option>
              <option value="Secretária">Secretária</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="bg-[#14D8B0] text-white px-10 h-[50px] rounded-[3px] font-bold hover:opacity-90 transition-all uppercase text-sm">
            {loading ? 'Criando Acesso...' : 'Cadastrar Membro'}
          </button>
        </form>
      </div>
    </div>
  )
}