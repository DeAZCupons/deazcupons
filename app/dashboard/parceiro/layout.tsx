import { ReactNode } from 'react';
import Link from 'next/link';
import { LayoutDashboard, PlusCircle, QrCode, History, MessageCircle } from 'lucide-react';
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LogoutButton from './components/LogoutButton'

export default async function PartnerLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // Se não tem sessão, manda pro login
  if (!session) {
    redirect('/login/parceiro')
  }

  // VERIFICAÇÃO CRUCIAL: Este usuário é um parceiro?
  const { data: partner } = await supabase
    .from('partners')
    .select('id')
    .eq('user_id', session.user.id)
    .single()

  // Se não encontrar o ID dele na tabela de parceiros, expulsa
  if (!partner) {
    redirect('/login/parceiro?error=not_a_partner')
  }

  const menuItems = [
    { label: 'Início', icon: LayoutDashboard, href: '/dashboard/parceiro' },
    { label: 'Validar Cupom', icon: QrCode, href: '/dashboard/parceiro/validar' },
    { label: 'Novo Cupom', icon: PlusCircle, href: '/dashboard/parceiro/novo-cupom' },
    { label: 'Relatórios', icon: History, href: '/dashboard/parceiro/relatorios' },
    { label: 'Minhas Solicitações', icon: History, href: '/dashboard/parceiro/solicitacoes' },
  ];

  return (
    <div className="flex min-h-screen bg-[#F2F0EF]">
      {/* Sidebar Desktop */}
      <aside className="w-64 bg-white border-r hidden md:flex flex-col">
        <div className="p-6 border-b">
          <img src="https://deazcupons.com.br/dashboard/assets/images/logo-dark.svg"></img>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center gap-3 p-3 text-gray-600 hover:bg-[#00B9F2]/10 hover:text-[#00B9F2] rounded-lg transition-colors font-medium"
            >
              <item.icon size={20} />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <Link 
            href="https://wa.me/5531996899744" 
            target="_blank"
            className="flex items-center gap-3 p-3 text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium w-full"
          >
            <MessageCircle size={20} />
            Suporte
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-2 z-50">
         {menuItems.map((item) => (
            <Link key={item.href} href={item.href} className="flex flex-col items-center p-2 text-gray-500 hover:text-[#00B9F2]">
              <item.icon size={20} />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          ))}
      </nav>
    </div>
  );
}
