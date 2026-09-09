import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Removi o ThemeProvider para evitar conflito de script com o Next.js 15/Turbopack */}
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}