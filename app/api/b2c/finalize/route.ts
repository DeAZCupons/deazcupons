import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, whatsapp, cpf, address, password } = body;

    // 1. Criar Usuário no Auth via Admin (Evita erros de confirmação de e-mail)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: nome }
    });

    let userId = authData?.user?.id;

    if (authError) {
      // Se o erro for que já existe, tentamos recuperar o ID existente
      if (authError.message.includes("already registered") || authError.status === 409) {
          const { data: list } = await supabaseAdmin.auth.admin.listUsers();
          userId = list.users.find(u => u.email === email)?.id;
      } else {
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
    }

    if (!userId) throw new Error("Não foi possível processar o ID do usuário.");

    // 2. Upsert na tabela public.users (Insere ou atualiza se já existir)
    const { error: dbError } = await supabaseAdmin
      .from('users')
      .upsert([{
        id: userId,
        full_name: nome,
        email,
        whatsapp,
        phone: whatsapp,
        cpf_encrypted: btoa(cpf), 
        address,
      }]);

    if (dbError) throw dbError;

    // 3. Atualizar lead
    await supabaseAdmin.from('leads_usuarios').update({ status: 'convertido' }).eq('email', email);

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error("Erro Finalize API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}