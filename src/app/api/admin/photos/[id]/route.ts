import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) { const admin = await requireAdmin(); if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); const { id } = await params; await prisma.photo.delete({ where: { id } }); await prisma.adminLog.create({ data: { adminId: admin.id, action: 'DELETE', entityType: 'photo', entityId: id } }); return NextResponse.json({ ok: true }); }
