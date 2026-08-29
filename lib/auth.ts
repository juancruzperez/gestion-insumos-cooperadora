import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export type Rol = 'ADMINISTRADOR' | 'SOLICITANTE';
export type SessionUser = { id: string; email: string; nombre: string; rol: Rol };

export async function getSessionUser(): Promise<SessionUser | null> {
  const raw = (await cookies()).get('cooperadora_session')?.value;
  if (!raw) return null;
  try { return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as SessionUser; } catch { return null; }
}

export async function requireUser(requiredRole?: Rol) {
  const user = await getSessionUser();
  if (!user) redirect('/login');
  if (requiredRole && user.rol !== requiredRole) redirect('/403');
  return user;
}
