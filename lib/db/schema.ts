import { relations, sql } from 'drizzle-orm';
import { boolean, integer, numeric, pgEnum, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const rolUsuario = pgEnum('rol_usuario', ['ADMINISTRADOR', 'SOLICITANTE']);
export const estadoPedido = pgEnum('estado_pedido', ['PENDIENTE_APROBACION', 'PENDIENTE', 'ENTREGADO_PARCIAL', 'ENTREGADO', 'CANCELADO']);

export const usuarios = pgTable('usuarios', {
  id: uuid('id').defaultRandom().primaryKey(),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  rol: rolUsuario('rol').notNull().default('SOLICITANTE'),
  activo: boolean('activo').notNull().default(true),
});

export const productos = pgTable('productos', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  descripcion: text('descripcion').notNull(),
  unidadMedida: text('unidad_medida').notNull(),
  categoria: text('categoria').notNull(),
  costoUnitario: numeric('costo_unitario', { precision: 12, scale: 2 }).notNull().default('0'),
  cantidadActual: numeric('cantidad_actual', { precision: 12, scale: 2 }).notNull().default('0'),
  stockMinimo: numeric('stock_minimo', { precision: 12, scale: 2 }).notNull().default('0'),
});

export const proveedores = pgTable('proveedores', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  cuit: text('cuit'),
  email: text('email'),
  activo: boolean('activo').notNull().default(true),
});

export const entradasMercaderia = pgTable('entradas_mercaderia', {
  id: serial('id').primaryKey(),
  productoId: integer('producto_id').notNull().references(() => productos.id),
  proveedorId: integer('proveedor_id').references(() => proveedores.id),
  cantidad: numeric('cantidad', { precision: 12, scale: 2 }).notNull(),
  costoUnitario: numeric('costo_unitario', { precision: 12, scale: 2 }).notNull(),
  usuarioId: uuid('usuario_id').notNull().references(() => usuarios.id),
  fecha: timestamp('fecha', { withTimezone: true }).notNull().defaultNow(),
});

export const pedidos = pgTable('pedidos', {
  id: serial('id').primaryKey(),
  usuarioId: uuid('usuario_id').notNull().references(() => usuarios.id),
  pedidoPadreId: integer('pedido_padre_id'),
  estado: estadoPedido('estado').notNull().default('PENDIENTE_APROBACION'),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  actualizadoEn: timestamp('actualizado_en', { withTimezone: true }).notNull().defaultNow(),
});

export const pedidoItems = pgTable('pedido_items', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').notNull().references(() => pedidos.id),
  productoId: integer('producto_id').references(() => productos.id),
  descripcionPersonalizada: text('descripcion_personalizada'),
  cantidadSolicitada: numeric('cantidad_solicitada', { precision: 12, scale: 2 }).notNull(),
  cantidadEntregada: numeric('cantidad_entregada', { precision: 12, scale: 2 }).notNull().default('0'),
});

export const actasEntrega = pgTable('actas_entrega', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').notNull().references(() => pedidos.id),
  solicitanteId: uuid('solicitante_id').notNull().references(() => usuarios.id),
  responsableId: uuid('responsable_id').notNull().references(() => usuarios.id),
  observaciones: text('observaciones'),
  creadaEn: timestamp('creada_en', { withTimezone: true }).notNull().defaultNow(),
});

export const pedidoHistorialEventos = pgTable('pedido_historial_eventos', {
  id: serial('id').primaryKey(),
  pedidoId: integer('pedido_id').notNull().references(() => pedidos.id),
  usuarioId: uuid('usuario_id').references(() => usuarios.id),
  estadoAnterior: estadoPedido('estado_anterior'),
  estadoNuevo: estadoPedido('estado_nuevo').notNull(),
  descripcion: text('descripcion').notNull(),
  creadoEn: timestamp('creado_en', { withTimezone: true }).notNull().defaultNow(),
  metadata: text('metadata').notNull().default(sql`'{}'::text`),
});

export const pedidoRelations = relations(pedidos, ({ one, many }) => ({
  usuario: one(usuarios, { fields: [pedidos.usuarioId], references: [usuarios.id] }),
  items: many(pedidoItems),
  eventos: many(pedidoHistorialEventos),
}));
