'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { Plus, Edit, Trash2, FolderTree } from 'lucide-react'

export default function CategoriesList() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCategories() }, [])

  async function fetchCategories() {
    const { data } = await supabase.from('categories').select('*').order('name')
    if (data) setCategories(data)
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("Atenção: Se você excluir esta categoria, verifique se não há parceiros vinculados a ela. Confirmar exclusão?")) return
    
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) alert("Erro: " + error.message)
    else setCategories(categories.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-[#101828]">Categorias de Negócio</h1>
        <Link href="/admin/categories/new" className="bg-[#5D7084] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#4A596A] transition-colors uppercase text-sm font-bold">
          <Plus size={20} /> Nova Categoria
        </Link>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#E9EDF1]">
        <table className="w-full text-left border-collapse">
          <thead className="bg-[#F9FAFB] border-b border-[#E9EDF1]">
            <tr className="text-[12px] text-[#7B8490] uppercase font-bold">
              <th className="p-4 w-16 text-center">Ícone</th>
              <th className="p-4">Nome da Categoria</th>
              <th className="p-4">Slug (URL)</th>
              <th className="p-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F2F4F7]">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50 text-sm">
                <td className="p-4 text-center">
                   <div className="w-10 h-10 bg-gray-50 rounded flex items-center justify-center mx-auto border border-gray-100">
                      <FolderTree size={18} className="text-[#3E506F]" />
                   </div>
                </td>
                <td className="p-4 font-bold text-[#101828]">{cat.name}</td>
                <td className="p-4 font-mono text-xs text-blue-600">{cat.slug}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-3">
                    <Link href={`/admin/categories/edit/${cat.id}`} className="p-2 text-[#7B8490] hover:text-blue-600">
                      <Edit size={18} />
                    </Link>
                    <button onClick={() => handleDelete(cat.id)} className="p-2 text-[#7B8490] hover:text-red-600">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <p className="text-center py-10 animate-pulse">Carregando categorias...</p>}
      </div>
    </div>
  )
}