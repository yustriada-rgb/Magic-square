import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
const schema = z.object({ title: z.string().min(2), description: z.string().min(5), room: z.string().nullable().optional(), isPublished: z.boolean().optional() });
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) { const admin = await requireAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { id } = await params; const parsed = schema.safeParse(await req.json()); if (!parsed.success) return NextResponse.json({ error: 'Validation failed' }, { status: 400 }); const updated = await prisma.direction.update({ where: { id }, data: parsed.data }); await prisma.adminLog.create({ data: { adminId: admin.id, action: 'UPDATE', entityType: 'direction', entityId: id } }); return NextResponse.json(updated); }
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const admin = await requireAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { id } = await params; await prisma.direction.delete({ where: { id } }); await prisma.adminLog.create({ data: { adminId: admin.id, action: 'DELETE', entityType: 'direction', entityId: id } }); return NextResponse.json({ ok: true }); }
