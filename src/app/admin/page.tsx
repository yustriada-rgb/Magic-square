import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';

export default async function AdminPage() {
  const admin = await requireAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <>
      <h1>Админка</h1>
      <div className="card">
        <p>Здравствуйте, {admin.displayName ?? admin.login}</p>
        <ul>
          <li><Link href="/admin/settings">Настройки сайта</Link></li>
          <li><Link href="/admin/requests">Заявки</Link></li>
          <li><Link href="/admin/admins">Администраторы</Link></li>
          <li><Link href="/admin/logs">Журнал действий</Link></li>
        </ul>
      </div>
    </>
  );
}
