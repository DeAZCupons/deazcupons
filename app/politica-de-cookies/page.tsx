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
            <h1 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">Política de Cookies</h1>
          </div>
          
          <p className="text-slate-500 mb-8 italic">Última atualização: Outubro de 2023</p>

          <div className="prose prose-slate max-w-none space-y-8 text-slate-600 leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 1. Introdução
              </h2>
              <p>A <strong>De AZ Cupons</strong> utiliza cookies e tecnologias semelhantes para garantir o funcionamento adequado do site, melhorar a experiência de navegação, compreender como nossos serviços são utilizados e, quando aplicável, oferecer conteúdos e anúncios mais relevantes.</p>
              <br />
              <p>Esta Política de Cookies explica o que são cookies, quais tipos podem ser utilizados em nosso site e como você pode gerenciar suas preferências.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 2. O que são cookies?
              </h2>
              <p>Cookies são pequenos arquivos de texto armazenados no dispositivo do usuário quando ele acessa determinados sites.</p>
              <br />
              <p>Eles permitem que o site reconheça o dispositivo durante a navegação e memorize determinadas informações, como preferências, configurações e interações realizadas.</p>
              <br />
              <p>Os cookies, por si só, não permitem identificar diretamente uma pessoa. Entretanto, quando associados a outras informações, determinados dados coletados por meio de cookies podem ser considerados dados pessoais nos termos da Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018).</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 3. Como utilizamos cookies?
              </h2>
              <p>A <strong>De AZ Cupons</strong> pode utilizar cookies para diferentes finalidades:</p>
              <br />
              <p><strong>Cookies estritamente necessários</strong></p>
              <br />
              <p>São cookies essenciais para o funcionamento adequado do site e de determinados recursos.</p>
              <br />
              <p>Eles podem ser utilizados, por exemplo, para:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Garantir o funcionamento e a segurança da plataforma;</li>
                <li>Manter determinadas preferências durante a navegação;</li>
                <li>Permitir o funcionamento de recursos de autenticação e áreas restritas;</li>
                <li>Prevenir atividades fraudulentas ou abusivas;</li>
                <li>Garantir a estabilidade e o correto funcionamento dos serviços.</li>
              </ul>
              <br />
              <p>Esses cookies são necessários para que determinadas funcionalidades do site funcionem corretamente.</p>
              <br />
              <p><strong>Cookies de desempenho e análise</strong></p>
              <br />
              <p>Podemos utilizar cookies e tecnologias semelhantes para compreender como os visitantes utilizam a <strong>De AZ Cupons</strong>.</p>
              <br />
              <p>Essas informações podem incluir:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Páginas acessadas;</li>
                <li>Tempo de permanência em cada página;</li>
                <li>Origem da visita;</li>
                <li>Tipo de dispositivo utilizado;</li>
                <li>Navegador utilizado;</li>
                <li>Interações realizadas com cupons, ofertas e parceiros;</li>
                <li>Informações estatísticas sobre a utilização da plataforma.</li>
              </ul>
              <br />
              <p>Esses dados são utilizados principalmente para analisar o desempenho do site, identificar problemas, melhorar nossos serviços e oferecer uma experiência de navegação cada vez melhor.</p>
              <br />
              <p><strong>Cookies de publicidade e marketing</strong></p>
              <br />
              <p>Quando utilizados, cookies de publicidade e tecnologias semelhantes podem permitir a medição de campanhas e a apresentação de anúncios mais relevantes aos usuários.</p>
              <br />
              <p>Essas tecnologias podem ser fornecidas por terceiros, como plataformas de publicidade e marketing digital.</p>
              <br />
              <p>A utilização desses cookies estará sujeita às configurações de consentimento disponíveis no site e às políticas de privacidade das respectivas plataformas.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 4. Cookies de terceiros
              </h2>
              <p>Algumas funcionalidades ou serviços disponíveis na  <strong>De AZ Cupons</strong> podem utilizar tecnologias fornecidas por terceiros.</p>
              <br />
              <p>Esses terceiros poderão utilizar cookies ou tecnologias semelhantes de acordo com suas próprias políticas de privacidade e termos de uso.</p>
              <br />
              <p>Entre os serviços de terceiros que eventualmente poderão ser utilizados estão ferramentas de análise, publicidade, segurança, hospedagem, autenticação e outros serviços necessários à operação da plataforma.</p>
              <br />
              <p>A <strong>De AZ Cupons</strong> recomenda que o usuário consulte as políticas de privacidade desses terceiros para compreender como seus dados são tratados.</p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 5. Gerenciamento das preferências de cookies
              </h2>
              <p>Você pode controlar ou limitar a utilização de cookies por meio das configurações do seu navegador.</p>
              <br />
              <p>A maioria dos navegadores permite:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Bloquear cookies;</li>
                <li>Excluir cookies já armazenados;</li>
                <li>Permitir cookies somente de determinados sites;</li>
                <li>Receber uma notificação antes que um cookie seja armazenado.</li>
              </ul>
              <br />
              <p>É importante observar que a desativação de determinados cookies pode afetar o funcionamento de algumas funcionalidades da De AZ Cupons.</p>
              <br />
              <p>Quando disponibilizado em nosso site, você também poderá utilizar o painel de preferências de cookies para escolher quais categorias deseja permitir ou recusar.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 6. Cookies e proteção de dados
              </h2>
              <p>A De AZ Cupons trata dados pessoais de acordo com a legislação aplicável, especialmente a <strong>Lei Geral de Proteção de Dados Pessoais — LGPD</strong>.</p>
              <br />
              <p>Quando o uso de cookies envolver o tratamento de dados pessoais, adotaremos as medidas necessárias para que esse tratamento ocorra de acordo com as bases legais e princípios estabelecidos pela legislação.</p>
              <br />
              <p>O usuário também poderá exercer os direitos previstos na LGPD, conforme aplicável, incluindo solicitações relacionadas ao acesso, correção, eliminação ou outras providências relativas aos seus dados pessoais.</p>
            </section>

             <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 7. Segurança
              </h2>
              <p>Adotamos medidas técnicas e administrativas destinadas a proteger as informações tratadas pela plataforma contra acessos não autorizados, perda, alteração, divulgação ou destruição indevida.</p>
              <br />
              <p>Entretanto, nenhum sistema conectado à internet pode garantir segurança absoluta. Por isso, recomendamos que os usuários também adotem boas práticas de segurança ao navegar pela internet.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 8. Alterações nesta Política de Cookies
              </h2>
              <p>Esta Política de Cookies poderá ser atualizada periodicamente para refletir alterações em nossos serviços, tecnologias utilizadas, requisitos legais ou práticas de tratamento de dados.</p>
              <br />
              <p>Recomendamos que o usuário consulte esta página regularmente para verificar eventuais alterações.</p>
              <br />
              <p>A data da última atualização será indicada no início desta Política.</p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[#00B9F2] rounded-full" /> 9. Entre em contato
              </h2>
              <p>Se você tiver dúvidas sobre esta Política de Cookies, sobre o uso de cookies pela De AZ Cupons ou sobre o tratamento de seus dados pessoais, entre em contato conosco:</p>
              <br />
              <p>E-mail: contato@deazcupons.com.br</p>
            </section>
          </div>
        </div>
      </main>
    </div>
  )
}