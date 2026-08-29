'use client';

import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';

type Acta = { id: number; creadaEn: string | Date; solicitante: string; responsable: string; items: Array<{ descripcion: string; cantidadEntregada: number; unidad?: string }> };
const styles = StyleSheet.create({ page: { padding: 32, fontSize: 11 }, title: { fontSize: 18, marginBottom: 16 }, row: { flexDirection: 'row', borderBottom: '1 solid #ddd', paddingVertical: 6 }, cell: { flex: 1 } });
function ActaDocument({ acta }: { acta: Acta }) { return <Document><Page style={styles.page}><Text style={styles.title}>Acta de Entrega #{acta.id}</Text><Text>Fecha: {new Date(acta.creadaEn).toLocaleString('es-AR')}</Text><Text>Solicitante: {acta.solicitante}</Text><Text>Responsable: {acta.responsable}</Text><View style={{ marginTop: 16 }}>{acta.items.map((item, i) => <View key={i} style={styles.row}><Text style={styles.cell}>{item.descripcion}</Text><Text style={styles.cell}>{item.cantidadEntregada} {item.unidad}</Text></View>)}</View></Page></Document>; }
export function DeliveryActPdfButton({ acta }: { acta: Acta }) { return <PDFDownloadLink className="rounded-lg bg-blue-600 px-4 py-2 text-white" document={<ActaDocument acta={acta} />} fileName={`acta-${acta.id}.pdf`}>{({ loading }) => loading ? 'Generando PDF...' : 'Descargar acta PDF'}</PDFDownloadLink>; }
