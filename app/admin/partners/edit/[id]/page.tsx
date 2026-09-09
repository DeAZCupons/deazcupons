'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { Plus, ArrowLeft } from 'lucide-react'

export default function EditPartner() {
  const router = useRouter()
  const params = useParams()
  const partnerId = params?.id as string

  const [loading, setLoading] = useState(false)
  const [loadingPartner, setLoadingPartner] = useState(true)
  const [logoFile, setLogoFile] = useState<File | null>(null)

  const [categories, setCategories] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([])
  
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const [formData, setFormData] = useState<any>({
    codigo_cliente: '', nome_estabelecimento: '', razao_social: '', cnpj_cpf: '',
    formato_juridico: 'MEI', nome_responsavel: '', endereco: '', bairro: '',
    cidade: '', uf: 'SP', cep: '', telefone: '', celular: '', email: '',
    observacoes: '', category_id: '', plan_id: '', logo_url: '', data_inicio_plano: '',
    data_fim_plano: '',  status_pagamento: 'Ativo'
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    if (partnerId) fetchPartner()
  }, [partnerId])

  async function fetchInitialData() {
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    const { data: planData } = await supabase.from('plans').select('*').order('monthly_price')
    if (catData) setCategories(catData)
    if (planData) setPlans(planData)
  }

  async function fetchPartner() {
    try {
      setLoadingPartner(true)
      if (!partnerId) throw new Error('ID do cliente não informado.')

      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerId)
        .single()

      if (error) throw error
      if (!data) throw new Error('Cliente não encontrado.')

      setFormData({
        codigo_cliente: data.codigo_cliente ?? '',
        nome_estabelecimento: data.nome_estabelecimento ?? data.name ?? '',
        razao_social: data.razao_social ?? '',
        cnpj_cpf: data.cnpj_cpf ?? '',
        formato_juridico: data.formato_juridico ?? 'MEI',
        nome_responsavel: data.nome_responsavel ?? '',
        endereco: data.endereco ?? '',
        bairro: data.bairro ?? '',
        cidade: data.cidade ?? '',
        uf: data.uf ?? 'SP',
        cep: data.cep ?? '',
        telefone: data.telefone ?? '',
        celular: data.celular ?? '',
        email: data.email ?? '',
        observacoes: data.observacoes ?? '',
        category_id: data.category_id ?? '',
        plan_id: data.plan_id ?? '',
        logo_url: data.logo_url ?? '',
        data_inicio_plano: data.data_inicio_plano || '',
        data_fim_plano: data.data_fim_plano || '',
        status_pagamento: data.status_pagamento || 'Ativo'
      })
    } catch (error: any) {
      console.error('Erro ao carregar cliente:', error)
      router.push('/admin/partners')
    } finally {
      setLoadingPartner(false)
    }
  }

  // FUNÇÃO CORRIGIDA (Linhas 106 e 107)
  async function handleCreateCategory() {
    if (!newCatName) return
    const slug = newCatName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')
    const { data } = await supabase.from('categories').insert([{ name: newCatName, slug }]).select()
    if (data) {
      setCategories((prev: any[]) => [...prev, data[0]]) // Adicionado tipagem :any[]
      setFormData((prev: any) => ({ ...prev, category_id: data[0].id })) // Adicionado tipagem :any
      setNewCatName('')
      setShowNewCat(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!partnerId) return
    setLoading(true)

    try {
      let finalLogoUrl = formData.logo_url

      if (logoFile) {
        const fileExtension = logoFile.name.split('.').pop()
        const fileName = `${crypto.randomUUID()}.${fileExtension}`
        const filePath = `partners/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(filePath, logoFile)

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('logos')
          .getPublicUrl(filePath)

        finalLogoUrl = urlData.publicUrl
      }

      const { error: updateError } = await supabase
        .from('partners')
        .update({
          name: formData.nome_estabelecimento,
          slug: formData.nome_estabelecimento.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          nome_estabelecimento: formData.nome_estabelecimento,
          codigo_cliente: formData.codigo_cliente,
          razao_social: formData.razao_social,
          cnpj_cpf: formData.cnpj_cpf,
          formato_juridico: formData.formato_juridico,
          nome_responsavel: formData.nome_responsavel,
          endereco: formData.endereco,
          bairro: formData.bairro,
          cidade: formData.cidade,
          uf: formData.uf,
          cep: formData.cep,
          telefone: formData.telefone,
          celular: formData.celular,
          email: formData.email,
          observacoes: formData.observacoes,
          category_id: formData.category_id || null,
          plan_id: formData.plan_id || null,
          logo_url: finalLogoUrl,
          data_inicio_plano: formData.data_inicio_plano || null,
          data_fim_plano: formData.data_fim_plano || null,
          status_pagamento: formData.status_pagamento || 'Ativo'
        })
        .eq('id', partnerId)

      if (updateError) throw updateError

      alert('Cliente atualizado com sucesso!')
      router.push('/admin/partners')

    } catch (error: any) {
      alert('Erro ao atualizar: ' + (error?.message || 'Erro desconhecido'))
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = "block text-[14px] text-[#7B8490] mb-1 uppercase font-medium"
  const inputStyle = "w-full h-[42px] border border-[#C8D2DC] rounded-[3px] px-3 text-[#1C2733] focus:border-blue-500 outline-none transition-all bg-white"

  if (loadingPartner) return <div className="p-20 text-center font-mono">Carregando dados do cliente...</div>

  return (
    <div className="pb-20">
      <div className="flex gap-2 text-[13px] text-[#7B8490] mb-6">
        <button onClick={() => router.back()} className="hover:underline flex items-center gap-1"><ArrowLeft size={14}/> Voltar</button>
        <span>{'>'}</span> <span>Dashboard</span> <span>{'>'}</span> <span className="text-gray-400">Editar Cliente</span>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[70px] flex items-center px-[27px] border-b border-[#E9EDF1]">
          <h2 className="text-[17px] font-medium text-[#101828]">Editar parceiro: {formData.nome_estabelecimento}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-[27px] space-y-8 text-black">
          {/* Seção Logo */}
          <div className="flex items-center gap-8 p-6 bg-[#F3F6F9] border border-[#C8D2DC] rounded">
             <div className="w-24 h-24 bg-white border rounded flex items-center justify-center overflow-hidden">
                {formData.logo_url ? <img src={formData.logo_url} className="w-full h-full object-contain" /> : <span className="text-[10px] text-gray-400">SEM LOGO</span>}
             </div>
             <div className="flex-1">
                <label className={labelStyle}>Alterar Logomarca:</label>
                <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files?.[0] || null)} className="text-sm" />
             </div>
          </div>

          {/* Campos do formulário (Simplificados para o exemplo, mantendo sua lógica) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Nome do estabelecimento:</label>
              <input required type="text" className={inputStyle} value={formData.nome_estabelecimento} onChange={e => setFormData({...formData, nome_estabelecimento: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>CNPJ/CPF:</label>
              <input required type="text" className={inputStyle} value={formData.cnpj_cpf} onChange={e => setFormData({...formData, cnpj_cpf: e.target.value})} />
            </div>
          </div>

          {/* Botões */}
          <div className="pt-8 border-t border-[#E9EDF1] flex gap-4">
            <button type="submit" disabled={loading} className="bg-[#5D7084] text-white px-10 h-[48px] rounded font-bold hover:bg-[#4A596A] uppercase text-sm">
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => router.back()} className="px-10 h-[48px] rounded font-bold text-gray-500 hover:bg-gray-100 uppercase text-sm">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}