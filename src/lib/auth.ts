import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'ac_session';

export async function verifyPassword(raw: string, hash: string) {
  return bcrypt.compare(raw, hash);
}

export async function setSession(adminId: string) {
  const store = await cookies();
  store.set(COOKIE_NAME, adminId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function requireAdmin() {
  const store = await cookies();
  const adminId = store.get(COOKIE_NAME)?.value;
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}
