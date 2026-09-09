// app/usuario/page.tsx
import { Metadata } from 'next';
import { UsuarioClientPage } from './usuario-client-page';

export const metadata: Metadata = {
  title: 'AZ Cupons | Economize em cada compra',
  description: 'Acesse cupons exclusivos das melhores lojas da sua região.',
  openGraph: {
    title: 'AZ Cupons - Seu portal de descontos exclusivo',
    description: 'Transforme suas compras com cupons de desconto reais.',
    images: ['/og-image-b2c.png'],
  },
};

export default function Page() {
  return <UsuarioClientPage />;
}