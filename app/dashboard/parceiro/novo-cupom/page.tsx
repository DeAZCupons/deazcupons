"use client";
import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Calendar, Info, Send, Upload } from 'lucide-react';

export default function NovoCupom() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    try {
      // 1. Pegar o usuário logado
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Não autenticado");

      // 2. Pegar o ID do parceiro
      const { data: partner } = await supabase
        .from('partners')
        .select('id')
        .eq('user_id', session.user.id)
        .single();

      if (!partner) throw new Error("Parceiro não encontrado");

      // 3. Inserir na tabela coupon_requests
      const { error } = await supabase.from('coupon_requests').insert({
        partner_id: partner.id,
        title: formData.get('title'),
        code: formData.get('code'),
        short_description: formData.get('short_desc'),
        long_description: formData.get('long_desc'),
        valid_until: formData.get('validity') || null,
        status: 'Recebido'
      });

      if (error) throw error;

      toast.success("Solicitação enviada com sucesso!");
      router.push('/dashboard/parceiro/solicitacoes'); // Redireciona para a lista

    } catch (error: any) {
      toast.error("Erro ao enviar: " + error.message);
    } finally {
      setLoading(false);
    }
  }

 return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800">Solicitar Novo Cupom</h2>
        <p className="text-gray-500 text-sm">Preencha os dados abaixo e nossa equipe fará a publicação no portal.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Formulário */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nome do Cupom</label>
                <input name="title" placeholder="Ex: 20% de Desconto na Pizza Grande" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B9F2] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Código do Cupom</label>
                <input name="code" placeholder="Código" required className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B9F2] outline-none" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Válido até</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input name="validity" type="date" className="w-full p-3 pl-10 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B9F2] outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Imagem do Cupom (Opcional)</label>
                <div className="relative border-2 border-dashed border-gray-200 rounded-xl p-3 flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                  <Upload className="mr-2 text-gray-400" size={20} />
                  <span className="text-sm text-gray-500">Clique para enviar</span>
                  <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Descrição Resumida</label>
              <input name="short_desc" placeholder="Aparece no card do cupom (máx 50 caracteres)" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B9F2] outline-none" />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Regras / Descrição Longa</label>
              <textarea name="long_desc" placeholder="Descrição Longa" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#00B9F2] outline-nones" />
            </div>

            <button type="submit" disabled={loading} className="bg-[#00B9F2] text-white p-3 rounded">
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </form>
        </div>

        {/* Info sobre o Status */}
        <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3">
          <Info className="text-blue-500 flex-shrink-0" size={20} />
          <div className="text-sm text-blue-800">
            <strong>Entenda o processo:</strong> Após enviar, seu cupom entra em "Recebido". Nossa equipe criará as artes (Produção) e em até 24h ele estará "Finalizado" e disponível para milhares de usuários.
          </div>
        </div>
      </div>
    </div>
  );
}