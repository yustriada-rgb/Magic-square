# Арт-центр «Чудо»

Минимально рабочая версия проекта на Next.js + Prisma + SQLite.

## Что уже работает

- Главная страница (`/`)
- Контакты + форма обратной связи (`/contacts`)
- Обязательный чекбокс согласия на обработку ПДн
- API сохранения заявок и отправки email
- Вход в админку (`/admin/login`) и базовая защищённая страница (`/admin`)
- API чтения/обновления настроек сайта для админа
- Юридический блок в футере

## Быстрый запуск

```bash
npm install
cp .env.example .env
cp .env.example .env.local
npx prisma generate
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Откройте: `http://localhost:3000`

## Админ по умолчанию

- Логин: `admin`
- Пароль: `admin12345`

Смените после первого входа.
