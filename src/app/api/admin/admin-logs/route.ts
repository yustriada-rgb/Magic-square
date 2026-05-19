import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const logs = await prisma.adminLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { admin: { select: { login: true, displayName: true } } },
  });

  return NextResponse.json(logs);
}
