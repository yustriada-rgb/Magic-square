import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ password: z.string().min(8) });

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await prisma.admin.update({ where: { id }, data: { passwordHash } });

  await prisma.adminLog.create({
    data: { adminId: actor.id, action: 'PASSWORD_CHANGE', entityType: 'admin', entityId: id },
  });

  return NextResponse.json({ ok: true });
}
