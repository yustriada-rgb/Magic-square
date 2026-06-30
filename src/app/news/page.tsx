import { prisma } from '@/lib/prisma';

export default async function NewsPage() {
  const items = await prisma.news.findMany({ where: { isPublished: true }, orderBy: { publishedAt: 'desc' }, take: 50 });
  return <><h1>Новости</h1>{items.map((n)=><div key={n.id} className="card"><h3>{n.title}</h3><small>{new Date(n.publishedAt).toLocaleDateString('ru-RU')}</small><p>{n.text}</p></div>)}</>;
}
