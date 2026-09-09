'use client'
import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, LayoutGrid, ChevronRight, Search, Tag } from 'lucide-react'

export default function CategoriasPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('All')

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

  useEffect(() => {
    async function fetchData() {
      // Buscamos categorias e a contagem de cupons ativos para cada uma
      const { data, error } = await supabase
        .from('categories')
        .select(`
          id, 
          name, 
          coupons(count)
        `)
        .order('name')

      if (data) {
        // Formatamos o retorno para facilitar o uso do count
        const formatted = data.map(cat => ({
          ...cat,
          couponCount: cat.coupons?.[0]?.count || 0
        }))
        setCategories(formatted)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  // Agrupamento por letra inicial
  const groupedCategories = useMemo(() => {
    const filtered = activeFilter === 'All' 
      ? categories 
      : categories.filter(c => c.name.toUpperCase().startsWith(activeFilter))

    return filtered.reduce((acc: any, item: any) => {
      const letter = item.name[0].toUpperCase()
      if (!acc[letter]) acc[letter] = []
      acc[letter].push(item)
      return acc;
    }, {})
  }, [categories, activeFilter])

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      <header className="bg-white border-b h-20 flex items-center sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-all"><ArrowLeft size={24}/></button>
          <h1 className="text-xl font-black italic tracking-tighter uppercase text-slate-800">Categorias</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 mt-8">
        {/* Filtro Alfabético */}
        <div className="bg-white p-4 rounded-3xl border shadow-sm mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${activeFilter === 'All' ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-400'}`}
            >All</button>
            {alphabet.map(letter => (
              <button 
                key={letter}
                onClick={() => setActiveFilter(letter)}
                className={`w-10 h-10 rounded-xl font-bold text-xs transition-all ${activeFilter === letter ? 'bg-[#00B9F2] text-white' : 'bg-slate-100 text-slate-400'}`}
              >{letter}</button>
            ))}
          </div>
        </div>

        {/* Lista Agrupada */}
        <div className="space-y-10">
          {Object.keys(groupedCategories).sort().map(letter => (
            <div key={letter} className="space-y-4">
              <h2 className="text-2xl font-black text-[#00B9F2] border-b-2 border-[#00B9F2]/10 pb-2">{letter}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groupedCategories[letter].map((cat: any) => (
                  <button 
                    key={cat.id}
                    onClick={() => router.push(`/vitrine?categoria=${cat.id}`)}
                    className="flex items-center justify-between p-5 bg-white rounded-2xl border hover:border-[#00B9F2] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[#00B9F2]/10 rounded-xl flex items-center justify-center text-[#00B9F2] group-hover:bg-[#00B9F2] group-hover:text-white transition-all">
                        <LayoutGrid size={20} />
                      </div>
                      <span className="font-bold text-slate-700">{cat.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">({cat.couponCount} Cupons)</span>
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