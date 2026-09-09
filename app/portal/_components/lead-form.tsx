"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, CheckCircle2 } from "lucide-react";

const leadSchema = z.object({
  nomeFantasia: z.string().min(3, "Nome da empresa é obrigatório"),
  responsavel: z.string().min(3, "Nome do responsável é obrigatório"),
  whatsapp: z.string().min(10, "Informe um WhatsApp válido"),
  email: z.string().email("E-mail inválido"),
  segmento: z.string().min(1, "Selecione um segmento"),
});

type LeadFormData = z.infer<typeof leadSchema>;

// Certifique-se de que o 'export' esteja aqui:
export function LeadForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<LeadFormData>({
    resolver: zodResolver(leadSchema)
  });

  async function onSubmit(data: LeadFormData) {
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Se a API retornou erro, lança para o catch
        throw new Error(result.details || result.error || "Erro ao salvar");
      }

      // SUCESSO
      setIsSuccess(true);
      reset();
    } catch (error: any) {
      console.error("Erro completo:", error);
      alert(`Erro ao enviar: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  }

  // TELA DE SUCESSO - BEM VISÍVEL
  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-4">
          Recebemos seu contato!
        </h3>
        {/* ERRO CORRIGIDO: Markdown (**) não funciona em JSX. Use <strong> ou <b> para negrito */}
        <p className="text-lg text-slate-600 mb-8 max-w-xs">
          Nossa equipe comercial analisará seus dados e entrará em contato pelo <strong>WhatsApp</strong> em até 24 horas.
        </p>
        <button 
          onClick={() => setIsSuccess(false)}
          className="text-[#00B9F2] font-semibold hover:underline flex items-center gap-2"
        >
          Enviar outra solicitação
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      {/* ... Mantenha os campos do formulário aqui ... */}
      <div>
        <label className="block text-sm font-medium mb-1">Nome da Empresa</label>
        <input 
          {...register("nomeFantasia")}
          className="w-full p-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#00B9F2]"
          placeholder="Ex: Pizzaria do Zé"
        />
        {errors.nomeFantasia && <span className="text-red-500 text-xs">{errors.nomeFantasia.message}</span>}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Responsável</label>
          <input {...register("responsavel")} className="w-full p-3 rounded-lg border border-slate-200" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">WhatsApp</label>
          <input {...register("whatsapp")} className="w-full p-3 rounded-lg border border-slate-200" />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">E-mail</label>
        <input {...register("email")} type="email" className="w-full p-3 rounded-lg border border-slate-200" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Segmento</label>
        <select {...register("segmento")} className="w-full p-3 rounded-lg border border-slate-200 bg-white">
          <option value="">Selecione...</option>
          <option value="alimentacao">Alimentação</option>
          <option value="servicos">Serviços</option>
          <option value="varejo">Varejo</option>
        </select>
      </div>
      {/* Exemplo do botão atualizado com o texto de loading melhorado */}
      <button 
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#00B9F2] hover:bg-[#0096c4] text-white font-bold py-4 rounded-lg transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin w-5 h-5" />
            ENVIANDO DADOS...
          </>
        ) : (
          "QUERO SER PARCEIRO AGORA"
        )}
      </button>
    </form>
  );
}
