"use client";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { 
  Clock, 
  CheckCircle2, 
  Wrench, 
  Store, 
  Filter
} from 'lucide-react';
import { toast } from 'sonner';

type CouponRequest = {
  id: string;
  title: string;
  code: string;
  long_description: string | null;
  partner_id: string;
  status: string;
  valid_until: string | null;
  coupon_id?: string | null; // Adicionado para o vínculo
  partners?: {
    name: string;
    logo_url: string | null;
  } | null;
};

export default function AdminSolicitacoes() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [requests, setRequests] = useState<CouponRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // FUNÇÃO CORRIGIDA: Agora define newCoupon corretamente
  async function iniciarProducao(req: CouponRequest) {
    // 1. Se já existe um cupom vinculado, apenas redireciona para edição
    if (req.coupon_id) {
      const { data: existing } = await supabase.from('coupons').select('id').eq('id', req.coupon_id).single();
      if (existing) {
        router.push(`/admin/coupons/edit/${req.coupon_id}`);
        return;
      }
    }

    setLoading(true);
    try {
      // 2. Definir data de validade padrão (30 dias)
      const hoje = new Date();
      hoje.setDate(hoje.getDate() + 30);
      const dataPadrao = hoje.toISOString().split('T')[0];
      const validadeFinal = req.valid_until || dataPadrao;

      // 3. Criar o cupom na tabela oficial 'coupons'
      const { data: newCoupon, error: couponError } = await supabase
        .from('coupons')
        .insert({
          title: req.title,
          alphanumeric_code: req.code,
          short_description: req.title.substring(0, 50),
          long_description: req.long_description,
          partner_id: req.partner_id,
          expires_at: validadeFinal,
          active: false 
        })
        .select()
        .single();

      if (couponError) throw couponError;

      // 4. Atualizar a solicitação com o status Produção e o vínculo do cupom
      const { error: requestError } = await supabase
        .from('coupon_requests')
        .update({ 
          status: 'Produção',
          coupon_id: newCoupon.id 
        })
        .eq('id', req.id);

      if (requestError) throw requestError;

      toast.success("Cupom movido para produção!");
      
      // 5. Redirecionar para a tela de edição
      router.push(`/admin/coupons/edit/${newCoupon.id}`);

    } catch (error: any) {
      console.error(error);
      toast.error("Erro ao processar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function fetchAllRequests() {
    setLoading(true);
    // Buscamos APENAS o que NÃO está finalizado
    const { data, error } = await supabase
      .from('coupon_requests')
      .select(`*, partners (name, logo_url)`)
      .filter('status', 'in', '("Recebido","Produção")') // Só mostra esses dois
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('coupon_requests')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error("Erro ao atualizar status");
    } else {
      toast.success(`Status alterado para ${newStatus}`);
      await fetchAllRequests();
    }
  }

  useEffect(() => {
    fetchAllRequests();
  }, []);

  return (
    <div className="p-6 bg-white min-h-screen">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800 tracking-tight uppercase">Solicitações Pendentes</h1>
          <p className="text-gray-500 text-sm font-medium">Gerencie os cupons que aguardam produção ou publicação.</p>
        </div>
        <button onClick={fetchAllRequests} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Filter size={20} className="text-gray-400" />
        </button>
      </header>

      {loading ? (
        <div className="flex justify-center py-20 text-gray-400 font-medium animate-pulse">Carregando solicitações...</div>
      ) : requests.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed">
            <p className="text-gray-400">Nenhuma solicitação pendente no momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto border rounded-2xl shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Parceiro</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Cupom Enviado</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Status</th>
                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden border shadow-sm">
                        {req.partners?.logo_url ? (
                            <img src={req.partners.logo_url} alt="" className="object-contain" />
                        ) : <Store size={20} className="text-gray-200" />}
                      </div>
                      <span className="font-bold text-gray-700">{req.partners?.name || 'Parceiro'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-[#00B9F2] leading-tight">{req.title}</p>
                    <p className="text-xs text-gray-400 font-mono mt-1">{req.code}</p>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border 
                      ${req.status === 'Recebido' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                        req.status === 'Produção' ? 'bg-blue-50 text-blue-600 border-blue-100' : 
                        'bg-green-50 text-green-600 border-green-100'}`}>
                      {req.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => iniciarProducao(req)}
                        className={`p-2 rounded-xl transition-all border shadow-sm ${
                          req.status === 'Produção' 
                            ? 'bg-[#00B9F2] text-white border-[#00B9F2]' 
                            : 'bg-white text-gray-400 hover:text-[#00B9F2] border-gray-100'
                        }`}
                        title="Produzir Cupom"
                      >
                        <Wrench size={18} />
                      </button>
                      <button 
                        onClick={() => updateStatus(req.id, 'Finalizado')}
                        className="p-2 bg-white text-gray-400 hover:text-green-600 rounded-xl transition-all border border-gray-100 shadow-sm"
                        title="Marcar como Finalizado"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}