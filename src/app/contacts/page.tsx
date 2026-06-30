import ContactForm from './ContactForm';
import { prisma } from '@/lib/prisma';

export default async function ContactsPage() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  return (<><h1>Контакты</h1>
    <div className="card">
      <p>Телефон: {settings?.phone ?? 'не указан'}</p>
      <p>Email: {settings?.email ?? settings?.recipientEmail}</p>
      <p>VK: {settings?.vkUrl ?? 'https://vk.com/artchudovn'}</p>
    </div>
    <ContactForm consentLabel={settings?.consentLabel ?? 'Я даю согласие на обработку персональных данных'} consentText={settings?.consentText ?? ''} />
  </>);
}
