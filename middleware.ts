// Importa a função para criar um cliente do Supabase com suporte a cookies no middleware.
import { createServerClient } from '@supabase/ssr'

// Importa os tipos e utilitários do Next.js usados para manipular a requisição e a resposta.
import { NextResponse, type NextRequest } from 'next/server'

// Middleware principal que é executado em todas as requisições que combinam com o matcher.
export async function middleware(request: NextRequest) {
  // Cria uma resposta inicial que apenas segue para a próxima etapa sem alterar o conteúdo da página.
  // Também repassa os headers da requisição atual para que o Next.js continue funcionando normalmente.
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Cria um cliente do Supabase configurado para ler e escrever cookies no contexto do middleware.
  // Isso permite autenticação e gerenciamento de sessão mesmo em um ambiente de servidor.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },

        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })

          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value)
          })
        },
      },
    }
  )

  // Obtém a sessão atual do usuário autenticado a partir do Supabase.
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = request.nextUrl.pathname

  // Se o usuário já estiver autenticado e tentar acessar a página de login do admin,
  // ele é redirecionado para o painel administrativo.
  if (session && pathname === '/login') {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  // Se o usuário já estiver autenticado e tentar acessar a página de login do parceiro,
  // ele é redirecionado para o dashboard do parceiro.
  if (session && pathname === '/login/parceiro') {
    return NextResponse.redirect(new URL('/dashboard/parceiro', request.url))
  }

  // --- REGRAS DE PROTEÇÃO ---

  // Regra 1: protege o dashboard do parceiro para que apenas usuários autenticados possam acessá-lo.
  // Caso não exista sessão, o usuário é enviado para a página de login do parceiro.
  if (pathname.startsWith('/dashboard/parceiro')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login/parceiro', request.url))
    }
  }

  // Regra 2: protege o painel administrativo para que apenas usuários autenticados possam acessá-lo.
  // Caso não exista sessão, o usuário é enviado para a página de login do admin.
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Bloco opcional comentado: pode ser ativado para restringir o acesso administrativo
    // apenas para um e-mail específico, por exemplo, o e-mail do administrador principal.
    if (session.user.email !== 'leo.perret@gmail.com') {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  // Se nenhuma regra de redirecionamento for disparada, retorna a resposta atual.
  return response
}

// Configuração do middleware para definir quais rotas serão processadas.
export const config = {
  matcher: [
    /*
     * Aplica o middleware em todas as rotas, exceto:
     * - _next/static: arquivos estáticos do Next.js
     * - _next/image: imagens otimizadas
     * - favicon.ico: ícone do site
     *
     * Essa expressão faz com que o middleware rode em quase todas as páginas da aplicação.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}