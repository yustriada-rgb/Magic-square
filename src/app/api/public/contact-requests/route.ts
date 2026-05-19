import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { sendContactMail } from '@/lib/mail';
import { checkRateLimit } from '@/lib/rate-limit';
import { fail, ok } from '@/lib/http';

const schema = z.object({
  name: z.string().min(2),
  contact: z.string().min(3),
  message: z.string().min(5),
  consentAccepted: z.literal(true),
});

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`contact:${ip}`, 8, 60_000);
  if (!rl.allowed) return fail('RATE_LIMIT', 'Слишком много запросов, попробуйте позже', 429);

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail('VALIDATION', 'Некорректные данные формы', 400, parsed.error.flatten());

  const settings = await prisma.siteSettings.findUnique({ where: { id: 'main' } });
  const userAgent = req.headers.get('user-agent');

  await prisma.contactRequest.create({ data: { ...parsed.data, ip, userAgent: userAgent ?? undefined } });
  await sendContactMail(settings?.recipientEmail ?? 'yustriada@yandex.ru', 'Новая заявка с сайта', `Имя: ${parsed.data.name}\nКонтакт: ${parsed.data.contact}\nСообщение: ${parsed.data.message}`);

  return ok({ message: 'Заявка отправлена' });
}
