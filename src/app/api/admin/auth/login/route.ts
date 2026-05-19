import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { setSession, verifyPassword } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';
import { fail, ok } from '@/lib/http';

const schema = z.object({ login: z.string().min(2), password: z.string().min(4) });

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const rl = checkRateLimit(`login:${ip}`, 10, 60_000);
  if (!rl.allowed) return fail('RATE_LIMIT', 'Слишком много попыток входа', 429);

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return fail('VALIDATION', 'Некорректный запрос', 400, parsed.error.flatten());

  const admin = await prisma.admin.findUnique({ where: { login: parsed.data.login } });
  if (!admin || admin.status !== 'ACTIVE') return fail('UNAUTHORIZED', 'Неверный логин или пароль', 401);

  const pwdOk = await verifyPassword(parsed.data.password, admin.passwordHash);
  if (!pwdOk) return fail('UNAUTHORIZED', 'Неверный логин или пароль', 401);

  await setSession(admin.id);
  await prisma.adminLog.create({ data: { adminId: admin.id, action: 'LOGIN', entityType: 'auth', ip, userAgent: req.headers.get('user-agent') ?? undefined } });
  return ok({ id: admin.id, login: admin.login });
}
