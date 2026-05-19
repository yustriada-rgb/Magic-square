import { prisma } from '@/lib/prisma';

export default async function GalleryPage() {
  const albums = await prisma.album.findMany({ where: { isPublished: true }, include: { photos: { orderBy: { sortOrder: 'asc' }, take: 12 } }, orderBy: { sortOrder: 'asc' } });
  return <><h1>Галерея</h1>{albums.map((a)=><div key={a.id} className="card"><h3>{a.title}</h3><div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:8}}>{a.photos.map((p)=><img key={p.id} src={p.imageUrl} alt={p.altText ?? a.title} style={{width:'100%',borderRadius:8}} />)}</div></div>)}</>;
}
