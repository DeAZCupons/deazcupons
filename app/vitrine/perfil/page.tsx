'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, User, Mail, Phone, MapPin, 
  Save, Loader2, Lock, ShieldCheck, X, Eye, EyeOff 
} from 'lucide-react'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditProfile() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  
  // Estados do Formulário de Perfil
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    whatsapp: '',
    phone: '',
    address: '',
    cpf_show: ''
  })

  // Estados para Troca de Senha
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  useEffect(() => {
    async function loadUserData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase.from('users').select('*').eq('id', user.id).single()
      if (data) {
        setFormData({
          full_name: data.full_name || '',
          email: data.email || '',
          whatsapp: data.whatsapp || '',
          phone: data.phone || '',
          address: data.address || '',
          cpf_show: data.cpf_encrypted ? '***.***.***-**' : 'Não informado'
        })
      }
      setLoading(false)
    }
    loadUserData()
  }, [router])

  // Função para salvar dados básicos
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const { error } = await supabase.from('users').update({
        full_name: formData.full_name,
        whatsapp: formData.whatsapp,
        phone: formData.whatsapp,
        address: formData.address,
      }).eq('id', user?.id)

      if (error) throw error
      await supabase.auth.updateUser({ data: { full_name: formData.full_name } })
      toast.success('Perfil atualizado!')
    } catch (error: any) {
      toast.error('Erro ao atualizar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Função para alterar senha no Supabase Auth
  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('As senhas não coincidem!')
      return
    }
    if (newPassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success('Senha alterada com sucesso!')
      setIsPasswordModalOpen(false)
      setNewPassword('')
      setConfirmPassword('')
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-[#00B9F2]" size={40} /></div>

  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.push('/vitrine')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600"><ArrowLeft size={24} /></button>
          <h1 className="text-xl font-bold text-slate-800">Editar Minha Conta</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 max-w-2xl">
        <form onSubmit={handleUpdateProfile} className="space-y-6">
          
          {/* Dados Pessoais */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-[#00B9F2]">
              <User size={20} />
              <h2 className="font-bold uppercase text-xs tracking-widest">Dados Cadastrais</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Nome Completo</label>
                <input required type="text" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B9F2] font-medium" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">E-mail</label>
                  <input disabled type="email" value={formData.email} className="w-full mt-1 px-4 py-3 bg-slate-100 rounded-2xl text-slate-500 cursor-not-allowed font-medium" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">CPF</label>
                  <input disabled type="text" value={formData.cpf_show} className="w-full mt-1 px-4 py-3 bg-slate-100 rounded-2xl text-slate-500 cursor-not-allowed font-medium" />
                </div>
              </div>
            </div>
          </div>

          {/* Contato */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-6 text-[#00B9F2]"><Phone size={20} /><h2 className="font-bold uppercase text-xs tracking-widest">Contato</h2></div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">WhatsApp / Celular</label>
                <input required type="text" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B9F2] font-medium" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Endereço</label>
                <input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                  className="w-full mt-1 px-4 py-3 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-[#00B9F2] font-medium" />
              </div>
            </div>
          </div>

          <button disabled={saving} className="w-full bg-[#00B9F2] text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:bg-[#009dc2] transition-all flex items-center justify-center gap-3">
            {saving ? <Loader2 className="animate-spin" /> : <Save size={22} />} Salvar Alterações
          </button>

          {/* Segurança */}
          <div className="bg-white p-6 rounded-[32px] flex items-center justify-between border border-slate-100">
            <div className="flex items-center gap-4 text-slate-700">
              <div className="bg-slate-100 p-2 rounded-xl"><Lock size={20} /></div>
              <div className="text-left"><p className="font-bold text-sm">Segurança</p><p className="text-xs text-slate-400">Troque sua senha de acesso</p></div>
            </div>
            <button type="button" onClick={() => setIsPasswordModalOpen(true)} className="bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Alterar Senha</button>
          </div>
        </form>
      </div>

      {/* --- MODAL DE ALTERAR SENHA --- */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPasswordModalOpen(false)} className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="fixed inset-x-4 bottom-10 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white z-[110] rounded-[32px] p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-800">Nova Senha</h3>
                <button onClick={() => setIsPasswordModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={18}/></button>
              </div>
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="relative">
                  <input required type={showPassword ? "text" : "password"} placeholder="Nova senha" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#00B9F2]" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-slate-400">{showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}</button>
                </div>
                <input required type={showPassword ? "text" : "password"} placeholder="Confirme a nova senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-slate-50 rounded-xl outline-none focus:ring-2 focus:ring-[#00B9F2]" />
                <button disabled={saving} className="w-full bg-[#00B9F2] text-white py-3.5 rounded-xl font-bold shadow-lg shadow-[#00B9F2]/20">{saving ? 'Atualizando...' : 'Confirmar Nova Senha'}</button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}