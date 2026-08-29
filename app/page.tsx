import { ProductAutocomplete } from '@/components/product-autocomplete';

export default function HomePage() {
  return <main className="mx-auto max-w-4xl p-8"><h1 className="text-3xl font-bold">Gestión de Insumos - Cooperadora</h1><p className="mt-2 text-slate-600">Catálogo con solicitud especial integrada.</p><div className="mt-8"><ProductAutocomplete /></div></main>;
}
