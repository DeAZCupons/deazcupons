import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id, email, password, full_name, username, role } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Atualiza dados de Autenticação (E-mail e Senha se fornecidos)
    const updateData: any = { email }
    if (password) updateData.password = password

    const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(id, updateData)
    if (authError) throw authError

    // 2. Atualiza dados na tabela admin_users
    const { error: dbError } = await supabaseAdmin
      .from('admin_users')
      .update({ full_name, username, role, email })
      .eq('id', id)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}