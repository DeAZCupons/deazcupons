'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Edit, Trash2, Store } from 'lucide-react'

export default function TeamList() {
  const [team, setTeam] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { 
    fetchTeam() 
  }, [])

  async function fetchTeam() {
    setLoading(true)
    const { data } = await supabase
      .from('admin_users')
      .select('*')
      .order('full_name')
    
    if (data) setTeam(data)
    setLoading(false)
  }

  // FUNÇÃO CORRIGIDA (Removida a duplicata e unificada)
  async function handleDelete(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja remover o acesso de ${name}?`)) return

    try {
      const response = await fetch('/api/team/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      })

      if (response.ok) {
        setTeam(prev => prev.filter(m => m.id !== id))
        alert("Membro removido com sucesso!")
      } else {
        alert("Erro ao remover membro.")
      }
    } catch (error) {
      console.error("Erro ao deletar:", error)
      alert("Erro de conexão ao tentar remover.")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#101828]">Gestão da Equipe</h1>
        <Link href="/admin/config/team/new" className="bg-[#14D8B0] text-white px-6 py-2 rounded-sm flex items-center gap-2 hover:opacity-90 font-bold uppercase text-sm">
          <Plus size={20} /> Adicionar Membro
        </Link>
      </div>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-gray-400">Carregando equipe...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#F9FAFB] border-b">
              <tr className="text-[12px] text-[#7B8490] uppercase font-bold">
                <th className="p-4 w-16 text-center">ID</th>
                <th className="p-4">Nome / Usuário</th>
                <th className="p-4">Função</th>
                <th className="p-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {team.map((member, idx) => (
                <tr key={member.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-[#F9FAFB]'} text-sm hover:bg-blue-50/30 transition-colors`}>
                  <td className="p-4 text-center text-gray-400">{idx + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#3E506F] text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                        {member.full_name?.substring(0,2).toUpperCase() || '??'}
                      </div>
                      <div>
                        <p className="font-bold text-[#101828]">{member.full_name}</p>
                        <p className="text-[11px] text-[#7B8490]">@{member.username || 'sem-usuario'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${member.role === 'Administrador' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/config/team/edit/${member.id}`} className="p-2 text-[#7B8490] hover:text-blue-600 transition-colors">
                        <Edit size={16} />
                      </Link>                  

                      <button 
                        onClick={() => handleDelete(member.id, member.full_name)} 
                        className="p-2 text-[#7B8490] hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && team.length === 0 && (
          <div className="p-10 text-center text-gray-400">Nenhum membro cadastrado.</div>
        )}
      </div>
    </div>
  )
}