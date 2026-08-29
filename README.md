# Sistema de Gestión de Stock y Pedidos - Cooperadora Escolar

Arquitectura Next.js App Router con TypeScript, PostgreSQL y Drizzle ORM.

## Módulos implementados

- RBAC por middleware con roles `ADMINISTRADOR` y `SOLICITANTE`.
- Esquema relacional PostgreSQL para usuarios, productos, proveedores, entradas, pedidos, ítems, actas e historial.
- Server Actions transaccionales para entradas de mercadería con CPP y despacho parcial con remanentes.
- SSE en `/api/notifications` para alertar nuevos pedidos.
- Exportación Excel en `/api/reports/inventory` con stock valorizado.
- Componentes cliente para autocomplete con solicitud especial, timeline de auditoría y descarga PDF de actas.

## Instalación

```bash
npm install
cp .env.example .env.local
npm run db:migrate
npm run dev
```
