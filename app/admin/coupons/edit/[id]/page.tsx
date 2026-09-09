'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Upload, Image as ImageIcon, Save } from 'lucide-react'
import { toast } from 'sonner'

export default function EditCoupon() {
  const router = useRouter()
  const params = useParams()
  const couponId = params?.id as string

  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  // Arquivos para novos uploads
  const [couponImg, setCouponImg] = useState<File | null>(null)
  const [printImg, setPrintImg] = useState<File | null>(null)
  const [slideImg, setSlideImg] = useState<File | null>(null)

  const [formData, setFormData] = useState<any>({
    title: '', alphanumeric_code: '', expires_at: '', whatsapp_number: '',
    short_description: '', long_description: '', partner_id: '', category_id: '',
    image_url: '', print_image_url: '', slide_image_url: ''
  })

  useEffect(() => {
  async function loadInitialData() {
    const { data: p } = await supabase.from('partners').select('id, nome_estabelecimento').order('nome_estabelecimento')
    const { data: c } = await supabase.from('categories').select('id, name').order('name')
    if (p) setPartners(p)
    if (c) setCategories(c)

    if (couponId) {
      const { data: cp, error } = await supabase.from('coupons').select('*').eq('id', couponId).single()
      if (cp) {
        const formattedDate = cp.expires_at ? cp.expires_at.split('T')[0] : ''
        
        // CORREÇÃO AQUI: Garantir que nenhum campo seja NULL
        setFormData({
          ...cp,
          expires_at: formattedDate,
          whatsapp_number: cp.whatsapp_number || '',      // Se for null, vira ""
          short_description: cp.short_description || '',  // Se for null, vira ""
          long_description: cp.long_description || '',    // Se for null, vira ""
          image_url: cp.image_url || '',
          print_image_url: cp.print_image_url || '',
          slide_image_url: cp.slide_image_url || '',
          category_id: cp.category_id || '',              // Importante para o select não bugar
          partner_id: cp.partner_id || ''
        })
      }
    }
  }
  loadInitialData()
}, [couponId])

  async function uploadImage(file: File, folder: string) {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from('coupons')
      .upload(filePath, file);

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('coupons')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  }

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  setLoading(true)

  try {
    let imageUrl = formData.image_url
    let printImageUrl = formData.print_image_url
    let slideImageUrl = formData.slide_image_url

    if (couponImg) imageUrl = await uploadImage(couponImg, 'web')
    if (printImg) printImageUrl = await uploadImage(printImg, 'print')
    if (slideImg) slideImageUrl = await uploadImage(slideImg, 'slides')

    // 1. Atualiza o cupom oficial
    const { error: couponError } = await supabase.from('coupons').update({
      title: formData.title,
      alphanumeric_code: formData.alphanumeric_code,
      expires_at: formData.expires_at,
      whatsapp_number: formData.whatsapp_number || null,
      short_description: formData.short_description || null,
      long_description: formData.long_description || null,
      partner_id: formData.partner_id || null,
      category_id: formData.category_id || null,
      image_url: imageUrl,
      print_image_url: printImageUrl,
      slide_image_url: slideImageUrl,
      active: true 
    }).eq('id', couponId)

    if (couponError) throw couponError

    // 2. Atualiza a solicitação vinculada para 'Finalizado'
    const { error: requestError } = await supabase
      .from('coupon_requests')
      .update({ status: 'Finalizado' })
      .eq('coupon_id', couponId)

    if (requestError) {
      console.error("Erro ao finalizar solicitação:", requestError)
    }

    // USANDO O TOAST CORRETAMENTE AQUI:
    toast.success("Cupom publicado! O parceiro foi notificado.")
    
    // Redireciona de volta para a lista de solicitações pendentes
    router.push('/admin/coupons') 
    
  } catch (err: any) {
    toast.error("Erro ao atualizar: " + err.message)
  } finally {
    setLoading(false)
  }
}

  const labelStyle = "block text-[14px] text-[#7B8490] mb-1 font-medium"
  const inputStyle = "w-full h-[42px] border border-[#C8D2DC] rounded-[3px] px-3 text-[#1C2733] outline-none focus:border-blue-400 bg-white shadow-sm transition-all"

  return (
    <div className="pb-10">
      <div className="flex gap-2 text-[13px] text-[#7B8490] mb-6">
        <button onClick={() => router.back()} className="hover:underline flex items-center gap-1">Voltar para lista</button> 
        <span>{'>'}</span> <span className="text-gray-400">Editar Cupom</span>
      </div>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center px-[27px] border-b bg-gray-50/30">
          <h2 className="text-[17px] font-medium text-[#101828]">Editando: <span className="text-blue-600">{formData.title}</span></h2>
        </div>

        <form onSubmit={handleSubmit} className="p-[27px] space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>Nome do Cupom:</label>
              <input required type="text" className={inputStyle} value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Código:</label>
              <input required type="text" className={inputStyle} value={formData.alphanumeric_code} onChange={e => setFormData({...formData, alphanumeric_code: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Validade:</label>
              <input required type="date" className={inputStyle} value={formData.expires_at} onChange={e => setFormData({...formData, expires_at: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>WhatsApp:</label>
              <input type="text" className={inputStyle} value={formData.whatsapp_number} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Descrição Curta:</label>
              <input required type="text" className={inputStyle} value={formData.short_description} onChange={e => setFormData({...formData, short_description: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Descrição Longa:</label>
              <textarea className="w-full border border-[#C8D2DC] rounded-[3px] p-3 h-[100px] outline-none focus:border-blue-400 text-sm" 
                value={formData.long_description} onChange={e => setFormData({...formData, long_description: e.target.value})}></textarea>
            </div>
          </div>

          {/* SEÇÃO DE IMAGENS - EDITAR */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 p-6 rounded-lg border border-dashed border-slate-200">
            
            {/* IMAGEM CUPOM */}
            <div>
              <label className={labelStyle}>Imagem Cupom (Lista):</label>
              <input type="file" className="text-xs mb-3 block w-full" onChange={e => setCouponImg(e.target.files?.[0] || null)} />
              {formData.image_url && (
                <div className="relative w-full h-32 bg-white rounded border overflow-hidden">
                  <img src={formData.image_url} alt="Atual" className="w-full h-full object-contain" />
                  <div className="absolute top-0 right-0 bg-black/50 text-white text-[10px] px-2 py-1">Atual</div>
                </div>
              )}
            </div>

            {/* IMAGEM SLIDE */}
            <div>
              <label className={`${labelStyle} text-blue-600`}>Imagem Slide (Destaque):</label>
              <input type="file" className="text-xs mb-3 block w-full" onChange={e => setSlideImg(e.target.files?.[0] || null)} />
              {formData.slide_image_url && (
                <div className="relative w-full h-32 bg-white rounded border border-blue-200 overflow-hidden">
                  <img src={formData.slide_image_url} alt="Atual" className="w-full h-full object-contain" />
                  <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] px-2 py-1 font-bold">Slide Atual</div>
                </div>
              )}
            </div>

            {/* IMAGEM IMPRESSÃO */}
            <div>
              <label className={labelStyle}>Imagem Impressão:</label>
              <input type="file" className="text-xs mb-3 block w-full" onChange={e => setPrintImg(e.target.files?.[0] || null)} />
              {formData.print_image_url && (
                <div className="relative w-full h-32 bg-white rounded border overflow-hidden">
                  <img src={formData.print_image_url} alt="Atual" className="w-full h-full object-contain" />
                </div>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Loja:</label>
              <select className={inputStyle} value={formData.partner_id} onChange={e => setFormData({...formData, partner_id: e.target.value})}>
                {partners.map(p => <option key={p.id} value={p.id}>{p.nome_estabelecimento}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Categoria:</label>
              <select className={inputStyle} value={formData.category_id} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
            <button type="submit" disabled={loading} className="bg-[#5D7084] text-white px-10 h-[45px] rounded-[3px] font-bold hover:bg-[#4A596A] transition-all uppercase text-sm flex items-center gap-2">
              <Save size={18} /> {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
            <button type="button" onClick={() => router.back()} className="text-slate-500 font-medium text-sm hover:underline">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  )
}