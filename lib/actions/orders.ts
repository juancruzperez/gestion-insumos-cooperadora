'use server';

import { eq, inArray } from 'drizzle-orm';
import { db } from '@/lib/db';
import { actasEntrega, pedidoHistorialEventos, pedidoItems, pedidos, productos } from '@/lib/db/schema';
import { requireUser } from '@/lib/auth';
import { publishNotification } from '@/lib/notifications';

export async function crearPedido(items: Array<{ productoId?: number; descripcionPersonalizada?: string; cantidad: number }>) {
  const user = await requireUser();
  const pedido = await db.transaction(async (tx) => {
    const [created] = await tx.insert(pedidos).values({ usuarioId: user.id }).returning();
    await tx.insert(pedidoItems).values(items.map((item) => ({ pedidoId: created.id, productoId: item.productoId, descripcionPersonalizada: item.descripcionPersonalizada, cantidadSolicitada: String(item.cantidad) })));
    await tx.insert(pedidoHistorialEventos).values({ pedidoId: created.id, usuarioId: user.id, estadoNuevo: 'PENDIENTE_APROBACION', descripcion: 'Pedido creado por solicitante' });
    return created;
  });
  publishNotification({ tipo: 'NUEVO_PEDIDO', pedidoId: pedido.id, usuario: user.nombre });
  return pedido;
}

export async function despacharPedido(pedidoId: number, entregas: Array<{ itemId: number; cantidadEntregada: number }>, observaciones?: string) {
  const admin = await requireUser('ADMINISTRADOR');
  return db.transaction(async (tx) => {
    const [pedido] = await tx.select().from(pedidos).where(eq(pedidos.id, pedidoId)).for('update');
    if (!pedido) throw new Error('Pedido inexistente');
    const items = await tx.select().from(pedidoItems).where(eq(pedidoItems.pedidoId, pedidoId));
    const productIds = items.map((i) => i.productoId).filter((id): id is number => id !== null);
    const stock = productIds.length ? await tx.select().from(productos).where(inArray(productos.id, productIds)).for('update') : [];
    for (const entrega of entregas) {
      const item = items.find((i) => i.id === entrega.itemId);
      if (!item) throw new Error(`Item ${entrega.itemId} no pertenece al pedido`);
      if (!item.productoId && entrega.cantidadEntregada > 0) throw new Error('Las solicitudes especiales deben resolverse antes del despacho');
      const producto = stock.find((p) => p.id === item.productoId);
      if (producto && Number(producto.cantidadActual) < entrega.cantidadEntregada) throw new Error(`Stock insuficiente para ${producto.descripcion}`);
    }
    for (const entrega of entregas) {
      const item = items.find((i) => i.id === entrega.itemId)!;
      if (item.productoId && entrega.cantidadEntregada > 0) {
        const producto = stock.find((p) => p.id === item.productoId)!;
        await tx.update(productos).set({ cantidadActual: String(Number(producto.cantidadActual) - entrega.cantidadEntregada) }).where(eq(productos.id, item.productoId));
      }
      await tx.update(pedidoItems).set({ cantidadEntregada: String(entrega.cantidadEntregada) }).where(eq(pedidoItems.id, item.id));
    }
    const parcial = items.some((item) => (entregas.find((e) => e.itemId === item.id)?.cantidadEntregada ?? 0) < Number(item.cantidadSolicitada));
    const estadoNuevo = parcial ? 'ENTREGADO_PARCIAL' : 'ENTREGADO';
    const [acta] = await tx.insert(actasEntrega).values({ pedidoId, solicitanteId: pedido.usuarioId, responsableId: admin.id, observaciones }).returning();
    await tx.update(pedidos).set({ estado: estadoNuevo, actualizadoEn: new Date() }).where(eq(pedidos.id, pedidoId));
    if (parcial) {
      const [hijo] = await tx.insert(pedidos).values({ usuarioId: pedido.usuarioId, pedidoPadreId: pedidoId, estado: 'PENDIENTE' }).returning();
      const remanentes = items.map((item) => ({ item, entregada: entregas.find((e) => e.itemId === item.id)?.cantidadEntregada ?? 0 })).filter(({ item, entregada }) => Number(item.cantidadSolicitada) - entregada > 0);
      await tx.insert(pedidoItems).values(remanentes.map(({ item, entregada }) => ({ pedidoId: hijo.id, productoId: item.productoId, descripcionPersonalizada: item.descripcionPersonalizada, cantidadSolicitada: String(Number(item.cantidadSolicitada) - entregada) })));
      await tx.insert(pedidoHistorialEventos).values({ pedidoId: hijo.id, usuarioId: admin.id, estadoNuevo: 'PENDIENTE', descripcion: `Remanente automático del pedido ${pedidoId}` });
    }
    await tx.insert(pedidoHistorialEventos).values({ pedidoId, usuarioId: admin.id, estadoAnterior: pedido.estado, estadoNuevo, descripcion: `Despacho registrado en acta ${acta.id}` });
    return acta;
  });
}
