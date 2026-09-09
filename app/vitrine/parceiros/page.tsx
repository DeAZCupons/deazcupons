'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Building2, Search } from 'lucide-react'

export default function ParceirosPage() {
  const router = useRouter()
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  useEffect(() => {
    async function fetchData() {
      const { data } = await supabase
        .from('partners')
        .select(`
          id, 
          nome_estabelecimento, 
          logo_url,
          coupons(count)
        `)
        .order('nome_estabelecimento')

      if (data) {
        const formatted = data.map(p => ({
          ...p,
          couponCount: p.coupons?.[0]?.count || 0
        }))
        setPartners(formatted)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const groupedPartners = useMemo(() => {
    const filtered = activeFilter === 'All' 
      ? partners 
      : partners.filter(p => p.nome_estabelecimento.toUpperCase().startsWith(activeFilter))

    return filtered.reduce((acc: any, item: any) => {
      const letter = item.nome_estabelecimento[0].toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(item)
      return acc;
    }, {})
  }, [partners, activeFilter])

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="bg-white border-b h-20 flex items-center sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={24}/></button>
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">Lojas Parceiras</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        {/* Barra A-Z */}
        <div className="bg-white p-4 rounded-3xl border shadow-sm mb-10 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button onClick={() => setActiveFilter('All')} className={`px-4 h-10 rounded-xl font-bold ${activeFilter === 'All' ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-400'}`}>All</button>
            {alphabet.map(letter => (
              <button key={letter} onClick={() => setActiveFilter(letter)} className={`w-10 h-10 rounded-xl font-bold ${activeFilter === letter ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-400'}`}>{letter}</button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="space-y-12">
          {Object.keys(groupedPartners).sort().map(letter => (
            <div key={letter}>
              <h2 className="text-3xl font-black text-[#00B9F2] mb-6 border-b-4 border-[#00B9F2]/10 w-fit pr-8">{letter}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groupedPartners[letter].map((p: any) => (
                  <button 
                    key={p.id}
                    onClick={() => router.push(`/vitrine?parceiro=${p.id}`)}
                    className="flex items-center gap-4 p-4 bg-white rounded-3xl border hover:shadow-xl transition-all group"
                  >
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center p-2 border group-hover:border-[#00B9F2] transition-colors">
                      <img src={p.logo_url || 'https://via.placeholder.com/100'} alt={p.nome_estabelecimento} className="max-h-full max-w-full object-contain" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-slate-800 text-sm leading-tight">{p.nome_estabelecimento}</p>
                      <p className="text-[10px] font-bold text-[#00B9F2] uppercase tracking-wider mt-1">{p.couponCount} Cupons Disponíveis</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}