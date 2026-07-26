import { auth } from '@/lib/auth/auth';
import { headers } from 'next/headers';

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error('UNAUTHENTICATED');
  return session;
}

export async function requireRole(role: 'PATIENT' | 'DOCTOR' | 'ADMIN') {
  const session = await requireSession();
  if (session.user.role !== role) throw new Error('FORBIDDEN');
  return session;
}

export async function getOptionalSession() {
  return auth.api.getSession({ headers: await headers() });
}