'use client';

export type AuditEvent = { id: number; estadoNuevo: string; estadoAnterior?: string | null; descripcion: string; creadoEn: string | Date; usuario?: { nombre: string } | null };

export function AuditTimeline({ events }: { events: AuditEvent[] }) {
  return <ol className="relative border-s border-slate-300 pl-6">{events.map((event) => <li key={event.id} className="mb-8"><span className="absolute -start-2 mt-1 h-4 w-4 rounded-full border-2 border-white bg-blue-600" /><time className="text-xs text-slate-500">{new Date(event.creadoEn).toLocaleString('es-AR')}</time><h3 className="font-semibold text-slate-900">{event.estadoAnterior ? `${event.estadoAnterior} → ` : ''}{event.estadoNuevo}</h3><p className="text-sm text-slate-700">{event.descripcion}</p>{event.usuario?.nombre && <p className="text-xs text-slate-500">Usuario: {event.usuario.nombre}</p>}</li>)}</ol>;
}
