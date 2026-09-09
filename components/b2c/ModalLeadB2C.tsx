'use client';

import { useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModalLeadB2C({ isOpen, onClose }: ModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nome: formData.get('nome'),
      email: formData.get('email'),
      whatsapp: formData.get('whatsapp'),
    };

    try {
      const response = await fetch('/api/b2c/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setSuccess(true);
        toast.success('Inscrição realizada com sucesso!');
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error('Erro ao enviar cadastro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={24} />
        </button>

        {!success ? (
          <div className="p-8">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900">Garanta seu Acesso</h3>
              <p className="text-slate-500 mt-2">Seja o primeiro a saber quando novos cupons exclusivos chegarem.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  required
                  name="nome"
                  type="text"
                  placeholder="Ex: João Silva"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#00B9F2] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                <input
                  required
                  name="email"
                  type="email"
                  placeholder="joao@exemplo.com"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#00B9F2] focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp (Opcional)</label>
                <input
                  name="whatsapp"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#00B9F2] focus:border-transparent outline-none transition-all"
                />
              </div>

              <button
                disabled={loading}
                className="w-full py-4 bg-[#00B9F2] text-white rounded-lg font-bold hover:bg-[#009dc2] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processando...' : 'Quero economizar agora!'}
                <Send size={18} />
              </button>
            </form>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Quase lá!</h3>
            <p className="text-slate-500 mt-4 mb-8">
              Enviamos um link de confirmação para o seu e-mail. Verifique sua caixa de entrada para ativar seus cupons.
            </p>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold hover:bg-slate-200 transition-all"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}