import { NextRequest, NextResponse } from 'next/server';

const adminOnly = ['/admin', '/api/reports', '/api/notifications'];
const protectedPaths = ['/pedidos', '/admin', '/api/reports', '/api/notifications'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!protectedPaths.some((path) => pathname.startsWith(path))) return NextResponse.next();
  const raw = req.cookies.get('cooperadora_session')?.value;
  if (!raw) return NextResponse.redirect(new URL('/login', req.url));
  const user = JSON.parse(atob(raw.replace(/-/g, '+').replace(/_/g, '/'))) as { rol?: string };
  if (adminOnly.some((path) => pathname.startsWith(path)) && user.rol !== 'ADMINISTRADOR') {
    return NextResponse.redirect(new URL('/403', req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
