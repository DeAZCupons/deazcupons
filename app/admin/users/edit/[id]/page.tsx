'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, UserCheck } from 'lucide-react'

export default function EditUser() {
  const router = useRouter()
  const params = useParams()
  const userId = params?.id as string
  
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Inicializamos com strings vazias para evitar o erro de "null" ou "undefined"
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    whatsapp: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    if (userId) fetchUser()
  }, [userId])

  async function fetchUser() {
    try {
      setLoadingData(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (data) {
        // CORREÇÃO: Usamos o operador || '' para garantir que nunca seja null
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          phone: data.phone || '',
          address: data.address || ''
        })
      }
    } finally {
      setLoadingData(false)
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const { error } = await supabase
      .from('users')
      .update(formData)
      .eq('id', userId)

    if (error) {
      alert("Erro ao atualizar: " + error.message)
    } else {
      alert("Usuário atualizado com sucesso!")
      router.push('/admin/users')
    }
    setLoading(false)
  }

  const labelStyle = "block text-[13px] text-[#7B8490] mb-1 uppercase font-bold"
  const inputStyle = "w-full h-[45px] border border-[#C8D2DC] rounded-md px-4 text-[#1C2733] outline-none focus:border-blue-500 bg-white"

  if (loadingData) return <div className="p-20 text-center text-gray-500">Carregando dados...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-[#3E506F]">
        <ArrowLeft size={20}/> Voltar para a lista
      </button>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center px-8 border-b bg-gray-50/50">
          <UserCheck className="mr-2 text-blue-600" />
          <h2 className="text-lg font-bold text-[#3E506F]">Editar Dados do Usuário</h2>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Nome Completo:</label>
              <input 
                type="text" 
                className={inputStyle} 
                value={formData.full_name} 
                onChange={e => setFormData({...formData, full_name: e.target.value})} 
              />
            </div>
            <div>
              <label className={labelStyle}>E-mail:</label>
              <input 
                type="email" 
                className={inputStyle} 
                value={formData.email} 
                onChange={e => setFormData({...formData, email: e.target.value})} 
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>WhatsApp:</label>
              <input 
                type="text" 
                className={inputStyle} 
                value={formData.whatsapp} 
                onChange={e => setFormData({...formData, whatsapp: e.target.value})} 
              />
            </div>
            <div>
              <label className={labelStyle}>Telefone:</label>
              <input 
                type="text" 
                className={inputStyle} 
                value={formData.phone} 
                onChange={e => setFormData({...formData, phone: e.target.value})} 
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Endereço Completo:</label>
            <input 
              type="text" 
              className={inputStyle} 
              value={formData.address} 
              onChange={e => setFormData({...formData, address: e.target.value})} 
            />
          </div>

          <div className="pt-4 flex gap-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="bg-[#3E506F] text-white px-10 h-[50px] rounded font-bold hover:bg-[#2A3952] transition-colors uppercase text-sm"
            >
              {loading ? 'Salvando...' : 'Atualizar Dados'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}