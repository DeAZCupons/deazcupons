import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, email, password, full_name, username, role } = body

    console.log("Iniciando atualização do membro:", id)

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // 1. Atualizar dados no Supabase Auth (E-mail e Senha)
    const authUpdate: any = { email }
    if (password && password.trim() !== '') {
      authUpdate.password = password
    }
    
    // Também atualizamos o nome dentro do metadado do Auth
    authUpdate.user_metadata = { full_name, username, role }

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, authUpdate)
    
    if (authError) {
      console.error("Erro no Auth do Supabase:", authError.message)
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    // 2. Atualizar dados na tabela admin_users
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .update({ 
        full_name, 
        username, 
        role, 
        email 
      })
      .eq('id', id)

    if (dbError) {
      console.error("Erro no Banco de Dados:", dbError.message)
      return NextResponse.json({ error: dbError.message }, { status: 400 })
    }

    console.log("Membro atualizado com sucesso!")
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("Erro Crítico na API:", err.message)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}