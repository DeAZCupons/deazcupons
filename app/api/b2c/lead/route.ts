import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Inicializamos o Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Criamos o cliente do Supabase para o lado do servidor
// Usamos a SERVICE_ROLE_KEY para garantir permissão de escrita na tabela de leads
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nome, email, whatsapp } = body;

    if (!nome || !email) {
      return NextResponse.json(
        { error: 'Nome e e-mail são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Inserir o lead na tabela leads_usuarios
    const { error: dbError } = await supabaseAdmin
      .from('leads_usuarios')
      .insert([
        { 
          nome, 
          email, 
          whatsapp, 
          status: 'novo' 
        }
      ]);

    if (dbError) {
      console.error('Erro no Banco de Dados:', dbError);
      return NextResponse.json(
        { error: 'Erro ao salvar os dados.' },
        { status: 500 }
      );
    }

    // 2. Enviar e-mail de boas-vindas via Resend
    if (process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: 'De AZ Cupons <contato@deazcupons.com.br>',
          to: email,
          subject: '🚀 Complete seu cadastro na De AZ Cupons!',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #00B9F2;">Olá, ${nome}!</h2>
              <p>Falta apenas um passo para você liberar seu acesso aos melhores cupons.</p>
              <p>Clique no botão abaixo para completar seu perfil e definir sua senha de acesso:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://deazcupons.com.br/confirmar?email=${encodeURIComponent(email)}&nome=${encodeURIComponent(nome)}" 
                  style="background-color: #00B9F2; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                  Finalizar meu Cadastro
                </a>
              </div>

              <p style="font-size: 13px; color: #666;">Se o botão não funcionar, copie e cole este link no navegador:<br />
              https://deazcupons.com.br/confirmar?email=${email}</p>
              
              <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
              <p style="font-size: 12px; color: #888;">De AZ Cupons - Economia Inteligente</p>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Erro ao enviar e-mail:', emailError);
        // Não travamos o fluxo se apenas o e-mail falhar, pois o lead já foi salvo.
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Erro na Rota de API:', error);
    return NextResponse.json(
      { error: 'Erro interno no servidor.' },
      { status: 500 }
    );
  }
}