'use client'
import { ArrowLeft, ShieldCheck, Lock, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PrivacyPolicy() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Simples */}
      <header className="bg-white border-b h-20 flex items-center shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </button>
          <img src="https://deazcupons.com.br/dashboard/assets/images/logo-dark.svg" className="h-7" alt="De AZ Cupons" />
        </div>
      </header>

      <main className="container mx-auto px-4 mt-12 max-w-4xl">
        <div className="bg-white rounded-[40px] p-8 md:p-16 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 text-[#00B9F2] mb-6">
            <ShieldCheck size={32} />
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Política de Privacidade</h1>
          </div>
          
          <p className="text-slate-500 mb-8 italic">Última atualização: Outubro de 2023</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 1. Introdução
              </h2>
              <p>A <strong>De AZ Cupons</strong> está comprometida com a proteção da sua privacidade. Esta política descreve como coletamos, usamos e protegemos as informações pessoais de nossos usuários e parceiros em conformidade com a Lei Geral de Proteção de Dados (LGPD).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 2. Dados que Coletamos
              </h2>
              <p>Para fornecer nossos serviços de descontos, coletamos:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de Identificação:</strong> Nome completo, e-mail e CPF (armazenado de forma criptografada).</li>
                <li><strong>Dados de Contato:</strong> Número de WhatsApp e endereço físico.</li>
                <li><strong>Dados de Navegação:</strong> Endereço IP, tipo de dispositivo e interações com os cupons.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 3. Finalidade do Tratamento
              </h2>
              <p>Utilizamos seus dados para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Gerar cupons de desconto personalizados e QR Codes de validação.</li>
                <li>Facilitar o contato direto entre você e o lojista parceiro via WhatsApp.</li>
                <li>Enviar notificações sobre novas ofertas e promoções exclusivas.</li>
              </ul>
            </section>

            <section className="bg-slate-50 p-6 rounded-3xl border border-dashed border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                <Lock className="text-[#00B9F2]" size={20} /> Segurança de Dados
              </h2>
              <p className="text-sm">Implementamos medidas técnicas avançadas, como a criptografia de CPFs e o uso de infraestrutura segura via Supabase, para garantir que seus dados nunca sejam acessados por terceiros não autorizados.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 4. Seus Direitos
              </h2>
              <p>Você pode, a qualquer momento, solicitar o acesso, correção ou exclusão definitiva de seus dados através da sua área de perfil ou entrando em contato conosco pelo e-mail: <strong>contato@deazcupons.com.br</strong>.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}