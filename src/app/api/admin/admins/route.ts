import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const createSchema = z.object({
  login: z.string().min(3),
  password: z.string().min(8),
  displayName: z.string().min(2).optional(),
});

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admins = await prisma.admin.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, login: true, displayName: true, status: true, createdAt: true },
  });

  return NextResponse.json(admins);
}

export async function POST(req: Request) {
  const actor = await requireAdmin();
  if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  const created = await prisma.admin.create({
    data: {
      login: parsed.data.login,
      displayName: parsed.data.displayName,
      passwordHash,
    },
    select: { id: true, login: true, displayName: true, status: true, createdAt: true },
  });

  await prisma.adminLog.create({
    data: { adminId: actor.id, action: 'CREATE', entityType: 'admin', entityId: created.id },
  });

  return NextResponse.json(created, { status: 201 });
}
