'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'

export default function AddClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get('leadId')
  const [loading, setLoading] = useState(false)
  const [logoFile, setLogoFile] = useState<File | null>(null)
  
  // ESTADOS PARA OS SELECTS
  const [categories, setCategories] = useState<any[]>([])
  const [plans, setPlans] = useState<any[]>([]) // <--- AQUI ESTAVA FALTANDO
  
  // ESTADOS PARA NOVA CATEGORIA
  const [showNewCat, setShowNewCat] = useState(false)
  const [newCatName, setNewCatName] = useState('')

  const [formData, setFormData] = useState({
    codigo_cliente: '', nome_estabelecimento: searchParams.get('nome') || '', razao_social: '', cnpj_cpf: '',
    formato_juridico: 'MEI', nome_responsavel: searchParams.get('responsavel') || '', endereco: '', bairro: '',
    cidade: '', uf: 'SP', cep: '', telefone: '', celular: searchParams.get('whatsapp') || '', email: searchParams.get('email') || '',
    observacoes: '', category_id: '', plan_id: '', // Adicionado plan_id
    data_inicio_plano: new Date().toISOString().split('T')[0], // Define hoje como padrão
    data_fim_plano: '',
    status_pagamento: 'Ativo'
  })

  // CARREGAR DADOS DO BANCO AO ABRIR A TELA
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    // Busca Categorias
    const { data: catData } = await supabase.from('categories').select('*').order('name')
    if (catData) setCategories(catData)

    // Busca Planos
    const { data: planData } = await supabase.from('plans').select('*').order('monthly_price')
    if (planData) setPlans(planData)
  }

  async function handleCreateCategory() {
    if (!newCatName) return
    const slug = newCatName.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')
    const { data, error } = await supabase.from('categories').insert([{ name: newCatName, slug }]).select()
    if (data) {
      setCategories(prev => [...prev, data[0]])
      setFormData(prev => ({ ...prev, category_id: data[0].id }))
      setNewCatName('')
      setShowNewCat(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)

  try {
    /*
     * ==========================================
     * 1. GERAR SLUG
     * ==========================================
     */

    const baseSlug = formData.nome_estabelecimento
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    let slug = baseSlug
    let counter = 1

    /*
     * Verifica se o slug já existe
     */

    while (true) {
      const { data: existingPartner, error: slugError } = await supabase
        .from('partners')
        .select('id')
        .eq('slug', slug)
        .maybeSingle()

      if (slugError) {
        throw slugError
      }

      if (!existingPartner) {
        break
      }

      counter++
      slug = `${baseSlug}-${counter}`
    }

    /*
     * ==========================================
     * 2. UPLOAD DA LOGOMARCA
     * ==========================================
     */

    let logoUrl = null

    if (logoFile) {
      const fileExtension = logoFile.name.split('.').pop()

      const fileName = `${crypto.randomUUID()}.${fileExtension}`

      const filePath = `partners/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, logoFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      /*
       * Recupera a URL pública da imagem
       */

      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      logoUrl = publicUrlData.publicUrl
    }

    /*
     * ==========================================
     * 3. MONTAR DADOS DO CLIENTE
     * ==========================================
     */

    const payload = {
      name: formData.nome_estabelecimento,

      slug,

      codigo_cliente: formData.codigo_cliente,

      nome_estabelecimento: formData.nome_estabelecimento,

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

      /*
       * URL da logomarca
       */
      logo_url: logoUrl,

      data_inicio_plano: formData.data_inicio_plano,
      data_fim_plano: formData.data_fim_plano || null,
      status_pagamento: formData.status_pagamento
    }

    /*
     * ==========================================
     * 4. SALVAR CLIENTE
     * ==========================================
     */

    const { data: newPartner, error } = await supabase
      .from('partners')
      .insert([payload])
      .select('id')
      .single()

    if (error) {
      throw error
    }

    /*
     * ==========================================
     * 4.5. ENVIAR CONVITE DE ACESSO AO DASHBOARD
     * ==========================================
     */

    const inviteResponse = await fetch('/api/partners/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerId: newPartner.id, email: formData.email })
    })

    if (!inviteResponse.ok) {
      const inviteError = await inviteResponse.json()
      // O parceiro já foi cadastrado — só o convite falhou. Avisa mas não trava o fluxo.
      alert('Cliente cadastrado, mas houve um erro ao enviar o convite por e-mail: ' + inviteError.message)
    }

    // Se esse cadastro veio de um Lead (aba Interessados), marca como convertido
    if (leadId) {
      const { error: leadUpdateError } = await supabase
        .from('leads_parceiros')
        .update({ status: 'convertido' })
        .eq('id', leadId)

      if (leadUpdateError) {
        console.error('Erro ao marcar lead como convertido:', leadUpdateError)
      }
    }

    /*
     * ==========================================
     * 5. SUCESSO
     * ==========================================
     */

    alert('Cliente cadastrado com sucesso!')

    router.push('/admin/partners')

  } catch (error: any) {

    console.error('Erro completo:', error)

    alert(
      'Erro ao salvar cliente: ' +
      (error?.message || 'Erro desconhecido')
    )

  } finally {

    setLoading(false)

  }
}

  const labelStyle = "block text-[14px] text-[#7B8490] mb-1 uppercase font-medium"
  const inputStyle = "w-full h-[42px] border border-[#C8D2DC] rounded-[3px] px-3 text-[#1C2733] focus:border-blue-500 outline-none transition-all placeholder:text-[#B9C3CE] bg-white"

  return (
    <div>

      {/* Breadcrumb */}
      <div className="flex gap-2 text-[13px] text-[#7B8490] mb-6">
        <span>Home</span> 
        <span>{'>'}</span> 
        <span>Dashboard</span> 
        <span>{'>'}</span> 
        <span className="text-gray-400">Cadastrar cliente</span>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
        <div className="h-[70px] flex items-center px-[27px] border-b border-[#E9EDF1]">
          <h2 className="text-[17px] font-medium text-[#101828]">Cadastrar cliente novo</h2>
        </div>

        <form 
        
        onSubmit={handleSubmit} 
        className="p-[27px] space-y-8">

          {/* Row 1 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[150px]">
              <label className={labelStyle}>Código do cliente:</label>
              <input type="text" className={inputStyle} onChange={e => setFormData({...formData, codigo_cliente: e.target.value})} />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className={labelStyle}>Nome do estabelecimento:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, nome_estabelecimento: e.target.value})} />
            </div>
            <div className="flex-[2] min-w-[200px]">
              <label className={labelStyle}>Razão Social:</label>
              <input type="text" className={inputStyle} onChange={e => setFormData({...formData, razao_social: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[180px]">
              <label className={labelStyle}>CNPJ/CPF:</label>
              <input required type="text" placeholder="Apenas números" className={inputStyle} onChange={e => setFormData({...formData, cnpj_cpf: e.target.value})} />
            </div>
          </div>

          {/* Row 2: Planos, Categorias e Formato Jurídico */}
          <div className="flex flex-wrap gap-6 items-start">
            {/* PLANO */}
            <div className="flex-1 min-w-[220px]">
              <label className={labelStyle}>Plano de Assinatura:</label>
              <select required className={inputStyle} onChange={e => setFormData({...formData, plan_id: e.target.value})}>
                <option value="">Selecione um plano...</option>
                {plans.map(p => (
                  <option key={p.id} value={p.id}>{p.name} - R$ {p.monthly_price}</option>
                ))}
              </select>
            </div>

            {/* CATEGORIA */}
            <div className="flex-1 min-w-[250px]">
                <label className={labelStyle}>Categoria:</label>
                <div className="flex gap-2">
                    <select required className={inputStyle} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                        <option value="">Selecione...</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <button type="button" onClick={() => setShowNewCat(!showNewCat)} className="bg-[#5D7084] text-white px-3 rounded hover:bg-slate-700 transition-colors">
                        <Plus size={18}/>
                    </button>
                </div>
                {showNewCat && (
                    <div className="mt-2 flex gap-2 p-2 bg-gray-50 border rounded shadow-inner">
                        <input type="text" value={newCatName} onChange={e => setNewCatName(e.target.value)} placeholder="Nova categoria..." className="flex-1 p-1 text-sm border rounded outline-none" />
                        <button type="button" onClick={handleCreateCategory} className="text-xs bg-green-600 text-white px-2 py-1 rounded">OK</button>
                    </div>
                )}
            </div>
            
            {/* Logomarca */}
            <div className="w-full">
              <label className={labelStyle}>Logomarca do Estabelecimento:</label>
              <div className="flex items-center gap-4 border border-[#C8D2DC] p-2 rounded">
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-sm text-gray-500" />
                {logoFile && <p className="text-xs text-blue-600 font-bold">Arquivo selecionado!</p>}
              </div>
            </div>
            
            {/* FORMATO JURÍDICO */}
            <div className="flex-1 min-w-[300px]">
              <label className={labelStyle}>Formato Jurídico:</label>
              <div className="flex flex-wrap gap-4 mt-2">
                {['MEI', 'ME', 'EIRELI', 'SOCIEDADE LIMITADA', 'SOCIEDADE ANÔNIMA'].map(op => (
                  <label key={op} className="flex items-center gap-2 text-[13px] text-[#7B8490] cursor-pointer">
                    <input type="radio" name="formato" value={op} checked={formData.formato_juridico === op} onChange={e => setFormData({...formData, formato_juridico: e.target.value})} className="accent-[#3E506F]" />
                    {op}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Row 3: Responsável e Endereço */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className={labelStyle}>Nome do Responsável:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, nome_responsavel: e.target.value})} />
            </div>
            <div className="flex-[2] min-w-[250px]">
              <label className={labelStyle}>Endereço:</label>
              <input type="text" className={inputStyle} onChange={e => setFormData({...formData, endereco: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[150px]">
              <label className={labelStyle}>Bairro:</label>
              <input type="text" className={inputStyle} onChange={e => setFormData({...formData, bairro: e.target.value})} />
            </div>
          </div>

          {/* Row 4: Cidade, UF, CEP, Telefones */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <label className={labelStyle}>Cidade:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, cidade: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>UF:</label>
              <select className={inputStyle} onChange={e => setFormData({...formData, uf: e.target.value})}>
                {['SP', 'RJ', 'MG', 'PR', 'RS', 'SC', 'BA', 'PE', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'PA', 'PB', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'].map(uf => <option key={uf} value={uf}>{uf}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>CEP:</label>
              <input type="text" placeholder="99999-999" className={inputStyle} onChange={e => setFormData({...formData, cep: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Telefone:</label>
              <input type="text" placeholder="(99)9999-9999" className={inputStyle} onChange={e => setFormData({...formData, telefone: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Celular:</label>
              <input type="text" placeholder="(99)99999-9999" className={inputStyle} onChange={e => setFormData({...formData, celular: e.target.value})} />
            </div>
          </div>

          {/* Row 5: Email */}
          <div className="w-full">
            <label className={labelStyle}>E-mail:</label>
            <input required type="email" className={inputStyle} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>

          {/* Row 6: Observações */}
          <div className="w-full">
            <label className={labelStyle}>Observações:</label>
            <textarea className="w-full border border-[#C8D2DC] rounded-[3px] p-3 outline-none focus:border-blue-500 text-black" rows={3} onChange={e => setFormData({...formData, observacoes: e.target.value})}></textarea>
          </div>

          {/* SEÇÃO: CONTROLE DE CONTRATO E PLANO */}
<div className="bg-[#F9FAFB] p-6 rounded-sm border border-[#E9EDF1] space-y-6">
  <h3 className="text-[15px] font-bold text-[#3E506F] uppercase tracking-wider flex items-center gap-2">
    <div className="w-1 h-4 bg-[#00B9F2] rounded-full" />
    Controle de Contrato e Plano
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div>
      <label className={labelStyle}>Início do Contrato:</label>
      <input 
        type="date" 
        className={inputStyle} 
        value={formData.data_inicio_plano} 
        onChange={e => setFormData({...formData, data_inicio_plano: e.target.value})} 
      />
    </div>

    <div>
      <label className={labelStyle}>Vencimento do Plano:</label>
      <input 
        type="date" 
        className={inputStyle}
        value={formData.data_fim_plano} 
        onChange={e => setFormData({...formData, data_fim_plano: e.target.value})} 
      />
    </div>

      <div>
            <label className={labelStyle}>Status de Pagamento:</label>
            <select 
              className={inputStyle}
              value={formData.status_pagamento} 
              onChange={e => setFormData({...formData, status_pagamento: e.target.value})}
            >
              <option value="Ativo">Ativo / Em dia</option>
              <option value="Inadimplente">Inadimplente</option>
              <option value="Aguardando Renovação">Aguardando Renovação</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

          <div className="pt-4 border-t border-[#E9EDF1]">
            <button type="submit" disabled={loading} className="bg-[#5D7084] text-white px-8 h-[45px] rounded-[3px] font-bold hover:bg-[#4A596A] transition-colors uppercase text-sm shadow-md">
              {loading ? 'Salvando Cliente...' : 'Adicionar Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}