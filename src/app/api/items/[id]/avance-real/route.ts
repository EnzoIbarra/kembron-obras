import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { registroAvanceBodySchema } from '@/domains/avance/types/schemas';
import { createRegistroAvance } from '@/domains/avance/services/avanceService';
import { prisma } from '@/shared/lib/prisma';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { role, id: userId } = session.user;
  if (role !== 'ADMIN' && role !== 'SUPERVISOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: itemId } = await params;

  // Invariant 7: supervisor data-layer enforcement — query-level obra assignment check
  if (role === 'SUPERVISOR') {
    const item = await prisma.item.findFirst({
      where: { id: itemId, titulo: { obra: { assignments: { some: { userId } } } } },
      select: { id: true },
    });
    if (!item) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const result = registroAvanceBodySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });

  await createRegistroAvance(itemId, userId, result.data);
  return NextResponse.json({ ok: true }, { status: 201 });
}
