import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { createGasto } from '@/domains/presupuesto/services/presupuestoService';
import { gastoBodySchema } from '@/domains/presupuesto/types/schemas';
import type { ExpenseCategory } from '@prisma/client';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden registrar gastos' }, { status: 403 });
  }

  const { id: itemId } = await params;
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
