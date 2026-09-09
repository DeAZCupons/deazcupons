'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { AlertCircle, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

export default function ExpiredCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchExpired() }, [])

  async function fetchExpired() {
    const today = new Date().toISOString()
    const { data } = await supabase
      .from('coupons')
      .select('*, partners(nome_estabelecimento)')
      .lt('expires_at', today)
      .order('expires_at', { ascending: false })

    if (data) setCoupons(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cupom vencido permanentemente?")) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      alert("Cupom removido.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center px-8 border-b bg-red-50/20">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <h2 className="text-[17px] font-medium text-[#101828]">Relatório: Cupons Vencidos</h2>
        </div>

        <div className="p-8">
          <table className="w-full text-left border-collapse border border-[#F2F4F7]">
            <thead className="bg-[#F9FAFB]">
              <tr className="text-[11px] text-[#7B8490] uppercase font-bold">
                <th className="p-4 border-b">Cupom</th>
                <th className="p-4 border-b">Parceiro</th>
                <th className="p-4 border-b text-center">Venceu em</th>
                <th className="p-4 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {coupons.map((c) => (
                <tr key={c.id} className="text-sm bg-red-50/5">
                  <td className="p-4 opacity-70">
                    <p className="font-bold">{c.title}</p>
                    <p className="text-[10px] font-mono">{c.alphanumeric_code}</p>
                  </td>
                  <td className="p-4 opacity-70">{c.partners?.nome_estabelecimento}</td>
                  <td className="p-4 text-center font-bold text-red-600">
                    {new Date(c.expires_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                       <Link href={`/admin/coupons/edit/${c.id}`} className="p-2 bg-[#5D7084] text-white rounded-[3px] hover:bg-slate-700">
                          <Edit size={14}/>
                       </Link>
                       <button onClick={() => handleDelete(c.id)} className="p-2 bg-[#F04438] text-white rounded-[3px] hover:bg-red-700">
                          <Trash2 size={14}/>
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}