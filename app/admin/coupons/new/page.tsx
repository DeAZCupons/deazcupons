'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'

export default function NewCoupon() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  
  // Arquivos de imagem
  const [couponImg, setCouponImg] = useState<File | null>(null)
  const [printImg, setPrintImg] = useState<File | null>(null)
  const [slideImg, setSlideImg] = useState<File | null>(null) // NOVO: Estado para imagem do slide

  const couponInputRef = useRef<HTMLInputElement>(null)
  const printInputRef = useRef<HTMLInputElement>(null)
  const slideInputRef = useRef<HTMLInputElement>(null) // NOVO: Ref para o input do slide

  const [formData, setFormData] = useState({
    title: '', alphanumeric_code: '', expires_at: '', whatsapp_number: '',
    short_description: '', long_description: '', partner_id: '', category_id: ''
  })

  useEffect(() => {
    async function loadData() {
      const { data: p } = await supabase.from('partners').select('id, nome_estabelecimento').order('nome_estabelecimento')
      const { data: c } = await supabase.from('categories').select('id, name').order('name')
      if (p) setPartners(p)
      if (c) setCategories(c)
    }
    loadData()
  }, [])

  async function uploadImage(file: File, folder: string) {
    const fileExtension = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
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
      let imageUrl = ''
      let printImageUrl = ''
      let slideImageUrl = '' // NOVO

      if (couponImg) imageUrl = await uploadImage(couponImg, 'web')
      if (printImg) printImageUrl = await uploadImage(printImg, 'print')
      if (slideImg) slideImageUrl = await uploadImage(slideImg, 'slides') // NOVO

      const { error } = await supabase.from('coupons').insert([{
        ...formData,
        image_url: imageUrl,
        print_image_url: printImageUrl,
        slide_image_url: slideImageUrl, // NOVO: Salvando na coluna do banco
        status: 'active'
      }])

      if (error) throw error
      alert("Cupom salvo com sucesso!")
      router.push('/admin/coupons')
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const labelStyle = "block text-[14px] text-[#7B8490] mb-1 font-medium"
  const inputStyle = "w-full h-[42px] border border-[#C8D2DC] rounded-[3px] px-3 text-[#1C2733] outline-none focus:border-blue-400 bg-white placeholder:text-gray-300"

  return (
    <div className="pb-10">
      <div className="flex gap-2 text-[13px] text-[#7B8490] mb-6">
        <button onClick={() => router.back()} className="hover:underline flex items-center gap-1">Home</button> 
        <span>{'>'}</span> <span className="text-gray-400">Menu Cupons</span>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-sm">
        <div className="h-[70px] flex items-center px-[27px] border-b border-[#E9EDF1]">
          <h2 className="text-[17px] font-medium text-[#101828]">Adicionar novo cupom</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-[27px] space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className={labelStyle}>Nome do Cupom:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Código do Cupom:</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, alphanumeric_code: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Data de Validade:</label>
              <input required type="date" className={inputStyle} onChange={e => setFormData({...formData, expires_at: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Número WhatsApp:</label>
              <input type="text" placeholder="Número com DDD" className={inputStyle} onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Descrição do Cupom (resumida):</label>
              <input required type="text" className={inputStyle} onChange={e => setFormData({...formData, short_description: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Descrição Longa:</label>
              <textarea placeholder="Texto completo" className="w-full border border-[#C8D2DC] rounded-[3px] p-3 h-[100px] outline-none focus:border-blue-400 text-sm" 
                onChange={e => setFormData({...formData, long_description: e.target.value})}></textarea>
            </div>
          </div>

          {/* SEÇÃO DE IMAGENS - AGORA COM O SLIDE */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* IMAGEM DO CUPOM */}
            <div>
              <label className={labelStyle}>Imagem do Cupom (Lista):</label>
              <div className="flex border border-[#C8D2DC] rounded-[3px] overflow-hidden">
                <button type="button" onClick={() => couponInputRef.current?.click()} className="bg-[#F3F6F9] px-4 py-2 text-sm border-r hover:bg-gray-200">Escolher</button>
                <input ref={couponInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => setCouponImg(e.target.files?.[0] || null)} />
                <span className="p-2 text-sm text-gray-400 truncate">{couponImg ? couponImg.name : 'Nenhum arquivo'}</span>
              </div>
            </div>

            {/* IMAGEM DO SLIDE (DESTAQUE) */}
            <div>
              <label className={labelStyle}>Imagem do Slide (Horizontal - 1200x400):</label>
              <div className="flex border border-[#C8D2DC] rounded-[3px] overflow-hidden border-blue-200 bg-blue-50/20">
                <button type="button" onClick={() => slideInputRef.current?.click()} className="bg-[#EBF8FF] text-blue-600 px-4 py-2 text-sm border-r border-blue-200 hover:bg-blue-100 italic font-bold">Escolher Slide</button>
                <input ref={slideInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => setSlideImg(e.target.files?.[0] || null)} />
                <span className="p-2 text-sm text-blue-600 truncate">{slideImg ? slideImg.name : 'Obrigatório para plano Premium'}</span>
              </div>
            </div>

            {/* IMAGEM PARA IMPRESSÃO */}
            <div>
              <label className={labelStyle}>Imagem para Impressão:</label>
              <div className="flex border border-[#C8D2DC] rounded-[3px] overflow-hidden">
                <button type="button" onClick={() => printInputRef.current?.click()} className="bg-[#F3F6F9] px-4 py-2 text-sm border-r hover:bg-gray-200">Escolher</button>
                <input ref={printInputRef} type="file" accept="image/*" className="sr-only" onChange={(e) => setPrintImg(e.target.files?.[0] || null)} />
                <span className="p-2 text-sm text-gray-400 truncate">{printImg ? printImg.name : 'Nenhum arquivo'}</span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4">
            <div>
              <label className={labelStyle}>Estabelecimento (Loja):</label>
              <select required className={inputStyle} onChange={e => setFormData({...formData, partner_id: e.target.value})}>
                <option value="">Selecione...</option>
                {partners.map(p => <option key={p.id} value={p.id}>{p.nome_estabelecimento}</option>)}
              </select>
            </div>
            <div>
              <label className={labelStyle}>Categoria:</label>
              <select required className={inputStyle} onChange={e => setFormData({...formData, category_id: e.target.value})}>
                <option value="">Selecione...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-4">
            <button type="submit" disabled={loading} className="bg-[#5D7084] text-white px-8 h-[42px] rounded-[3px] font-medium hover:bg-[#4A596A] transition-colors uppercase text-sm">
              {loading ? 'Processando...' : 'Salvar Cupom'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}