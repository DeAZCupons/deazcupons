'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Edit, Trash2, ChevronLeft, ChevronRight, ArrowUpDown, Filter } from 'lucide-react'

export default function PartnersList() {
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  
  // PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // FILTROS E ORDENAÇÃO
  const [sortConfig, setSortConfig] = useState({ field: 'nome_estabelecimento', direction: 'asc' })
  const [filterName, setFilterName] = useState('')
  const [filterCpf, setFilterCpf] = useState('')

  useEffect(() => {
    fetchPartners()
  }, [currentPage, sortConfig]) // Recarrega quando muda a página ou a ordem

  async function fetchPartners() {
    setLoading(true)
    try {
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = supabase
        .from('partners')
        .select('*', { count: 'exact' })
        // ORDENAÇÃO DINÂMICA
        .order(sortConfig.field, { ascending: sortConfig.direction === 'asc' })
        .range(from, to)

      if (filterName) query = query.ilike('nome_estabelecimento', `%${filterName}%`)
      if (filterCpf) query = query.ilike('cnpj_cpf', `%${filterCpf}%`)

      const { data, count, error } = await query

      if (error) throw error
      setPartners(data || [])
      setTotalCount(count || 0)
    } finally {
      setLoading(false)
    }
  }

  // Função para alternar a ordem ao clicar no cabeçalho (Visual Filter)
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="space-y-6">
      {/* Título e Breadcrumb mantidos... */}

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center justify-between px-[27px] border-b">
           <h2 className="text-[17px] font-medium text-[#101828]">Clientes Cadastrados</h2>
           <Link href="/admin/partners/new" className="bg-[#14D8B0] text-white px-4 py-2 rounded-sm text-xs font-bold uppercase hover:opacity-90">
             + Novo Cliente
           </Link>
        </div>

        {/* Filtros de Topo (Simplificados para dar espaço à tabela) */}
        <div className="p-6 bg-gray-50/50 border-b flex gap-4">
           <input 
             placeholder="Buscar por nome..." 
             className="border p-2 rounded text-sm w-64 outline-none focus:border-blue-400"
             value={filterName}
             onChange={e => setFilterName(e.target.value)}
             onKeyUp={e => e.key === 'Enter' && fetchPartners()}
           />
           <button onClick={fetchPartners} className="bg-[#5D7084] text-white px-4 rounded text-xs font-bold uppercase">Filtrar</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-white border-b-2">
              <tr className="text-[11px] text-[#7B8490] font-bold uppercase">
                <th className="p-4 cursor-pointer hover:text-blue-600 transition-colors" onClick={() => handleSort('nome_estabelecimento')}>
                   <div className="flex items-center gap-1">
                     NOME {sortConfig.field === 'nome_estabelecimento' && <ArrowUpDown size={12}/>}
                   </div>
                </th>
                <th className="p-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('cnpj_cpf')}>
                   <div className="flex items-center gap-1">
                     CNPJ/CPF <Filter size={10} className="text-gray-300"/>
                   </div>
                </th>
                <th className="p-4">EMAIL</th>
                <th className="p-4 cursor-pointer hover:text-blue-600" onClick={() => handleSort('data_fim_plano')}>
                   VENCIMENTO {sortConfig.field === 'data_fim_plano' && <ArrowUpDown size={12}/>}
                </th>
                <th className="p-4 text-center">AÇÕES</th>
              </tr>
            </thead>
            <tbody className="divide-y text-[13px] text-[#475467]">
              {partners.map((partner) => (
                <tr key={partner.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="p-4 font-medium text-[#101828]">{partner.nome_estabelecimento}</td>
                  <td className="p-4">{partner.cnpj_cpf}</td>
                  <td className="p-4">{partner.email}</td>
                  <td className={`p-4 font-bold ${new Date(partner.data_fim_plano) < new Date() ? 'text-red-500' : 'text-green-600'}`}>
                    {partner.data_fim_plano ? new Date(partner.data_fim_plano).toLocaleDateString('pt-BR') : '---'}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <Link href={`/admin/partners/edit/${partner.id}`} className="p-1.5 bg-[#5D7084] text-white rounded"><Edit size={14}/></Link>
                      <button className="p-1.5 bg-[#F04438] text-white rounded"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ: PAGINAÇÃO */}
        <div className="p-6 border-t flex items-center justify-between bg-gray-50/50">
          <p className="text-[12px] text-[#7B8490]">
            Mostrando <span className="font-bold text-[#101828]">{partners.length}</span> de <span className="font-bold text-[#101828]">{totalCount}</span> clientes
          </p>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-2 border rounded bg-white disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft size={16}/>
            </button>
            
            <div className="flex gap-1">
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-xs font-bold transition-all ${
                    currentPage === i + 1 
                      ? 'bg-[#3E506F] text-white shadow-md' 
                      : 'bg-white border text-[#7B8490] hover:bg-gray-100'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-2 border rounded bg-white disabled:opacity-30 hover:bg-gray-100 transition-colors"
            >
              <ChevronRight size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}