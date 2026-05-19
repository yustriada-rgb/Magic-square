import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/http';

type VkItem = { id: number; date: number; text: string; owner_id: number; attachments?: Array<{ type: string; photo?: { sizes?: Array<{ url: string; width: number; height: number }> } }> };

async function fetchWall() {
  const token = process.env.VK_ACCESS_TOKEN;
  const domain = process.env.VK_GROUP_DOMAIN;
  const version = process.env.VK_API_VERSION ?? '5.199';
  if (!token || !domain) return { error: 'VK_ACCESS_TOKEN / VK_GROUP_DOMAIN not configured' as const };
  const url = `https://api.vk.com/method/wall.get?domain=${encodeURIComponent(domain)}&count=10&access_token=${encodeURIComponent(token)}&v=${encodeURIComponent(version)}`;
  const resp = await fetch(url, { cache: 'no-store' });
  const data = await resp.json();
  if (!resp.ok || data.error) return { error: 'VK API error' as const, details: data.error ?? data };
  return { domain, items: (data.response?.items ?? []) as VkItem[] };
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return fail('UNAUTHORIZED', 'Требуется авторизация', 401);
  const data = await fetchWall();
  if ('error' in data) return fail('VK_ERROR', String((data as any).error), 502, (data as any).details);

  const preview = data.items.slice(0, 5).map((item) => ({
    externalId: String(item.id),
    date: new Date(item.date * 1000),
    text: item.text,
    url: `https://vk.com/wall${item.owner_id}_${item.id}`,
  }));
  return ok(preview);
}

export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return fail('UNAUTHORIZED', 'Требуется авторизация', 401);
  const data = await fetchWall();
  if ('error' in data) {
    await prisma.adminLog.create({ data: { adminId: admin.id, action: 'UPDATE', entityType: 'news_vk_import_error', metaJson: JSON.stringify(data) } });
    return fail('VK_ERROR', String((data as any).error), 502, (data as any).details);
  }

  let imported = 0;
  for (const item of data.items) {
    const extId = String(item.id);
    const exists = await prisma.news.findFirst({ where: { source: 'VK_IMPORT', externalId: extId } });
    if (exists) continue;
    const photos = item.attachments?.filter((a) => a.type === 'photo' && a.photo?.sizes?.length).map((a) => a.photo!.sizes!) ?? [];
    const coverImageUrl = photos.length ? photos[0].sort((a, b) => b.width * b.height - a.width * a.height)[0]?.url : undefined;

    await prisma.news.create({ data: { title: item.text?.slice(0, 60) || `Новость VK #${item.id}`, text: item.text || 'Пост без текста', publishedAt: new Date(item.date * 1000), source: 'VK_IMPORT', sourceUrl: `https://vk.com/wall${item.owner_id}_${item.id}`, externalId: extId, coverImageUrl } });
    imported++;
  }
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'CREATE', entityType: 'news_vk_import', metaJson: JSON.stringify({ imported }) } });
  return ok({ imported });
}
