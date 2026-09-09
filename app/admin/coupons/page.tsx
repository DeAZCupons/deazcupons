'use client'

import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Edit, Trash2, Eye } from 'lucide-react'

export default function CouponsDashboard() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [filterName, setFilterName] = useState('')
  const [filterCode, setFilterCode] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null)

  useEffect(() => {
    fetchCoupons()
  }, [])

  async function handleView(coupon: any) {
    try {
      const url = await QRCode.toDataURL(coupon.alphanumeric_code, {
        width: 250,
        margin: 2,
        color: {
          dark: '#3E506F',
          light: '#FFFFFF',
        },
      })
      setQrCodeUrl(url)
      setSelectedCoupon(coupon)
    } catch (err) {
      console.error(err)
    }
  }

  async function fetchCoupons() {
    setLoading(true)
    let query = supabase
      .from('coupons')
      .select('*, partners(nome_estabelecimento), categories(name)')
      .order('created_at', { ascending: false })

    if (filterName) query = query.ilike('title', `%${filterName}%`)
    if (filterCode) query = query.ilike('alphanumeric_code', `%${filterCode}%`)
    if (filterDate) query = query.lte('expires_at', filterDate)

    const { data } = await query
    if (data) setCoupons(data)
    setLoading(false)
  }

  async function handleDelete(id: string, imgWeb: string, imgPrint: string) {
    if (!confirm('Deseja realmente excluir este cupom?')) return

    try {
      const filesToDelete: string[] = []
      if (imgWeb) filesToDelete.push(imgWeb.split('/').pop() || '')
      if (imgPrint) filesToDelete.push(imgPrint.split('/').pop() || '')

      if (filesToDelete.length > 0) {
        await supabase.storage.from('coupons').remove(filesToDelete.map((file) => `web/${file}`).filter(Boolean))
      }

      const { error } = await supabase.from('coupons').delete().eq('id', id)
      if (error) throw error

      setCoupons((current) => current.filter((coupon) => coupon.id !== id))
      alert('Cupom excluído!')
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  const labelStyle = 'block text-[14px] text-[#7B8490] mb-1 font-medium'
  const inputStyle = 'w-full h-[42px] border border-[#C8D2DC] rounded-[3px] px-3 text-[#1C2733] outline-none focus:border-blue-400 bg-white'

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-[13px] text-[#7B8490]">
        <span>Home</span> <span>{'>'}</span> <span className="text-gray-400">Menu Cupons</span>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-sm">
        <div className="h-[70px] flex items-center px-[27px] border-b border-[#E9EDF1]">
          <h2 className="text-[17px] font-medium text-[#101828]">Listagem de Cupons cadastrados</h2>
        </div>

        <div className="p-[27px] grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div className="md:col-span-1">
            <label className={labelStyle}>Nome do cupom:</label>
            <input type="text" className={inputStyle} value={filterName} onChange={(e) => setFilterName(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className={labelStyle}>Código do cupom:</label>
            <input type="text" className={inputStyle} value={filterCode} onChange={(e) => setFilterCode(e.target.value)} />
          </div>
          <div className="md:col-span-1">
            <label className={labelStyle}>Buscar por data:</label>
            <input type="date" className={inputStyle} value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>

          <div className="md:col-span-3 flex gap-2">
            <button onClick={fetchCoupons} className="bg-[#5D7084] text-white px-6 h-[42px] rounded-[3px] flex items-center gap-2 hover:bg-[#4A596A] transition-colors">
              Filtrar
            </button>
            <button
              onClick={() => {
                setFilterName('')
                setFilterCode('')
                setFilterDate('')
              }}
              className="bg-[#5D7084] text-white px-6 h-[42px] rounded-[3px] flex items-center gap-2 hover:bg-[#4A596A] transition-colors"
            >
              Limpar Filtros
            </button>
            <Link href="/admin/coupons/new" className="bg-[#14D8B0] text-white px-6 h-[42px] rounded-[3px] flex items-center gap-2 hover:opacity-90 transition-opacity ml-auto">
              Adicionar novo Cupom
            </Link>
          </div>
        </div>

        <div className="px-[27px] pb-[27px] overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#F2F4F7]">
            <thead className="bg-white border-b-2 border-[#F2F4F7]">
              <tr className="text-[13px] text-[#101828] uppercase font-bold">
                <th className="p-4 border-r border-[#F2F4F7] text-center w-16">ID</th>
                <th className="p-4 border-r border-[#F2F4F7]">NOME</th>
                <th className="p-4 border-r border-[#F2F4F7]">CÓDIGO</th>
                <th className="p-4 border-r border-[#F2F4F7]">DESCRIÇÃO</th>
                <th className="p-4 border-r border-[#F2F4F7]">DESCRIÇÃO LONGA</th>
                <th className="p-4 border-r border-[#F2F4F7]">CLIENTE</th>
                <th className="p-4 border-r border-[#F2F4F7]">CATEGORIA</th>
                <th className="p-4 border-r border-[#F2F4F7]">VALIDADE</th>
                <th className="p-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {coupons.map((coupon, idx) => (
                <tr key={coupon.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} text-[13px] text-[#475467]`}>
                  <td className="p-4 border-r border-[#F2F4F7] text-center">{idx + 100}</td>
                  <td className="p-4 border-r border-[#F2F4F7] font-medium leading-tight max-w-[200px]">{coupon.title}</td>
                  <td className="p-4 border-r border-[#F2F4F7]">{coupon.alphanumeric_code}</td>
                  <td className="p-3 border-r border-[#F2F4F7] text-[11px] leading-tight max-w-[150px]">
                    <div className="line-clamp-2">{coupon.short_description}</div>
                  </td>
                  <td className="p-3 border-r border-[#F2F4F7] text-[11px] leading-tight max-w-[200px]">
                    <div className="line-clamp-2">{coupon.long_description}</div>
                  </td>
                  <td className="p-4 border-r border-[#F2F4F7]">{coupon.partners?.nome_estabelecimento}</td>
                  <td className="p-4 border-r border-[#F2F4F7]">{coupon.categories?.name}</td>
                  <td className="p-4 border-r border-[#F2F4F7]">{new Date(coupon.expires_at).toLocaleDateString('pt-BR')}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-1">
                      <Link href={`/admin/coupons/edit/${coupon.id}`} className="p-2 bg-[#5D7084] text-white rounded-[3px] hover:bg-slate-700">
                        <Edit size={16} />
                      </Link>
                      <button onClick={() => handleDelete(coupon.id, coupon.image_url, coupon.print_image_url)} className="p-2 bg-[#F04438] text-white rounded-[3px] hover:bg-red-700">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => handleView(coupon)} className="p-2 bg-[#14D8B0] text-white rounded-[3px] hover:opacity-80">
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-center py-10">Carregando cupons...</p>}
        </div>
      </div>

      {selectedCoupon && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
          <div className="bg-white rounded-sm max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-gray-50">
              <h3 className="font-bold text-[#3E506F] uppercase tracking-wider">Visualizar Cupom</h3>
              <button onClick={() => setSelectedCoupon(null)} className="text-gray-400 hover:text-red-500 font-bold text-xl">
                ×
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Estabelecimento</label>
                  <p className="font-bold text-[#101828]">{selectedCoupon.partners?.nome_estabelecimento}</p>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Título da Oferta</label>
                  <p className="text-sm text-gray-700">{selectedCoupon.title}</p>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-100 rounded">
                  <label className="text-[10px] font-bold text-blue-400 uppercase">Código para Uso Online</label>
                  <p className="font-mono text-lg font-bold text-blue-700">{selectedCoupon.alphanumeric_code}</p>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center border-l border-gray-100 pl-8 text-center">
                <label className="text-[10px] font-bold text-gray-400 uppercase mb-4">QR Code para Uso Presencial</label>
                {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" className="w-48 h-48 border-4 border-gray-50 shadow-sm" />}
                <p className="text-[10px] text-gray-400 mt-4 italic">
                  Apresente este código no caixa do estabelecimento para validar seu desconto.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
