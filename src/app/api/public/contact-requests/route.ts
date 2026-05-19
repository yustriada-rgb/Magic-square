import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactMail } from '@/lib/mail';

const schema = z.object({
  name: z.string().min(2),
  contact: z.string().min(3),
  message: z.string().min(5),
  consentAccepted: z.literal(true),
});

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed' }, { status: 400 });
  }

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  const ip = req.headers.get('x-forwarded-for');
  const userAgent = req.headers.get('user-agent');

  await prisma.contactRequest.create({
    data: {
      ...parsed.data,
      ip: ip ?? undefined,
      userAgent: userAgent ?? undefined,
    },
  });

  await sendContactMail(
    settings?.recipientEmail ?? 'yustriada@yandex.ru',
    'Новая заявка с сайта',
    `Имя: ${parsed.data.name}\nКонтакт: ${parsed.data.contact}\nСообщение: ${parsed.data.message}`
  );

  return NextResponse.json({ ok: true });
}
