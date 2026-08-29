'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import { searchProducts } from '@/lib/actions/inventory';

type Product = Awaited<ReturnType<typeof searchProducts>>[number];

export function ProductAutocomplete({ onSelect }: { onSelect?: (item: { productoId?: number; descripcionPersonalizada?: string }) => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [pending, startTransition] = useTransition();
  const fallback = useMemo(() => query.trim().length > 1 && !results.some((p) => p.descripcion.toLowerCase() === query.toLowerCase()), [query, results]);
  useEffect(() => { const id = setTimeout(() => startTransition(async () => setResults(await searchProducts(query))), 250); return () => clearTimeout(id); }, [query]);
  return <div className="relative w-full max-w-xl"><label className="text-sm font-medium">Buscar producto o solicitud especial</label><input className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ej: Tiza blanca" />{(results.length > 0 || fallback) && <div className="absolute z-10 mt-2 w-full overflow-hidden rounded-lg border bg-white shadow-lg">{pending && <p className="px-4 py-2 text-sm text-slate-500">Buscando...</p>}{results.map((product) => <button key={product.id} className="block w-full px-4 py-3 text-left hover:bg-blue-50" onClick={() => onSelect?.({ productoId: product.id })}><span className="font-medium">{product.descripcion}</span><span className="ml-2 text-xs text-slate-500">Stock {product.cantidadActual} {product.unidadMedida}</span></button>)}{fallback && <button className="block w-full border-t px-4 py-3 text-left text-amber-700 hover:bg-amber-50" onClick={() => onSelect?.({ descripcionPersonalizada: query })}>Usar “{query}” como solicitud especial</button>}</div>}</div>;
}
