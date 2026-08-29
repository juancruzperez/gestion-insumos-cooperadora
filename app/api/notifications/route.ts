import { subscribe } from '@/lib/notifications';

export const runtime = 'nodejs';

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode('event: connected\ndata: {"ok":true}\n\n'));
      const unsubscribe = subscribe((payload) => controller.enqueue(encoder.encode(`event: pedido\ndata: ${payload}\n\n`)));
      return () => unsubscribe();
    },
  });
  return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', Connection: 'keep-alive' } });
}
