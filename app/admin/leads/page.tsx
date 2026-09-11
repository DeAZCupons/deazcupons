import { createClient } from '@supabase/supabase-js';
import { MessageSquare, Phone, User, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

// Usando as variáveis de ambiente diretamente para o Server Component
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async function LeadsPage() {
  // Busca os leads no banco de dados
  const { data: leads, error } = await supabase
    .from("leads_parceiros")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Erro ao buscar leads:", error);
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Interessados (Leads)</h1>
          <p className="text-slate-500 text-sm">Acompanhe novos pré-cadastros vindos do site.</p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-lg border border-blue-100 dark:border-blue-800">
          <span className="text-blue-600 dark:text-blue-400 font-bold text-lg">{leads?.length || 0}</span>
          <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">leads totais</span>
        </div>
      </div>

      <div className="grid gap-4">
        {leads?.map((lead) => (
          <div key={lead.id} className="bg-white dark:bg-[#2a2a2a] border border-[#E9EDF1] dark:border-[#333] rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:shadow-sm transition-shadow">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-bold text-lg text-slate-800 dark:text-white">{lead.nome_fantasia}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  lead.status === 'novo' ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {lead.status || 'NOVO'}
                </span>
              </div>
              
              <div className="flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-2"><User size={16} className="text-[#00B9F2]"/> {lead.responsavel}</span>
                <span className="flex items-center gap-2"><Calendar size={16} className="text-[#00B9F2]"/> {new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-xs font-medium">{lead.segmento}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <a 
                href={`mailto:${lead.email}`}
                className="p-3 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-600 dark:text-slate-300"
                title="Enviar E-mail"
              >
                <MessageSquare size={20} />
              </a>
              
              <a 
                href={`https://wa.me/55${lead.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#128C7E] text-white px-5 py-3 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm text-sm"
              >
                <Phone size={18} fill="currentColor" />
                WHATSAPP
              </a>

              {lead.status === 'convertido' ? (
                <span className="px-4 py-3 text-green-600 bg-green-50 rounded-lg text-xs font-bold uppercase">
                  Convertido
                </span>
              ) : (
                <Link
                  href={`/admin/partners/new?leadId=${lead.id}&nome=${encodeURIComponent(lead.nome_fantasia || '')}&responsavel=${encodeURIComponent(lead.responsavel || '')}&whatsapp=${encodeURIComponent(lead.whatsapp || '')}&email=${encodeURIComponent(lead.email || '')}`}
                  className="bg-[#00B9F2] hover:bg-[#0092bf] text-white px-5 py-3 rounded-lg flex items-center gap-2 font-bold transition-colors shadow-sm text-sm"
                  title="Converter em Parceiro"
                >
                  Converter <ArrowRight size={18} />
                </Link>
              )}
            </div>
          </div>
        ))}

        {(!leads || leads.length === 0) && (
          <div className="text-center py-20 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <p className="text-slate-400 font-medium">Nenhum lead recebido ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}