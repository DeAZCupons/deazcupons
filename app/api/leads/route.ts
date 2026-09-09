import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// ⚠️ A chave DEVE vir de variável de ambiente — nunca hardcoded no código
const resend = new Resend(process.env.RESEND_API_KEY!);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Escapa caracteres HTML para evitar injeção no e-mail
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomeFantasia, responsavel, whatsapp, email, segmento } = body ?? {};

    // Validação básica dos campos obrigatórios
    const camposObrigatorios = { nomeFantasia, responsavel, whatsapp, email, segmento };
    const faltando = Object.entries(camposObrigatorios)
      .filter(([, v]) => !v || typeof v !== 'string' || !v.trim())
      .map(([k]) => k);

    if (faltando.length > 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios ausentes', campos: faltando },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'E-mail inválido' },
        { status: 400 }
      );
    }

    // Sanitiza WhatsApp (mantém só dígitos) e limita tamanho dos textos livres
    const whatsappLimpo = whatsapp.replace(/\D/g, '');
    const nomeFantasiaTrim = nomeFantasia.trim().slice(0, 150);
    const responsavelTrim = responsavel.trim().slice(0, 150);
    const segmentoTrim = segmento.trim().slice(0, 100);

    // 1. Salvar o Lead
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads_parceiros')
      .insert([
        {
          nome_fantasia: nomeFantasiaTrim,
          responsavel: responsavelTrim,
          whatsapp: whatsappLimpo,
          email,
          segmento: segmentoTrim,
          status: 'novo'
        }
      ])
      .select()
      .single();

    if (leadError) throw leadError;

    // 2. Notificação interna — não deve derrubar a resposta de sucesso se falhar
    const { error: notificationError } = await supabaseAdmin
      .from('notifications')
      .insert([
        {
          title: 'Novo Lead de Parceiro',
          message: `${nomeFantasia} deseja ser um parceiro.`,
          type: 'new_partner',
          is_read: false // Certifique-se que o nome da coluna é is_read
        }
      ]);

    if (notificationError) {
      // Lead já foi salvo com sucesso — só logamos, não travamos a resposta
      console.error('Erro ao criar notificação interna:', notificationError);
    }

    // 3. Disparar e-mail (com valores escapados)
    try {
      await resend.emails.send({
        from: 'AZ Cupons <sistema@azcupons.com.br>',
        to: 'contato@leonardoperret.com.br',
        subject: '🔔 Novo Interessado: ' + nomeFantasiaTrim,
        html: `
          <div style="font-family: sans-serif; line-height: 1.6;">
            <h2>Novo Pré-cadastro recebido!</h2>
            <p>Um novo parceiro se cadastrou pelo portal:</p>
            <ul>
              <li><strong>Empresa:</strong> ${escapeHtml(nomeFantasiaTrim)}</li>
              <li><strong>Responsável:</strong> ${escapeHtml(responsavelTrim)}</li>
              <li><strong>WhatsApp:</strong> ${escapeHtml(whatsappLimpo)}</li>
              <li><strong>E-mail:</strong> ${escapeHtml(email)}</li>
              <li><strong>Segmento:</strong> ${escapeHtml(segmentoTrim)}</li>
            </ul>
            <p>Acesse o dashboard para mais detalhes.</p>
          </div>
        `
      });
    } catch (mailError) {
      console.error('Erro ao enviar e-mail:', mailError);
      // Não travamos o fluxo se apenas o e-mail falhar
    }

    return NextResponse.json({ success: true, data: lead }, { status: 201 });

  } catch (error: any) {
    console.error('Erro na API de Leads:', error);
    return NextResponse.json(
      { error: 'Erro ao processar solicitação', details: error.message },
      { status: 500 }
    );
  }
}