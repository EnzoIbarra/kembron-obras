import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { createGasto } from '@/domains/presupuesto/services/presupuestoService';
import { gastoBodySchema } from '@/domains/presupuesto/types/schemas';
import { prisma } from '@/shared/lib/prisma';
import type { ExpenseCategory } from '@prisma/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });

  const { role, id: userId } = session.user;
  if (role !== 'ADMIN' && role !== 'SUPERVISOR') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id: itemId } = await params;

  if (role === 'SUPERVISOR') {
    const item = await prisma.item.findFirst({
      where: { id: itemId, titulo: { obra: { assignments: { some: { userId } } } } },
      select: { id: true },
    });
    if (!item) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const result = gastoBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const gasto = await createGasto(session.user.id, {
    itemId,
    description: result.data.description,
    category: result.data.category as ExpenseCategory,
    date: result.data.date,
    amount: result.data.amount,
  });

  return NextResponse.json(gasto, { status: 201 });
}
