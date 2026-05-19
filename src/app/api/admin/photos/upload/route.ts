import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const form = await req.formData();
  const albumId = String(form.get('albumId') ?? '');
  const files = form.getAll('files').filter((f): f is File => f instanceof File);

  if (!albumId || files.length === 0) {
    return NextResponse.json({ error: 'albumId and files are required' }, { status: 400 });
  }

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) return NextResponse.json({ error: 'Album not found' }, { status: 404 });

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  let createdCount = 0;
  for (const file of files) {
    if (!ALLOWED.has(file.type)) continue;

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    await prisma.photo.create({
      data: {
        albumId,
        imageUrl: `/uploads/${filename}`,
        altText: file.name,
      },
    });
    createdCount++;
  }

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE',
      entityType: 'photo_batch_upload',
      entityId: albumId,
      metaJson: JSON.stringify({ createdCount, requestedCount: files.length }),
    },
  });

  return NextResponse.json({ ok: true, createdCount, requestedCount: files.length });
}
