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
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Termos e Condições de Uso</h1>
          </div>
          
          <p className="text-slate-500 mb-8 italic">Última atualização: Outubro de 2023</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 1. Aceitação dos Termos
              </h2>
              <p>Ao acessar e utilizar a plataforma <strong>De AZ Cupons</strong>, você (doravante denominado "Usuário") concorda em cumprir e vincular-se aos presentes Termos de Uso.</p>
              <br />
              <p>Caso não concorde com qualquer parte destes termos, você deve interromper a utilização do sistema imediatamente.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 2. Descrição do Serviço
              </h2>
              <p>A <strong>De AZ Cupons</strong> opera como um portal de curadoria e distribuição de cupons de desconto. Nossa função é facilitar o acesso do Usuário a ofertas exclusivas oferecidas por estabelecimentos comerciais parceiros (doravante denominados "Parceiros").</p>
              <br />
              <p><strong>Intermediação:</strong> A De AZ Cupons não vende produtos ou presta serviços diretamente aos consumidores finais, atuando exclusivamente na divulgação de promoções.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 3. Cadastro e Segurança de Dados
              </h2>
              <p><strong>Elegibilidade:</strong> O cadastro é gratuito e destinado a pessoas físicas plenamente capazes.</p>
              <br />
              <p><strong>Veracidade:</strong> O Usuário compromete-se a fornecer dados reais e atualizados. O fornecimento de informações falsas pode resultar na suspensão da conta.</p>
              <br />
              <p><strong>Criptografia:</strong> Informações sensíveis, como o CPF, são armazenadas de forma criptografada para sua segurança, em conformidade com a LGPD.</p>
              <br />
              <p><strong>Pessoalidade:</strong> A conta é pessoal e intransferível. O Usuário é responsável por manter a confidencialidade de sua senha.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 4. Regras para Utilização dos Cupons
              </h2>
              <p><strong>Validade:</strong> Cada cupom possui um prazo de validade determinado, exibido claramente na vitrine e no detalhe do cupom. Após o vencimento, o cupom torna-se inválido e não poderá ser utilizado.</p>
              <br />
              <p><strong>Resgate:</strong> O resgate ocorre mediante a apresentação do código alfanumérico ou do QR Code gerado pelo sistema no estabelecimento do Parceiro.</p>
              <br />
              <p><strong>WhatsApp:</strong> O sistema pode facilitar o contato via WhatsApp para reserva ou dúvidas sobre o cupom. Este contato é uma facilidade técnica e não implica em responsabilidade da De AZ Cupons sobre a conversa.</p>
              <br />
              <p><strong>Limitações:</strong> O Parceiro pode estabelecer regras específicas (ex: "válido apenas para novos clientes", "não cumulativo com outras promoções"). É dever do Usuário ler a descrição do cupom antes do uso.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 5. Limitação de Responsabilidade
              </h2>
              <p><strong>Ofertas:</strong> A De AZ Cupons não se responsabiliza pela recusa do Parceiro em aceitar o cupom, nem pela qualidade, entrega ou garantia dos produtos e serviços adquiridos. Qualquer reclamação deve ser direcionada diretamente ao estabelecimento fornecedor.</p>
              <br />
              <p><strong>Disponibilidade:</strong> Não garantimos que o sistema estará disponível 100% do tempo sem interrupções técnicas ou falhas de internet.</p>
              <br />
              <p><strong>Alterações:</strong> As ofertas podem ser alteradas ou removidas pelos Parceiros a qualquer momento, sem aviso prévio.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 6. Propriedade Intelectual
              </h2>
              <p>A marca "De AZ Cupons", logotipos, layout, códigos-fonte e conteúdos do site são de propriedade exclusiva da De AZ Cupons.</p>
              <br />
              <p>É proibida a reprodução, cópia ou exploração comercial não autorizada de qualquer elemento da plataforma.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 7. Cancelamento e Exclusão
              </h2>
              <p>A De AZ Cupons reserva-se o direito de suspender ou cancelar contas de usuários que violem estes termos, pratiquem fraudes ou utilizem robôs para coleta de dados.</p>
              <br />
              <p>O Usuário também pode solicitar a exclusão de sua conta a qualquer momento através das configurações de perfil.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 8. Privacidade
              </h2>
              <p>A coleta e o tratamento de dados pessoais são regidos pela nossa Política de Privacidade, que faz parte integrante destes Termos de Uso.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 9. Alterações nos Termos
              </h2>
              <p>Estes termos podem ser atualizados periodicamente para refletir mudanças legais ou melhorias no serviço.</p>
              <br />
              <p>Notificaremos os usuários sobre mudanças significativas através do portal ou por e-mail.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 10. Foro e Legislação Aplicável
              </h2>
              <p>Estes Termos são regidos pelas leis da República Federativa do Brasil.</p>
              <br />
              <p>Para dirimir quaisquer controvérsias decorrentes deste documento, as partes elegem o foro da comarca de Belo Horizonte/MG (ou a sua cidade sede), com renúncia expressa a qualquer outro.</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}
