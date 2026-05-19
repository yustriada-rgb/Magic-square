import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { setSession, verifyPassword } from '@/lib/auth';

const schema = z.object({ login: z.string().min(2), password: z.string().min(4) });

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

  const admin = await prisma.admin.findUnique({ where: { login: parsed.data.login } });
  if (!admin || admin.status !== 'ACTIVE') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const ok = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!ok) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await setSession(admin.id);
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'LOGIN', entityType: 'auth' } });
  return NextResponse.json({ ok: true });
}
