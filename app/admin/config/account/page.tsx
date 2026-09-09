'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, UserCircle } from 'lucide-react'

export default function MyAccount() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)

  // Estado inicial limpo para evitar erros de controlled input
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'Administrador'
  })

  const roles = ['Administrador', 'Gestor', 'Estagiário', 'Secretária']

  useEffect(() => {
    fetchProfile()
  }, [])

  async function fetchProfile() {
        try {
        setLoadingData(true)
        
        // 1. Pega o usuário logado no momento
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
            // 2. Busca os detalhes na tabela admin_users
            const { data: adminData, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', user.id)
            .single()

            if (adminData) {
            setFormData({
                full_name: adminData.full_name || '',
                email: user.email || '',
                username: adminData.username || '',
                password: '', // Senha nunca deve vir do banco
                role: adminData.role || 'Administrador'
            })
            }
        }
        } catch (error) {
        console.error("Erro ao carregar perfil:", error)
        } finally {
        setLoadingData(false)
        }
    }

    async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
        // 1. Verifica a sessão atual de forma segura
        const { data: { session } } = await supabase.auth.getSession()
        const user = session?.user

        if (!user) {
        alert("Sua sessão expirou. Por favor, saia e entre novamente.")
        router.push('/')
        return
        }

        // 2. Atualizar dados na tabela admin_users
        const { error: dbError } = await supabase
        .from('admin_users')
        .update({
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role
        })
        .eq('id', user.id)

        if (dbError) throw dbError

        // 3. Só tenta atualizar a senha se o campo não estiver vazio
        if (formData.password.trim() !== '') {
        if (formData.password.length < 6) {
            alert("A senha deve ter pelo menos 6 caracteres.")
            setLoading(false)
            return
        }

        const { error: authError } = await supabase.auth.updateUser({
            password: formData.password
        })
        
        if (authError) throw authError
        alert("Perfil e senha atualizados com sucesso!")
        } else {
        alert("Perfil atualizado com sucesso!")
        }

        setFormData(prev => ({ ...prev, password: '' })) 

    } catch (error: any) {
        console.error("Erro completo:", error)
        alert("Erro ao salvar: " + (error.message || "Erro desconhecido"))
    } finally {
        setLoading(false)
    }
    }

  const labelStyle = "block text-[14px] text-[#7B8490] mb-2 font-medium"
  const inputStyle = "w-full h-[45px] border border-[#C8D2DC] rounded-[3px] px-4 text-[#1C2733] outline-none focus:border-blue-400 bg-white disabled:bg-gray-50"

  if (loadingData) return <div className="p-20 text-center text-gray-500 animate-pulse font-medium uppercase tracking-widest">Carregando dados...</div>

  return (
    <div className="max-w-4xl space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[13px] text-[#7B8490]">
        <button onClick={() => router.push('/admin')} className="hover:underline">Home</button>
        <span>{'>'}</span>
        <span className="text-gray-400">Minha Conta</span>
      </div>

      <div className="bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] rounded-sm border border-[#E9EDF1]">
        <div className="h-[70px] flex items-center px-8 border-b">
          <h2 className="text-[17px] font-medium text-[#101828]">Editar Minha Conta</h2>
        </div>

        <form onSubmit={handleUpdate} className="p-8 space-y-6">
          
          {/* Nome */}
          <div>
            <label className={labelStyle}>Nome:</label>
            <input 
              required type="text" className={inputStyle} 
              value={formData.full_name} 
              onChange={e => setFormData({...formData, full_name: e.target.value})} 
            />
          </div>

          {/* E-mail (Somente Leitura) */}
          <div>
            <label className={labelStyle}>E-mail:</label>
            <input 
              disabled type="email" className={inputStyle} 
              value={formData.email} 
            />
            <p className="text-[10px] text-gray-400 mt-1 italic">* O e-mail é sua chave de acesso e não pode ser alterado aqui.</p>
          </div>

          {/* Usuário */}
          <div>
            <label className={labelStyle}>Usuário:</label>
            <input 
              required type="text" className={inputStyle} 
              value={formData.username} 
              onChange={e => setFormData({...formData, username: e.target.value})} 
            />
          </div>

          {/* Senha */}
          <div>
            <label className={labelStyle}>Senha (deixe em branco para não alterar):</label>
            <input 
              type="password" 
              className={`${inputStyle} bg-blue-50/30`} 
              placeholder="••••••••"
              value={formData.password} 
              onChange={e => setFormData({...formData, password: e.target.value})} 
            />
          </div>

          {/* Função */}
          <div>
            <label className={labelStyle}>Função:</label>
            <select 
              required className={inputStyle} 
              value={formData.role} 
              onChange={e => setFormData({...formData, role: e.target.value})}
            >
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          {/* Botão */}
          <div className="pt-4">
            <button 
              type="submit" disabled={loading} 
              className="bg-[#14D8B0] text-white px-8 h-[45px] rounded-[3px] font-bold hover:opacity-90 transition-all uppercase text-sm"
            >
              {loading ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}