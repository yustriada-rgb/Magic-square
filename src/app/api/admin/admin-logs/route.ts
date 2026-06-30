import { requireAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { fail, ok } from '@/lib/http';

export async function GET(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return fail('UNAUTHORIZED', 'Требуется авторизация', 401);

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();

  const logs = await prisma.adminLog.findMany({
    where: q
      ? {
          OR: [
            { entityType: { contains: q } },
          ],
        }
      : undefined,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { admin: { select: { login: true, displayName: true } } },
  });

  return ok(logs);
}
