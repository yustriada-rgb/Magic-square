import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

const schema = z.object({ recipientEmail: z.string().email(), legalInn: z.string().optional(), legalOgrn: z.string().optional(), legalName: z.string().optional(), legalAddress: z.string().optional(), legalPhone: z.string().optional(), legalEmail: z.string().optional(), consentLabel: z.string().min(4), consentText: z.string().min(8) });

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return NextResponse.json(settings);
}

export async function PUT(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 });

  const settings = await prisma.siteSettings.update({ where: { id: 'main' }, data: parsed.data });
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'UPDATE', entityType: 'site_settings', entityId: settings.id } });
  return NextResponse.json(settings);
}
