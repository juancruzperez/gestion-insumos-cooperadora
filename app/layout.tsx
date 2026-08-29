import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cooperadora Escolar', description: 'Gestión de stock y pedidos' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es"><body>{children}</body></html>;
}
