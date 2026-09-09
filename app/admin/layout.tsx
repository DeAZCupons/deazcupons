'use client'

import { useState, useEffect } from 'react'
import {
  LayoutDashboard,
  Edit,
  Menu,
  Copy,
  Target,
  Sun,
  Moon,
  Monitor,
  Settings,
  Bell,
  User,
  LogOut,
  Users,
  FolderTree,
  ShieldCheck,
  UserCircle,
  TicketPercent
  // UserRoundPlus
} from 'lucide-react'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

import { useTheme } from 'next-themes'

import { supabase } from '@/lib/supabase'

import { Toaster, toast } from "sonner"; 


export default function AdminLayout({  children}: {  children: React.ReactNode}) {

  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  
  const pathname = usePathname()
  const router = useRouter()

  // =========================================================
  // TEMA
  // =========================================================

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // =========================================================
  // MENUS DO HEADER
  // =========================================================

  const [openMenu, setOpenMenu] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])
 
  // =========================================================
  // REALTIME NOTIFICATIONS
  // =========================================================
  useEffect(() => {
    fetchNotifications()
    
    const channel = supabase
      .channel('admin-notifications')
      .on(
        'postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications' }, 
        (payload) => {
          // 1. Atualiza a lista e o contador automaticamente
          fetchNotifications()

          // 2. Dispara o alerta visual (Toast)
          toast.success("🚀 Novo Lead de Parceiro!", {
            description: payload.new.message,
            action: {
              label: "Ver agora",
              onClick: () => router.push("/admin/leads")
            },
          })

          // 3. Opcional: Som de notificação
          const audio = new Audio('/notification.mp3') // Se você tiver o arquivo na pasta public
          audio.play().catch(() => {})
        }
      )
      .subscribe()

    return () => { 
      supabase.removeChannel(channel) 
    }
  }, [])

  async function fetchNotifications() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.is_read).length)
    }
  }

  async function markAsRead(id: string) {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    fetchNotifications()
  }

  // =========================================================
  // LOGOUT
  // =========================================================

  async function handleLogout() {

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Erro ao sair:', error)
      alert('Não foi possível sair do sistema.')
      return
    }

    router.push('/')
  }

  // =========================================================
  // ABRIR / FECHAR MENUS DO HEADER
  // =========================================================

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  // =========================================================
  // ESTILOS DOS MENUS
  // =========================================================

  const menuStyleOriginal =
    "absolute right-0 mt-2 w-56 bg-white dark:bg-[#1e293b] border border-[#E9EDF1] dark:border-slate-700 shadow-xl rounded-md overflow-hidden z-[100] animate-in fade-in zoom-in duration-200"

  const itemStyleOriginal =
    "flex items-center gap-3 px-4 py-3 text-sm text-[#475467] dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"

  // =========================================================
  // MENU DE NAVEGAÇÃO
  // =========================================================

  const navigation = [

    {
      section: 'NAVIGATION',

      items: [

        {
          id: 'dashboard',
          label: 'Dashboard',
          icon: <LayoutDashboard size={20} />,
          route: '/admin'
        }

      ]
    },

    {
      section: 'PAINEL DE CONTROLE',

      items: [

        {
          id: 'clientes',
          label: 'Clientes',
          icon: <Edit size={20} />,
          route: '/admin/partners',

          children: [

            {
              label: 'Listagem de clientes',
              route: '/admin/partners'
            },

            {
              label: 'Adicionar Cliente',
              route: '/admin/partners/new'
            }

          ]
        },

        {
          id: 'leads',
          label: 'Interessados (Leads)',
          icon: <TicketPercent size={20} />, // Importe o Target do lucide-react
          route: '/admin/leads'
        },

        {
          id: 'cupons',
          label: 'Menu cupons',
          icon: <Menu size={20} />,
          route: '/admin/coupons',

          children: [

            {
              label: 'Cupons cadastrados',
              route: '/admin/coupons'
            },

            {
              label: 'Adicionar Cupons',
              route: '/admin/coupons/new'
            },

            {
              label: 'Cupons a vencer',
              route: '/admin/coupons/expiring'
            },

            {
              label: 'Cupons vencidos',
              route: '/admin/coupons/expired'
            }

          ]
        },

        {
          id: 'categorias',
          label: 'Categorias',
          icon: <FolderTree size={20} />,
          route: '/admin/categories'
        },

        {
          id: 'usuarios',
          label: 'Usuários',
          icon: <Users size={20} />,
          route: '/admin/users'
        },

        {
          id: 'vincular',
          label: 'Solicitações de Cupons',
          icon: <Copy size={20} />,
          route: '/admin/solicitacoes'
        },

        {
          id: 'insta',
          label: 'Controle Instagram',
          icon: <Target size={20} />,
          route: '#'
        },

        {
          id: 'mkt',
          label: 'Plano de Marketing',
          icon: <Target size={20} />,
          route: '#'
        }

      ]
    }

  ]

  // =========================================================
  // VERIFICAÇÃO DOS MENUS ATIVOS
  // =========================================================

  const clientsMenuActive =
    pathname.startsWith('/admin/partners')

  const couponsMenuActive =
    pathname.startsWith('/admin/coupons')

  if (!mounted) return null

  // Estilo unificado para os dropdowns - Agora com Dark Mode fiel ao PHP
  const menuStyle = "absolute right-0 mt-2 w-56 bg-white dark:bg-[#2a2a2a] border border-[#E9EDF1] dark:border-[#333] shadow-xl rounded-md overflow-hidden z-[100] animate-in fade-in zoom-in duration-200"
  const itemStyle = "flex items-center gap-3 px-4 py-3 text-sm text-[#475467] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#333] transition-colors cursor-pointer"

  return (

<div className="flex min-h-screen font-sans bg-[#F3F6F9] dark:bg-[#1a1a1a] transition-colors duration-300">
  
  {/* SIDEBAR */}
  <aside className="w-[285px] fixed left-0 top-0 h-screen flex flex-col z-50 bg-[#3E506F] dark:bg-[#1e293b]">

        {/* LOGO */}

        <div className="p-8 pb-4">

          <img
            src="https://deazcupons.com.br/dashboard/assets/images/logo-white.svg"
            alt="De AZ"
            className="w-[235px]"
          />

        </div>


        {/* ===================================================
            MENU PRINCIPAL
        =================================================== */}

        <nav className="flex-1 sidebar-scroll px-0">

          {navigation.map((sec) => (

            <div
              key={sec.section}
              className="mb-4"
            >

              <p className="text-[11px] font-bold text-[#B7C4D8] px-8 mb-2 tracking-wider uppercase opacity-50">
                {sec.section}
              </p>


              {sec.items.map((item) => {

                const isActive =
                  pathname === item.route ||
                  pathname.startsWith(`${item.route}/`)

                return (

                  <div
                    key={item.id}
                    className="relative group"
                  >

                    {/* INDICADOR AZUL */}

                    {isActive && (

                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00B9F2]" />

                    )}


                    {/* ITEM PRINCIPAL */}

                    <Link
                      href={item.route}
                      className={`flex items-center gap-3 px-8 py-3 transition-all ${
                        isActive
                          ? 'bg-[#344560] text-white'
                          : 'text-[#B7C4D8] hover:text-white hover:bg-[#344560]'
                      }`}
                    >

                      <span
                        className={
                          isActive
                            ? 'text-white'
                            : 'text-[#B7C4D8] group-hover:text-white'
                        }
                      >
                        {item.icon}
                      </span>

                      <span className="text-[14px] font-medium">
                        {item.label}
                      </span>

                    </Link>


                    {/* SUBMENU */}

                    {item.children &&
                      (isActive || pathname.startsWith(item.route)) && (

                        <div className="bg-[#344560]/30 py-2">

                          {item.children.map((child) => {

                            const isChildActive =
                              pathname === child.route

                            return (

                              <Link
                                key={child.label}
                                href={child.route}
                                className="flex items-center gap-3 pl-12 py-2 group/child"
                              >

                                {/* BOLINHA */}

                                <div
                                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                                    isChildActive
                                      ? 'bg-[#00B9F2]'
                                      : 'bg-[#B7C4D8] group-hover/child:bg-white'
                                  }`}
                                />

                                <span
                                  className={`text-[13px] ${
                                    isChildActive
                                      ? 'text-white font-bold'
                                      : 'text-[#B7C4D8] group-hover/child:text-white'
                                  }`}
                                >
                                  {child.label}
                                </span>

                              </Link>

                            )
                          })}

                        </div>

                      )}

                  </div>

                )
              })}

            </div>

          ))}

        </nav>


        {/* ===================================================
            BOTÃO SAIR
        =================================================== */}

        <div className="p-4 border-t border-white/5">

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-8 py-4 text-[#B7C4D8] hover:text-white w-full transition-colors"
          >

            <LogOut size={18} />

            <span className="text-sm font-medium">
              Sair do Sistema
            </span>

          </button>

        </div>

      </aside>


      {/* =====================================================
          CONTEÚDO PRINCIPAL
      ===================================================== */}

      <div className="flex-1 ml-[285px]">


        {/* ===================================================
            HEADER
        =================================================== */}

        <header className="h-[65px] flex items-center justify-between px-10 bg-white dark:bg-[#252525] border-b border-[#E9EDF1] dark:border-[#333] transition-colors">

          {/* =================================================
              LADO ESQUERDO
          ================================================= */}

          <div className="flex items-center gap-6 text-[#7B8490]">

            <Menu
              className="cursor-pointer"
              size={24}
            />

            <div className="relative">

              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm w-64 dark:text-white placeholder:text-[#7B8490]"
              />

            </div>

          </div>

 

          {/* =================================================
              LADO DIREITO
          ================================================= */}

          <div className="flex items-center gap-2">
            
  {/* 1. TEMA */}
  <div className="relative">
    <button onClick={() => toggleMenu('theme')} className="p-2 text-[#7B8490] hover:text-[#3E506F] dark:hover:text-white">
      {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
    </button>
    {openMenu === 'theme' && (
      <div className={menuStyle}>
        <div className="p-2 text-[10px] font-bold text-gray-400 uppercase px-4 py-2 border-b dark:border-[#333]">Modo de Exibição</div>
        <button onClick={() => {setTheme('light'); setOpenMenu(null)}} className={itemStyle}><Sun size={16}/> Light</button>
        <button onClick={() => {setTheme('dark'); setOpenMenu(null)}} className={itemStyle}><Moon size={16}/> Dark</button>
        <button onClick={() => {setTheme('system'); setOpenMenu(null)}} className={itemStyle}><Monitor size={16}/> Default</button>
      </div>
    )}
  </div>

  {/* 2. CONFIGURAÇÕES */}
  <div className="relative">
    <button onClick={() => toggleMenu('settings')} className="p-2 text-[#7B8490] hover:text-[#3E506F]">
      <Settings size={20} />
    </button>
    {openMenu === 'settings' && (
      <div className={menuStyle}>
        <div className="p-2 text-[10px] font-bold text-gray-400 uppercase px-4 py-2 border-b dark:border-[#333]">Sistema</div>
        <button className={itemStyle} onClick={() => { setOpenMenu(null); router.push('/admin/config/account') }}><UserCircle size={16}/> Minha Conta</button>
        <button className={itemStyle} onClick={() => { setOpenMenu(null); router.push('/admin/config/team') }}><Users size={16}/> Equipe</button>
        <button className={itemStyle} onClick={() => { setOpenMenu(null); router.push('/admin/config/roles') }}><ShieldCheck size={16}/> Funções</button>
      </div>
    )}
  </div>

  {/* 3. NOTIFICAÇÕES (CORRIGIDO: APENAS UM BLOCO) */}
  <div className="relative">
    <button onClick={() => toggleMenu('notifications')} className="p-2 text-[#7B8490] relative">
      <Bell size={20} />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-[#14D8B0] text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center border-2 border-white dark:border-[#252525]">
          {unreadCount}
        </span>
      )}
    </button>
    {openMenu === 'notifications' && (
      <div className={`${menuStyle} w-80`}>
        <div className="p-4 font-bold text-xs border-b dark:border-[#333] dark:text-white flex justify-between items-center bg-gray-50 dark:bg-[#1e293b]">
          <span>NOTIFICAÇÕES RECENTES</span>
          {unreadCount > 0 && <span className="text-[9px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-bold">NOVAS</span>}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n) => (
              <div 
                key={n.id} 
                onClick={() => { markAsRead(n.id); router.push(n.link || '#'); setOpenMenu(null); }}
                className={`p-4 border-b dark:border-[#333] hover:bg-gray-50 dark:hover:bg-[#333] cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className={`text-[12px] font-bold ${!n.is_read ? 'text-blue-600' : 'text-gray-600 dark:text-gray-300'}`}>
                    {n.title}
                  </p>
                  <span className="text-[9px] text-gray-400">{new Date(n.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{n.message}</p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-xs italic">Nenhuma notificação encontrada</div>
          )}
        </div>
      </div>
    )}
  </div>

  {/* 4. PERFIL */}
  <div className="relative">
    <button onClick={() => toggleMenu('profile')} className="w-9 h-9 bg-[#3E506F] text-white rounded-full font-bold text-xs ml-2 hover:opacity-90 transition-opacity">
      AD
    </button>
    {openMenu === 'profile' && (
      <div className={menuStyle}>
        <div className="p-4 border-b dark:border-[#333]">
          <p className="font-bold text-sm dark:text-white">Admin De AZ</p>
          <p className="text-[10px] text-gray-400">Nível: Administrador</p>
        </div>
        <button onClick={() => { setOpenMenu(null); router.push('/admin/config/account') }} className={itemStyle}>
          <UserCircle size={16}/> Editar Perfil
        </button>
        <button onClick={handleLogout} className={`${itemStyle} text-red-500 hover:bg-red-50 dark:hover:bg-red-950`}>
          <LogOut size={16}/> Sair do Sistema
        </button>
      </div>
    )}
  </div>

</div>
        </header>

        {/* CONTEÚDO PRINCIPAL COM DARK MODE */}
        <main className="px-10 py-6">
           <div className="bg-white dark:bg-[#252525] rounded-sm shadow-sm border border-[#E9EDF1] dark:border-[#333] transition-colors p-6">
              {children}
           </div>
        </main>

      </div>

      <Toaster position="top-right" richColors closeButton />

    </div>
  )
}
