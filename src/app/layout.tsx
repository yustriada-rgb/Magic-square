import './globals.css';
import { prisma } from '@/lib/prisma';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return (
    <html lang="ru"><body><main>{children}
      <footer className="footer-legal">
        <div>{settings?.legalName ?? 'Юридическое наименование'}</div>
        <div>ИНН: {settings?.legalInn ?? '—'} | ОГРН: {settings?.legalOgrn ?? '—'}</div>
        <div>{settings?.legalAddress ?? 'Юридический адрес'}</div>
        <div>{settings?.legalPhone ?? 'Телефон'} | {settings?.legalEmail ?? 'Email'}</div>
      </footer>
    </main></body></html>
  );
}
