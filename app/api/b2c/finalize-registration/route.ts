import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { nome, email, whatsapp, cpf, address, password } = await req.json();

    // 1. Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nome }
    });

    if (authError) throw authError;

    // 2. Criptografar CPF (Lógica simples para exemplo, use uma lib como 'crypto' para produção)
    // Ex: const encryptedCpf = Buffer.from(cpf).toString('base64');
    const encryptedCpf = `ENC_${cpf}`; 

    // 3. Salvar na tabela public.users
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .insert([{
        id: authData.user.id,
        full_name: nome,
        email,
        whatsapp,
        phone: whatsapp,
        cpf_encrypted: encryptedCpf,
        address,
        consent_given_at: new Date().toISOString()
      }]);

    if (dbError) throw dbError;

    // 4. Atualizar status do lead
    await supabaseAdmin
      .from('leads_usuarios')
      .update({ status: 'convertido' })
      .eq('email', email);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}