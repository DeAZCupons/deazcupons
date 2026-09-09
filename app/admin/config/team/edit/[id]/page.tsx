'use client'
import { useState, useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'

export default function EditTeamMember() {
  const router = useRouter()
  const params = useParams()
  const memberId = params?.id as string

  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '', email: '', username: '', password: '', role: 'Secretária'
  })

  useEffect(() => {
    if (memberId) fetchMember()
  }, [memberId])

  async function fetchMember() {
    const { data } = await supabase.from('admin_users').select('*').eq('id', memberId).single()
    if (data) setFormData({ ...data, password: '' })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/team/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: memberId, ...formData })
      });

      // VERIFICAÇÃO 1: O servidor sequer respondeu algo válido?
      if (!response.ok) {
        const text = await response.text(); // Pega o erro como texto (pode ser um erro 404 em HTML)
        console.error("Resposta do servidor:", text);
        alert(`Erro ${response.status}: A rota de atualização não foi encontrada ou falhou.`);
        setLoading(false);
        return;
      }

      // VERIFICAÇÃO 2: Tenta ler o JSON com segurança
      const result = await response.json().catch(() => null);
      
      if (result && result.success) {
        alert("Acesso atualizado com sucesso!");
        router.push('/admin/config/team');
        router.refresh();
      } else {
        alert("Erro ao atualizar: " + (result?.error || "Resposta inválida do servidor"));
      }
    } catch (err: any) {
      alert("Erro de conexão: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  const labelStyle = "block text-[14px] text-[#7B8490] mb-2 font-medium"
  const inputStyle = "w-full h-[45px] border border-[#C8D2DC] rounded-[3px] px-4 text-[#1C2733] outline-none focus:border-blue-400 bg-white"

  return (
    <div className="max-w-4xl space-y-6">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-black">
        <ArrowLeft size={18}/> Voltar para a lista
      </button>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm p-8">
        <h2 className="text-[17px] font-medium text-[#101828] mb-8 border-b pb-4 text-center">Editar Acesso: {formData.full_name}</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Nome Completo:</label>
              <input required type="text" className={inputStyle} value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>E-mail (Login):</label>
              <input required type="email" className={inputStyle} value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className={labelStyle}>Usuário (Username):</label>
              <input required type="text" className={inputStyle} value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
            </div>
            <div>
              <label className={labelStyle}>Nova Senha (deixe em branco para manter):</label>
              <input type="password" placeholder="••••••••" className={inputStyle} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Função no Dashboard:</label>
            <select className={inputStyle} value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="Administrador">Administrador</option>
              <option value="Gestor">Gestor</option>
              <option value="Estagiário">Estagiário</option>
              <option value="Secretária">Secretária</option>
            </select>
          </div>

          <button type="submit" disabled={loading} className="bg-[#14D8B0] text-white px-10 h-[50px] rounded-[3px] font-bold hover:opacity-90 transition-all uppercase text-sm">
            {loading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </form>
      </div>
    </div>
  )
}