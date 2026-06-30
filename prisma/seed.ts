import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const adminLogin = process.env.SEED_ADMIN_LOGIN ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin12345';
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.admin.upsert({
    where: { login: adminLogin },
    update: {},
    create: { login: adminLogin, passwordHash, displayName: 'Главный администратор' },
  });

  await prisma.siteSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      recipientEmail: 'yustriada@yandex.ru',
      consentText:
        'Нажимая кнопку отправки, вы подтверждаете согласие на обработку персональных данных в целях обратной связи.',
      vkUrl: 'https://vk.com/artchudovn',
      yandexProfileUrl: 'https://yandex.ru/profile/62367581412?lang=ru',
    },
  });

  const pageSeeds = [
    {
      slug: 'home',
      title: 'Арт-центр «Чудо»',
      blocksJson: JSON.stringify([
        { type: 'hero', title: 'Место, где раскрывается талант', text: 'Творим, вдохновляем и объединяем детей и взрослых.' },
      ]),
    },
    {
      slug: 'contacts',
      title: 'Контакты',
      blocksJson: JSON.stringify([
        { type: 'intro', title: 'Мы на связи', text: 'Оставьте заявку — и мы поможем подобрать творческое направление.' },
      ]),
    },
  ];

  for (const page of pageSeeds) {
    await prisma.page.upsert({ where: { slug: page.slug }, update: {}, create: page });
  }

  await prisma.adminLog.create({
    data: {
      adminId: admin.id,
      action: 'CREATE',
      entityType: 'seed',
      metaJson: JSON.stringify({ message: 'Initial seed completed' }),
    },
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
