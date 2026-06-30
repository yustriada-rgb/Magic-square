import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  displayName: z.string().min(2).optional(),
  status: z.enum(['ACTIVE', 'BLOCKED']),
});

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAdmin();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (actor.id === id) return NextResponse.json({ error: 'Нельзя блокировать самого себя' }, { status: 400 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const updated = await prisma.admin.update({
    where: { id },
    data: parsed.data,
    select: { id: true, login: true, displayName: true, status: true, createdAt: true },
  });

  await prisma.adminLog.create({
    data: { adminId: actor.id, action: 'UPDATE', entityType: 'admin', entityId: updated.id },
  });

  return NextResponse.json(updated);
}
