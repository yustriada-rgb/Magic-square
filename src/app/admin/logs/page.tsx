import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function LogsPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  const logs = await prisma.adminLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200, include: { admin: true } });

  return <div className="card"><h1>Журнал действий</h1><ul>
    {logs.map((l)=><li key={l.id}>{new Date(l.createdAt).toLocaleString('ru-RU')} — {(l.admin.displayName ?? l.admin.login)} — {l.action} ({l.entityType})</li>)}
  </ul></div>;
}
