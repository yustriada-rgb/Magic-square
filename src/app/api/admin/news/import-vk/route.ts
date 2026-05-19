import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type VkItem = {
  id: number;
  date: number;
  text: string;
  attachments?: Array<{ type: string; photo?: { sizes?: Array<{ url: string; width: number; height: number }> } }>;
};

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const token = process.env.VK_ACCESS_TOKEN;
  const domain = process.env.VK_GROUP_DOMAIN;
  const version = process.env.VK_API_VERSION ?? '5.199';
  if (!token || !domain) return NextResponse.json({ error: 'VK_ACCESS_TOKEN / VK_GROUP_DOMAIN not configured' }, { status: 400 });

  const url = `https://api.vk.com/method/wall.get?domain=${encodeURIComponent(domain)}&count=10&access_token=${encodeURIComponent(token)}&v=${encodeURIComponent(version)}`;
  const resp = await fetch(url, { cache: 'no-store' });
  const data = await resp.json();

  if (!resp.ok || data.error) {
    return NextResponse.json({ error: 'VK API error', details: data.error ?? data }, { status: 502 });
  }

  const items: VkItem[] = data.response?.items ?? [];
  let imported = 0;

  for (const item of items) {
    const extId = String(item.id);
    const exists = await prisma.news.findFirst({ where: { source: 'VK_IMPORT', externalId: extId } });
    if (exists) continue;

    let coverImageUrl: string | undefined;
    const photos = item.attachments?.filter((a) => a.type === 'photo' && a.photo?.sizes?.length).map((a) => a.photo!.sizes!) ?? [];
    if (photos.length) {
      const sizes = photos[0];
      coverImageUrl = sizes.sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url;
    }

    await prisma.news.create({
      data: {
        title: item.text?.slice(0, 60) || `Новость VK #${item.id}`,
        text: item.text || 'Пост без текста',
        publishedAt: new Date(item.date * 1000),
        source: 'VK_IMPORT',
        sourceUrl: `https://vk.com/${domain}?w=wall-${domain}_${item.id}`,
        externalId: extId,
        coverImageUrl,
      },
    });
    imported++;
  }

  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'news_vk_import', metaJson: JSON.stringify({ imported }) } });
  return NextResponse.json({ ok: true, imported });
}
