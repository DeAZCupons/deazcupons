'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Ticket, Clock, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'

export default function ExpiringCoupons() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchExpiring() }, [])

  async function fetchExpiring() {
    const today = new Date().toISOString()
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const { data } = await supabase
      .from('coupons')
      .select('*, partners(nome_estabelecimento)')
      .gte('expires_at', today)
      .lte('expires_at', nextWeek.toISOString())
      .order('expires_at', { ascending: true })

    if (data) setCoupons(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Excluir este cupom permanentemente?")) return
    const { error } = await supabase.from('coupons').delete().eq('id', id)
    if (!error) {
      setCoupons(prev => prev.filter(c => c.id !== id))
      alert("Cupom removido.")
    }
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho mantido... */}
      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center px-8 border-b bg-orange-50/20">
          <Clock className="text-orange-500 mr-2" size={20} />
          <h2 className="text-[17px] font-medium text-[#101828]">Relatório: Vencem em até 7 dias</h2>
        </div>

        <div className="p-8">
          <table className="w-full text-left border-collapse border border-[#F2F4F7]">
            <thead className="bg-[#F9FAFB]">
              <tr className="text-[11px] text-[#7B8490] uppercase font-bold">
                <th className="p-4 border-b">Cupom</th>
                <th className="p-4 border-b">Parceiro</th>
                <th className="p-4 border-b text-center">Vencimento</th>
                <th className="p-4 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {coupons.map((c) => (
                <tr key={c.id} className="text-sm hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-bold text-[#101828]">{c.title}</p>
                    <p className="text-[10px] font-mono text-blue-500 uppercase">{c.alphanumeric_code}</p>
                  </td>
                  <td className="p-4 text-[#475467]">{c.partners?.nome_estabelecimento}</td>
                  <td className="p-4 text-center font-bold text-orange-600">
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
          {coupons.length === 0 && !loading && <p className="text-center py-10 text-gray-400 italic">Nenhum cupom nesta lista.</p>}
        </div>
      </div>
    </div>
  )
}