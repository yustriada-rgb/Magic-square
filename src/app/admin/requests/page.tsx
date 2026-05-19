import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function RequestsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const items = await prisma.contactRequest.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });

  return <div className="card"><h1>Заявки</h1>
    <table><thead><tr><th>Дата</th><th>Имя</th><th>Контакт</th><th>Сообщение</th></tr></thead><tbody>
      {items.map((i)=><tr key={i.id}><td>{new Date(i.createdAt).toLocaleString('ru-RU')}</td><td>{i.name}</td><td>{i.contact}</td><td>{i.message}</td></tr>)}
    </tbody></table>
  </div>;
}
