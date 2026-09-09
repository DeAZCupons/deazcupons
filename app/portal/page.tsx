import { LeadForm } from "./_components/lead-form";
import { 
  CheckCircle2, Rocket, Users, Smartphone, Zap, 
  Target, MessageCircle, BarChart3, ShieldCheck, 
  ChevronDown, Camera, Mail, Phone, MapPin
} from "lucide-react";
import Image from "next/image";

export default function PortalParceiro() {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      
      {/* NAVBAR */}
      <header className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img src="https://deazcupons.com.br/dashboard/assets/images/logo-dark.svg" alt="De AZ" className="h-10" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#sobre" className="hover:text-[#00B9F2] transition-colors">Sobre</a>
            <a href="#servicos" className="hover:text-[#00B9F2] transition-colors">Serviços</a>
            <a href="#precos" className="hover:text-[#00B9F2] transition-colors">Preços</a>
            <a href="#faq" className="hover:text-[#00B9F2] transition-colors">FAQ</a>
          </nav>
          <a href="#cadastro" className="bg-[#00B9F2] hover:bg-[#0096c4] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-lg shadow-blue-200">
            Cadastre-se Grátis
          </a>
        </div>
      </header>

      <main>
        {/* HERO SECTION - TEXTO À ESQUERDA, FORMULÁRIO À DIREITA */}
        <section id="cadastro" className="relative py-12 lg:py-24 bg-gradient-to-b from-[#00B9F2]/10 via-white to-white overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center px-[100px]">
              {/* LADO ESQUERDO: TEXTO E BENEFÍCIOS */}
              <div  className="text-left space-y-6">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                  Divulgue sua loja com <span className="text-[#00B9F2]">destaque!</span><br />
                  Impulsione suas vendas com o <span className="text-[#00B9F2]">De AZ Cupons!</span>
                </h1>
                
                <p className="text-lg lg:text-xl text-slate-600 max-w-xl">
                  Chegou a hora de atrair mais clientes com a <span className="font-bold">De AZ Cupons!</span> Milhares de usuários aguardam seus cupons de descontos.
                </p>

                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#00B9F2]/10 p-1 rounded-full text-[#00B9F2]">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-lg lg:text-xl font-bold text-slate-800">Exposição estratégica para sua marca</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="bg-[#00B9F2]/10 p-1 rounded-full text-[#00B9F2]">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-lg lg:text-xl font-bold text-slate-800">Painel de controle de cupons em tempo real</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-[#00B9F2]/10 p-1 rounded-full text-[#00B9F2]">
                      <CheckCircle2 size={24} />
                    </div>
                    <p className="text-lg lg:text-xl font-bold text-slate-800">Geração de leads qualificados diariamente</p>
                  </div>
                </div>
              </div>

              {/* LADO DIREITO: FORMULÁRIO */}
              <div className="w-full max-w-xl mx-auto lg:ml-auto bg-white p-6 md:p-10 rounded-[2rem] shadow-2xl border border-slate-100 relative z-10">
                <div className="mb-8 text-left border-l-4 border-[#00B9F2] pl-4">
                  <h2 className="text-2xl font-bold">Pré-cadastro para Lojistas</h2>
                  <p className="text-slate-500">Preencha e entraremos em contato para ativar seu painel.</p>
                </div>
                <LeadForm />
              </div>

            </div>
          </div>
          
          {/* Elementos decorativos de fundo */}
          <div className="absolute top-1/2 left-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-30 -translate-x-1/2" />
        </section>

        {/* SOBRE NÓS */}
        <section id="sobre" className="py-24 bg-white">
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-16 items-center">
            <div className="relative">
              <img 
                src="https://deazcupons.com.br/landing/assets/img/about-img.jpg" 
                alt="Sobre AZ" 
                className="rounded-3xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-[#00B9F2] p-8 rounded-2xl text-white hidden md:block">
                <p className="text-4xl font-black">100%</p>
                <p className="text-sm font-bold opacity-80 uppercase tracking-wider">Foco em Resultados</p>
              </div>
            </div>
            <div className="space-y-6">
              <span className="text-[#00B9F2] font-bold tracking-widest uppercase text-sm">Sobre nós</span>
              <h2 className="text-4xl font-bold">O que é a De AZ Cupons?</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                Uma plataforma pensada para lojistas que querem atrair mais clientes e divulgar promoções de forma inteligente e moderna. Você cria cupons, acompanha resultados e ainda aparece em nossas redes sociais!
              </p>
              <h3 className="text-2xl font-bold pt-4 text-[#00B9F2]">Por que ser parceiro?</h3>
              <p className="text-slate-600 leading-relaxed">
                Parceria além do ROI ("Return on Investment"), que traduz para "Retorno sobre o Investimento". Além de gerar tráfego e vendas, o De AZ Cupons oferece uma plataforma completa para você divulgar sua loja, com cupons personalizados e suporte dedicado.
              </p>
            </div>
          </div>
        </section>

        {/* NOSSOS SERVIÇOS (COMBINADOS) */}
        <section id="servicos" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 text-center mb-16">
            <span className="text-[#00B9F2] font-bold tracking-widest uppercase text-sm">Serviços</span>
            <h2 className="text-4xl font-bold mt-2">Impulsione suas vendas com a De AZ Cupons</h2>
            <br />
            <h3 className="text-2xl font-bold">Coloque sua marca em destaque, atraia novos clientes e fidelize seu público com a plataforma de cupons que mais cresce na região.</h3>
          </div>

          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8">
            <ServiceCard 
              icon={<Zap className="w-8 h-8 text-white" />}
              title="Cupons de Descontos"
              description="Diversos cupons de descontos para atrair mais clientes e aumentar suas vendas on-line ou impresso."
            />
            <ServiceCard 
              icon={<Smartphone className="w-8 h-8 text-white" />}
              title="Cupons Impressos"
              description="Também oferecemos cupons impressos para o cliente apresentar no momento do pagamento."
            />
            <ServiceCard 
              icon={<BarChart3 className="w-8 h-8 text-white" />}
              title="Dashboard do Lojista"
              description="Tenha acesso a um dashboard completo para acompanhar o uso dos cupons e relatórios detalhados."
            />
             <ServiceCard 
              icon={<Smartphone className="w-8 h-8 text-white" />}
              title="QR Code Inteligente"
              description="Valide os cupons dos clientes de forma simples e rápida pelo celular no balcão da loja."
            />
            <ServiceCard 
              icon={<Target className="w-8 h-8 text-white" />}
              title="Programa de Indicação"
              description="Indique um lojista e ganhe 1 mês de destaque no site. Quanto mais indicações, mais evidência!"
            />
            <ServiceCard 
              icon={<Users className="w-8 h-8 text-white" />}
              title="Uso de Inteligência Artificial"
              description="Utilizamos IA para criar estratégias personalizadas de divulgação que maximizam a captação de clientes."
            />
          </div>
        </section>

        {/* PLANOS E VALORES */}
        <section id="precos" className="py-24 bg-white">
          <div className="container mx-auto px-4 text-center mb-16">
            <span className="text-[#00B9F2] font-bold tracking-widest uppercase text-sm">Investimento</span>
            <h2 className="text-4xl font-bold mt-2">Planos e Valores</h2>
            <p className="mt-4 text-slate-500">Taxa de adesão de R$119,90 garante seu painel exclusivo e manutenção do sistema.</p>
          </div>

          <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Plano Básico */}
            <PricingCard 
              title="Plano Standart"
              price="49,90"
              features={["Até 3 cupons", "Link WhatsApp", "Suporte", "Relatório Dashboard", "Divulgação básica"]}
            />
            {/* Plano Destaque */}
            <PricingCard 
              title="Plano Destaque"
              price="99,90"
              recommended
              features={["Até 10 cupons", "Link WhatsApp", "Destaque rotativo", "Suporte exclusivo", "Relatórios mensais", "Programa de indicação"]}
            />
            {/* Plano Premium */}
            <PricingCard 
              title="Plano Premium"
              price="199,90"
              features={[
                "Até 20 cupons", // Alterado de ilimitado para 20
                "Link WhatsApp", 
                "Impulsionamento Instagram", 
                "Suporte exclusivo", 
                "Relatório dos anúncios no Instagram e Google.", 
                "Programa de indicação"
              ]}
            />
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-16">
              <span className="text-[#00B9F2] font-bold tracking-widest uppercase text-sm">FAQ</span>
              <h2 className="text-4xl font-bold mt-2">Perguntas Frequentes</h2>
            </div>
            
            <div className="grid gap-6">
              <FaqItem 
                question="Como usar os códigos de cupons?"
                answer="Os códigos dos cupons poderão ser utilizados copiando o código e apresentando na loja, ou impresso e até enviando diretamente pelo WhatsApp."
              />
              <FaqItem 
                question="Posso compartilhar um cupom?"
                answer="Sim! Quanto mais compartilhar o cupom, maior será a divulgação do site De AZ Cupons e assim mais estabelecimentos irão aderir."
              />
              <FaqItem 
                question="Como cancelar minha assinatura?"
                answer="O cancelamento pode ser solicitado a qualquer momento, mediante aviso prévio de 20 dias úteis conforme contrato."
              />
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER - ALINHADO VERTICALMENTE NO CENTRO */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4">
          {/* flex-col e items-center garantem o alinhamento vertical centralizado */}
          <div className="flex flex-col items-center text-center space-y-8">
            
            <img src="https://deazcupons.com.br/dashboard/assets/images/logo-white.svg" alt="De AZ" className="h-12" />
            
            <nav className="flex flex-col md:flex-row items-center gap-6 text-slate-400 font-medium">
              <a href="#sobre" className="hover:text-[#00B9F2] transition-colors">Sobre nós</a>
              <a href="#servicos" className="hover:text-[#00B9F2] transition-colors">Serviços</a>
              <a href="#precos" className="hover:text-[#00B9F2] transition-colors">Preços</a>
              <a href="#formulario" className="hover:text-[#00B9F2] transition-colors">Torne-se um parceiro</a>
              <a href="#" className="hover:text-[#00B9F2] transition-colors">Termos de Uso</a>
            </nav>

            <div className="flex gap-6">
              <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Camera size={20}/></a>
              <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Mail size={20}/></a>
              <a href="#" className="p-3 bg-slate-800 rounded-full hover:bg-[#00B9F2] transition-all"><Phone size={20}/></a>
            </div>

            <div className="pt-8 border-t border-slate-800 w-full text-sm text-slate-500">
              <p>&copy; {new Date().getFullYear()} De AZ Cupons. Todos os direitos reservados. Distribuído por De AZ Cupons.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// COMPONENTES AUXILIARES
function ServiceCard({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-white p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-all group">
      <div className="w-16 h-16 bg-[#00B9F2] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-blue-200">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-slate-500 leading-relaxed">{description}</p>
    </div>
  );
}

function PricingCard({ title, price, features, recommended = false }: { title: string, price: string, features: string[], recommended?: boolean }) {
  return (
    <div className={`p-8 rounded-[2.5rem] border ${recommended ? 'border-[#00B9F2] ring-4 ring-blue-50' : 'border-slate-100'} bg-white flex flex-col relative`}>
      {recommended && <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#00B9F2] text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">Recomendado</span>}
      <h3 className="text-lg font-bold text-slate-400 mb-2 uppercase tracking-widest">{title}</h3>
      <div className="flex items-baseline gap-1 mb-8">
        <span className="text-slate-400 font-bold">R$</span>
        <span className="text-5xl font-black text-slate-900">{price}</span>
        <span className="text-slate-400">/mês</span>
      </div>
      <ul className="space-y-4 mb-10 flex-1">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-slate-600 text-sm">
            <CheckCircle2 className="text-[#00B9F2] w-5 h-5 flex-shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <a href="#cadastro" className={`w-full py-4 rounded-2xl font-black text-sm transition-all block text-center ${recommended ? 'bg-[#00B9F2] text-white hover:bg-[#0096c4]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
        CONTRATAR AGORA
      </a>    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
      <h4 className="text-lg font-bold mb-2 flex items-center gap-3">
        <div className="w-2 h-2 rounded-full bg-[#00B9F2]" /> {question}
      </h4>
      <p className="text-slate-500 pl-5">{answer}</p>
    </div>
  );
}