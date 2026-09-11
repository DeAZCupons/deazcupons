import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const { partnerId, email } = await req.json()

    if (!partnerId || !email) {
      return NextResponse.json({ message: 'partnerId e email são obrigatórios.' }, { status: 400 })
    }

    // URL para onde o parceiro vai depois de clicar no link do e-mail
    const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL}/parceiro/completar-cadastro`

    // 1. Envia o convite por e-mail e cria o usuário (ainda sem senha) no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { redirectTo }
    )

    if (authError) throw authError

    // 2. Já vincula esse parceiro ao usuário recém-convidado
    const { error: dbError } = await supabaseAdmin
      .from('partners')
      .update({ user_id: authData.user.id })
      .eq('id', partnerId)

    if (dbError) throw dbError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao convidar parceiro:', error)
    return NextResponse.json({ message: error.message }, { status: 500 })
  }
}
