import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const created = await prisma.news.create({
    data: {
      title: 'Импорт VK (тест)',
      text: 'Здесь будет текст, дата и 1 фото из поста VK при подключении токена API.',
      publishedAt: new Date(),
      source: 'VK_IMPORT',
      sourceUrl: process.env.VK_GROUP_DOMAIN ? `https://vk.com/${process.env.VK_GROUP_DOMAIN}` : null,
      externalId: `manual-${Date.now()}`,
    },
  });

  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'news_vk_import', entityId: created.id } });
  return NextResponse.json({ ok: true, createdId: created.id });
}
