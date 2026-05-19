import { NextResponse } from 'next/server';
import { clearSession, requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const admin = await requireAdmin();
  if (admin) {
    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'LOGOUT', entityType: 'auth' } });
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
