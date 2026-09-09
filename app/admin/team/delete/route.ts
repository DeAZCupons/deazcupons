import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { id } = await request.json()

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    // Deleta do Auth (O gatilho CASCADE no banco apagará o registro na admin_users automaticamente)
    const { error } = await supabaseAdmin.auth.admin.deleteUser(id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}