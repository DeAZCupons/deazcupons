import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, full_name, username, role } = await request.json()

    console.log("--- DEBUG DE CHAVES ---")
    console.log("URL encontrada?", !!process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log("Service Key encontrada?", !!process.env.SUPABASE_SERVICE_ROLE_KEY)
    console.log("Comprimento da Key:", process.env.SUPABASE_SERVICE_ROLE_KEY?.length)
    console.log("-----------------------")

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    // Verificação de segurança para o log
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("ERRO: Variáveis de ambiente não encontradas!")
      return NextResponse.json({ error: "Configuração do servidor incompleta (chaves faltando)." }, { status: 500 })
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // 1. Cria o usuário no Supabase Auth
    // const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    //   email,
    //   password,
    //   email_confirm: true,
    //   user_metadata: { full_name }
    // })

    // Dentro do route.ts, mude a parte do createUser:
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { 
        full_name, 
        username, 
        role, 
        is_team: true // <--- ESSA LINHA É A CHAVE
      }
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. Atualiza os dados na tabela admin_users
    if (authData.user) {
      const { error: dbError } = await supabaseAdmin
        .from('admin_users')
        .update({ username, role, full_name })
        .eq('id', authData.user.id)

      if (dbError) {
        return NextResponse.json({ error: "Usuário criado no Auth, mas erro na tabela: " + dbError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}