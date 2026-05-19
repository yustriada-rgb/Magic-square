import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/http';

export const runtime = 'nodejs';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_FILES = 20;
const MAX_SIZE = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail('UNAUTHORIZED', 'Требуется авторизация', 401);

  const form = await req.formData();
  const albumId = String(form.get('albumId') ?? '');
  const files = form.getAll('files').filter((f): f is File => f instanceof File);

  if (!albumId || files.length === 0) return fail('VALIDATION', 'albumId и files обязательны', 400);
  if (files.length > MAX_FILES) return fail('VALIDATION', `Можно загрузить максимум ${MAX_FILES} файлов за раз`, 400);

  const album = await prisma.album.findUnique({ where: { id: albumId } });
  if (!album) return fail('NOT_FOUND', 'Альбом не найден', 404);

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });

  let createdCount = 0;
  const skipped: string[] = [];
  for (const file of files) {
    if (!ALLOWED.has(file.type)) { skipped.push(`${file.name}: type`); continue; }
    if (file.size > MAX_SIZE) { skipped.push(`${file.name}: size`); continue; }

    const ext = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
    const filename = `${Date.now()}-${randomUUID()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    const bytes = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(bytes));

    await prisma.photo.create({ data: { albumId, imageUrl: `/uploads/${filename}`, altText: file.name } });
    createdCount++;
  }

  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'photo_batch_upload', entityId: albumId, metaJson: JSON.stringify({ createdCount, requestedCount: files.length, skipped }) } });
  return ok({ createdCount, requestedCount: files.length, skipped });
}
