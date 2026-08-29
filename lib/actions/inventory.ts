'use server';

import { and, eq, ilike, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { entradasMercaderia, productos } from '@/lib/db/schema';
import { requireUser } from '@/lib/auth';

export async function searchProducts(query: string) {
  await requireUser();
  if (query.trim().length < 2) return [];
  return db.select().from(productos).where(ilike(productos.descripcion, `%${query}%`)).limit(10);
}

export async function registrarEntradaMercaderia(input: { productoId: number; proveedorId?: number; cantidad: number; costoUnitario: number }) {
  const user = await requireUser('ADMINISTRADOR');
  return db.transaction(async (tx) => {
    const [producto] = await tx.select().from(productos).where(eq(productos.id, input.productoId)).for('update');
    if (!producto) throw new Error('Producto inexistente');
    const stockActual = Number(producto.cantidadActual);
    const costoActual = Number(producto.costoUnitario);
    const nuevaCantidad = stockActual + input.cantidad;
    const cpp = nuevaCantidad === 0 ? 0 : ((stockActual * costoActual) + (input.cantidad * input.costoUnitario)) / nuevaCantidad;
    await tx.insert(entradasMercaderia).values({ productoId: input.productoId, proveedorId: input.proveedorId, cantidad: String(input.cantidad), costoUnitario: String(input.costoUnitario), usuarioId: user.id });
    const [updated] = await tx.update(productos).set({ cantidadActual: String(nuevaCantidad), costoUnitario: String(cpp.toFixed(2)) }).where(and(eq(productos.id, input.productoId), sql`${productos.cantidadActual} >= 0`)).returning();
    return updated;
  });
}
