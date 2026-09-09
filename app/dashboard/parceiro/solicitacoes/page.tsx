"use client";
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Clock, CheckCircle2, Wrench, Plus, Search, ExternalLink, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const StatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { color: string, icon: any, label: string }> = {
    'Recebido': { color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, label: 'Recebido' },
    'Produção': { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Wrench, label: 'Em Produção' },
    'Finalizado': { color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, label: 'No Ar' },
  };

  const config = configs[status] || configs['Recebido'];
  const Icon = config.icon;

  return (
    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border uppercase tracking-wider ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
};

export default function MinhasSolicitacoes() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (user) {
        const { data: partner } = await supabase
          .from('partners')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (partner) {
          const { data } = await supabase
            .from('coupon_requests')
            .select('*')
            .eq('partner_id', partner.id)
            .order('created_at', { ascending: false });
          
          setRequests(data || []);
        }
      }
      setLoading(false);
    }

    fetchRequests();
  }, [supabase]);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Meus Pedidos de Cupons</h2>
          <p className="text-gray-500 text-sm">Acompanhe o status de publicação das suas ofertas.</p>
        </div>
        <Link 
          href="/dashboard/parceiro/novo-cupom"
          className="bg-[#00B9F2] text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-[#0092bf] transition-all shadow-lg shadow-[#00B9F2]/20 active:scale-95 text-sm"
        >
          <Plus size={18} /> Novo Cupom
        </Link>
      </header>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-8 h-8 border-4 border-[#00B9F2] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 font-medium animate-pulse">Carregando solicitações...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[32px] p-16 text-center shadow-sm">
           <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-gray-300" size={32} />
           </div>
           <h3 className="text-xl font-bold text-gray-700 mb-2">Nenhum cupom por aqui</h3>
           <p className="text-gray-500 mb-8 max-w-xs mx-auto">Você ainda não enviou solicitações. Que tal criar sua primeira oferta agora?</p>
           <Link href="/dashboard/parceiro/novo-cupom" className="text-[#00B9F2] font-black flex items-center justify-center gap-2 hover:underline uppercase text-sm tracking-widest">
             Criar cupom <ArrowRight size={16} />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(req => (
            <div 
              key={req.id} 
              className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                   <h4 className="font-bold text-gray-800 text-lg leading-tight">{req.title}</h4>
                   <StatusBadge status={req.status} />
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-400">
                  <span className="bg-gray-100 px-2 py-0.5 rounded font-mono font-bold text-gray-500">
                    #{req.code}
                  </span>
                  <span>Solicitado em {new Date(req.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                {req.status === 'Finalizado' ? (
                  <Link 
                    href={`/vitrine?search=${req.code}`} 
                    target="_blank" 
                    className="flex-1 md:flex-none bg-[#00B9F2]/10 text-[#00B9F2] px-4 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#00B9F2] hover:text-white transition-all group"
                  >
                    VER NO SITE 
                    <ExternalLink size={14} className="group-hover:scale-110 transition-transform" />
                  </Link>
                ) : (
                  <p className="text-[10px] text-gray-400 font-medium italic">
                    {req.status === 'Produção' ? 'Disponível em breve...' : 'Aguardando revisão'}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}