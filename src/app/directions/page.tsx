import { prisma } from '@/lib/prisma';

export default async function DirectionsPage() {
  const items = await prisma.direction.findMany({ where: { isPublished: true }, orderBy: { sortOrder: 'asc' } });
  return <><h1>Направления</h1>{items.map((d)=><div key={d.id} className="card"><h3>{d.title}</h3><p>{d.description}</p><p>Кабинет: {d.room ?? 'уточняется'}</p></div>)}</>;
}
