import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const schema = z.object({ title: z.string().min(2), text: z.string().min(5) });

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  return NextResponse.json(await prisma.news.findMany({ orderBy: { publishedAt: 'desc' }, take: 200 }));
}

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  const created = await prisma.news.create({ data: { ...parsed.data, publishedAt: new Date(), source: 'MANUAL' } });
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'news', entityId: created.id } });
  return NextResponse.json(created, { status: 201 });
}
