import { prisma } from '@/lib/prisma';
import GalleryViewer from './GalleryViewer';

export default async function GalleryPage() {
  const albums = await prisma.album.findMany({ where: { isPublished: true }, include: { photos: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } });
  return <><h1>Галерея</h1>{albums.map((a)=><div key={a.id} className="card"><h3>{a.title}</h3><GalleryViewer photos={a.photos} /></div>)}</>;
}
