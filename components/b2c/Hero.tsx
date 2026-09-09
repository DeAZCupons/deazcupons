'use client';

import { ArrowRight, Tag, Sparkles, CheckCircle } from 'lucide-react';

interface HeroProps {
  onOpenModal: () => void;
}

export function HeroB2C({ onOpenModal }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-white py-16 lg:py-24">
      {/* Elemento Decorativo de Fundo */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-[#00B9F2]/5 blur-3xl" />
      
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          
          {/* Lado Esquerdo: Texto e CTA */}
          <div className="flex-1 text-center lg:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#00B9F2]/10 text-[#00B9F2] text-sm font-semibold mb-6">
              <Sparkles size={16} />
              <span>Sua nova forma favorita de economizar</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
              Os melhores cupons de <span className="text-[#00B9F2]">desconto</span> em um só lugar.
            </h1>
            
            <p className="text-lg text-slate-600 mb-8 max-w-2xl">
              Deixe de pagar o preço total. Tenha acesso a ofertas exclusivas de alimentação, moda, serviços e muito mais. Grátis para sempre.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <button 
                onClick={onOpenModal}
                className="px-8 py-4 bg-[#00B9F2] text-white rounded-xl font-bold text-lg hover:bg-[#009dc2] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00B9F2]/20"
              >
                Quero meus cupons <ArrowRight size={20} />
              </button>
              <button className="px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                Como funciona?
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Sem cartões</div>
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> 100% Grátis</div>
              <div className="flex items-center gap-1"><CheckCircle size={14} className="text-green-500" /> Uso Imediato</div>
            </div>
          </div>

          {/* Lado Direito: Imagem/Visual */}
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" 
                alt="Pessoa sorrindo usando celular em uma loja"
                className="w-full h-auto"
              />
            </div>
            {/* Card Flutuante */}
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl z-20 border border-slate-100 hidden md:block">
              <div className="flex items-center gap-3">
                <div className="bg-[#00B9F2] p-2 rounded-lg text-white">
                  <Tag size={24} />
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-medium">Cupom Ativado</p>
                  <p className="text-lg font-bold text-slate-800">50% OFF - Loja Parceira</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}