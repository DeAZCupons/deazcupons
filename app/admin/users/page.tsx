'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Users, Mail, Phone, ShieldCheck, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

export default function UsersList() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
  // Escuta mudanças na tabela users
    const channel = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'users' }, () => {
        fetchUsers(); // Recarrega a lista automaticamente
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, []);

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) setUsers(data)
    setLoading(false)
  }

  const filteredUsers = users.filter(u => 
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex gap-2 text-[13px] text-[#7B8490]">
        <span>Home</span> <span>{'>'}</span> <span className="text-gray-400">Gestão de Usuários</span>
      </div>

      <div className="bg-white shadow-sm border border-[#E9EDF1] rounded-sm">
        <div className="h-[70px] flex items-center justify-between px-[27px] border-b">
          <div className="flex items-center gap-2">
            <Users className="text-[#3E506F]" size={20} />
            <h2 className="text-[17px] font-medium text-[#101828]">Usuários Cadastrados (Clientes Finais)</h2>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Buscar por nome ou e-mail..." 
              className="pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:border-blue-400 w-64"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ShieldCheck className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="p-[27px] overflow-x-auto">
          <table className="w-full text-left border-collapse border border-[#F2F4F7]">
            <thead className="bg-[#F9FAFB] text-[12px] text-[#7B8490] uppercase">
              <tr>
                <th className="p-4 border-b">Nome / E-mail</th>
                <th className="p-4 border-b">WhatsApp / Tel</th>
                <th className="p-4 border-b">CPF (Criptografado)</th>
                <th className="p-4 border-b">Cadastro em</th>
                <th className="p-4 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2F4F7]">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="text-sm hover:bg-gray-50 transition-colors">
                  <td className="p-4">
                    <p className="font-bold text-[#101828]">{user.full_name}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1"><Mail size={12}/> {user.email}</p>
                  </td>
                  <td className="p-4">
                    <p className="flex items-center gap-1 text-green-600 font-medium"><Phone size={12}/> {user.whatsapp || 'N/A'}</p>
                    <p className="text-[10px] text-gray-400 pl-4">{user.phone || ''}</p>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 px-2 py-1 rounded text-[10px] font-mono text-gray-500 truncate block max-w-[120px]">
                      {user.cpf_encrypted?.substring(0, 15)}...
                    </span>
                  </td>
                  <td className="p-4 text-gray-500">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                       <Link href={`/admin/users/edit/${user.id}`} className="p-2 text-gray-400 hover:text-blue-600"><Edit size={18}/></Link>
                       <button className="p-2 text-gray-400 hover:text-red-600"><Trash2 size={18}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {loading && <p className="text-center py-10 text-gray-400 animate-pulse">Carregando lista de usuários...</p>}
        </div>
      </div>
    </div>
  )
}