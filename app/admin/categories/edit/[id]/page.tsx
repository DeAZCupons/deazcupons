'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

export default function CategoryForm() {
  const router = useRouter()
  const params = useParams()
  const categoryId = params?.id as string
  const isEditing = !!categoryId

  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')

  useEffect(() => {
    if (isEditing) fetchCategory()
  }, [categoryId])

  async function fetchCategory() {
    const { data } = await supabase.from('categories').select('*').eq('id', categoryId).single()
    if (data) {
      setName(data.name)
      setSlug(data.slug)
    }
  }

  // Gera o slug automaticamente enquanto digita o nome
  function handleNameChange(val: string) {
    setName(val)
    if (!isEditing) {
      const generatedSlug = val.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '-')
      setSlug(generatedSlug)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const payload = { name, slug }

    const { error } = isEditing 
      ? await supabase.from('categories').update(payload).eq('id', categoryId)
      : await supabase.from('categories').insert([payload])

    if (error) alert("Erro: " + error.message)
    else {
      alert(isEditing ? "Categoria atualizada!" : "Categoria criada!")
      router.push('/admin/categories')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black">
        <ArrowLeft size={18}/> Voltar
      </button>

      <div className="bg-white shadow-sm border border-[#E9EDF1]">
        <div className="h-[70px] flex items-center px-8 border-b bg-gray-50/50">
          <h2 className="text-[17px] font-medium text-[#101828]">
            {isEditing ? `Editar Categoria: ${name}` : 'Cadastrar Nova Categoria'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[#7B8490] uppercase mb-2">Nome da Categoria:</label>
            <input 
              required type="text" value={name} 
              className="w-full h-[45px] border border-[#C8D2DC] rounded-md px-4 text-[#1C2733] outline-none focus:border-blue-500" 
              onChange={e => handleNameChange(e.target.value)} 
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#7B8490] uppercase mb-2">Slug (URL amigável):</label>
            <input 
              required type="text" value={slug} 
              className="w-full h-[45px] border border-[#C8D2DC] rounded-md px-4 text-blue-600 bg-gray-50 outline-none" 
              onChange={e => setSlug(e.target.value)}
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">O slug é usado para criar o link no site (ex: /categorias/restaurantes)</p>
          </div>

          <button type="submit" disabled={loading} className="bg-[#3E506F] text-white px-10 h-[50px] rounded font-bold hover:bg-[#2A3952] transition-colors uppercase text-sm flex items-center gap-2">
            <Save size={18} /> {loading ? 'Processando...' : 'Salvar Categoria'}
          </button>
        </form>
      </div>
    </div>
  )
}