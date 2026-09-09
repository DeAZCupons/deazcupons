"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { QrCode, Keyboard, CheckCircle, XCircle, Loader2, ArrowLeft, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ValidadorParceiro() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [activeTab, setActiveTab] = useState<'camera' | 'manual'>('camera');
  // Tipagem explícita para evitar erros de inferência
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [manualCode, setManualCode] = useState('');

  async function validarCupom(usageId: string) {
    if (!usageId) return;
    setStatus('loading');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', session?.user?.id)
        .single();

      if (!partner) throw new Error("Parceiro não identificado.");

      const { data: usage, error: fetchError } = await supabase
        .from('coupon_usages')
        .select('*, coupons(title, partner_id)')
        .eq('id', usageId)
        .single();

      if (fetchError || !usage) {
        throw new Error("Cupom inválido ou não encontrado.");
      }

      if (usage.coupons.partner_id !== partner.id) {
        throw new Error("Este cupom pertence a outro estabelecimento.");
      }

      if (usage.validated_at) {
        const dataValidacao = new Date(usage.validated_at).toLocaleString('pt-BR');
        throw new Error(`Este cupom já foi utilizado em ${dataValidacao}`);
      }

      const { error: updateError } = await supabase
        .from('coupon_usages')
        .update({ validated_at: new Date().toISOString() })
        .eq('id', usageId);

      if (updateError) throw updateError;

      setStatus('success');
      setMessage(`Cupom "${usage.coupons.title}" validado com sucesso!`);
      toast.success("Cupom validado!");

    } catch (err: any) {
      setStatus('error');
      setMessage(err.message || "Erro ao validar.");
    }
  }

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (activeTab === 'camera' && status === 'idle') {
      scanner = new Html5QrcodeScanner(
        "reader", 
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render((decodedText) => {
        if (scanner) scanner.clear();
        validarCupom(decodedText);
      }, (error) => {
        // Erro silencioso
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(err => console.error("Erro ao fechar scanner", err));
      }
    };
  }, [activeTab, status]);

  return (
    <div className="min-h-screen bg-[#F2F0EF] p-4 md:p-8 text-black">
      <div className="max-w-md mx-auto">
        
        <header className="mb-8 flex items-center gap-4">
          <Link href="/dashboard/parceiro" className="bg-white p-3 rounded-2xl shadow-sm text-gray-400 hover:text-[#00B9F2]">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">VALIDAR CUPOM</h1>
        </header>

        {status === 'success' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border-4 border-green-50 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={44} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase">VÁLIDO!</h2>
            <p className="text-gray-500 mb-8 font-medium">{message}</p>
            <button 
              onClick={() => { setStatus('idle'); setManualCode(''); }}
              className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl hover:bg-green-700 flex items-center justify-center gap-2 transition-all"
            >
              <RefreshCw size={20} /> VALIDAR OUTRO
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-white p-10 rounded-[32px] shadow-xl border-4 border-red-50 text-center animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <XCircle size={44} />
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-2 uppercase">OPS!</h2>
            <p className="text-gray-500 mb-8 font-medium">{message}</p>
            <button 
              onClick={() => { setStatus('idle'); setManualCode(''); }}
              className="w-full bg-red-600 text-white font-bold py-4 rounded-2xl hover:bg-red-700"
            >
              TENTAR NOVAMENTE
            </button>
          </div>
        )}

        {/* MUDANÇA AQUI: O formulário aparece tanto em idle quanto em loading */}
        {(status === 'idle' || status === 'loading') && (
          <div className="bg-white rounded-[32px] shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex bg-gray-50 border-b">
              <button 
                onClick={() => setActiveTab('camera')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-xs tracking-widest transition-all ${activeTab === 'camera' ? 'text-[#00B9F2] bg-white' : 'text-gray-400'}`}
              >
                <QrCode size={18} /> CÂMERA
              </button>
              <button 
                onClick={() => setActiveTab('manual')}
                className={`flex-1 py-5 flex items-center justify-center gap-2 font-black text-xs tracking-widest transition-all ${activeTab === 'manual' ? 'text-[#00B9F2] bg-white' : 'text-gray-400'}`}
              >
                <Keyboard size={18} /> CÓDIGO MANUAL
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'camera' ? (
                <div className="space-y-6">
                  <div id="reader" className="overflow-hidden rounded-2xl border-2 border-dashed border-gray-200"></div>
                  <p className="text-center text-sm text-gray-400 px-4">
                    Aponte a câmera para o QR Code do cliente.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">ID do Cupom</label>
                      <input 
                        type="text" 
                        value={manualCode}
                        onChange={(e) => setManualCode(e.target.value)}
                        placeholder="Ex: 550e8400-e29b..."
                        className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl outline-none focus:border-[#00B9F2] text-gray-700 font-mono text-sm"
                        disabled={status === 'loading'}
                      />
                   </div>
                   <button 
                    disabled={!manualCode || status === 'loading'}
                    onClick={() => validarCupom(manualCode)}
                    className="w-full bg-[#00B9F2] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#00B9F2]/20 hover:bg-[#0092bf] transition-all disabled:opacity-30 uppercase tracking-widest"
                  >
                    {status === 'loading' ? <Loader2 className="animate-spin mx-auto" /> : "Confirmar Validação"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}