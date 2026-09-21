'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    // router.refresh() força o Next a revalidar o layout no servidor,
    // garantindo que o middleware/Server Component não use uma sessão em cache
    router.push('/login/parceiro')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium w-full text-left disabled:opacity-60"
    >
      <LogOut size={20} />
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  )
}
