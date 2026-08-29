import ExcelJS from 'exceljs';
import { db } from '@/lib/db';
import { productos } from '@/lib/db/schema';

export const runtime = 'nodejs';

export async function GET() {
  const rows = await db.select().from(productos);
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Inventario');
  sheet.columns = [
    { header: 'Código', key: 'codigo', width: 16 }, { header: 'Descripción', key: 'descripcion', width: 42 },
    { header: 'Unidad', key: 'unidadMedida', width: 12 }, { header: 'Categoría', key: 'categoria', width: 20 },
    { header: 'Cantidad', key: 'cantidad', width: 12 }, { header: 'CPP', key: 'cpp', width: 12 }, { header: 'Valorizado', key: 'valor', width: 14 },
  ];
  let total = 0;
  rows.forEach((p) => { const valor = Number(p.cantidadActual) * Number(p.costoUnitario); total += valor; sheet.addRow({ ...p, cantidad: Number(p.cantidadActual), cpp: Number(p.costoUnitario), valor }); });
  sheet.addRow({ descripcion: 'TOTAL STOCK VALORIZADO', valor: total });
  sheet.getRow(1).font = { bold: true };
  const buffer = await workbook.xlsx.writeBuffer();
  return new Response(buffer, { headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'Content-Disposition': 'attachment; filename="inventario-valorizado.xlsx"' } });
}
