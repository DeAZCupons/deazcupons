import { createServerClient } from '@supabase/ssr' // Apenas createServerClient aqui
import { NextResponse, type NextRequest } from 'next/server' // NextRequest vem daqui

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // --- REGRAS DE PROTEÇÃO ---

  // 1. Se tentar acessar o Dashboard do Parceiro sem estar logado
  if (request.nextUrl.pathname.startsWith('/dashboard/parceiro')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/parceiro', request.url))
    }
  }

  // 2. Se tentar acessar o Painel Admin sem estar logado
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url)) // Login do admin
    }
    
    // Opcional: Verificar se o e-mail é o seu (Admin)
   {/* if (session.user.email !== 'leo.perret@gmail.com') {
        return NextResponse.redirect(new URL('/', request.url))
    }
        */}
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}