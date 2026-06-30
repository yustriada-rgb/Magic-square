import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function HomePage() {
  const page = await prisma.page.findUnique({ where: { slug: 'home' } });
  return (<><h1>{page?.title ?? 'Арт-центр «Чудо»'}</h1>
    <p>Творческая атмосфера, где хочется быть собой, пробовать, ошибаться и сиять.</p>
    <div className="card"><h3>Разделы</h3><ul>
      <li><Link href="/contacts">Контакты и форма</Link></li>
      <li><Link href="/admin/login">Вход в админку</Link></li>
    </ul></div></>);
}
