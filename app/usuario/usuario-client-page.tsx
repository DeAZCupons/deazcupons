'use client';

import { useState } from 'react';
// O @/ agora aponta para a raiz, então ele encontra a pasta components fora de app
import { HeroB2C } from '@/components/b2c/Hero'; 
import { ModalLeadB2C } from '@/components/b2c/ModalLeadB2C';

export function UsuarioClientPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero com a função de abrir o modal */}
      <HeroB2C onOpenModal={() => setIsModalOpen(true)} />
      
      {/* 2. Modal de Captura de Leads */}
      <ModalLeadB2C 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />

      {/* Outras seções da Landing Page podem vir aqui abaixo */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 text-center text-slate-400 font-medium">
          Mais seções em breve...
        </div>
      </section>
    </main>
  );
}