import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ title: z.string().min(2), description: z.string().min(5), room: z.string().optional() });

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await prisma.direction.findMany({ orderBy: { sortOrder: 'asc' } }));
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  const created = await prisma.direction.create({ data: { ...parsed.data } });
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'direction', entityId: created.id } });
  return NextResponse.json(created, { status: 201 });
}
