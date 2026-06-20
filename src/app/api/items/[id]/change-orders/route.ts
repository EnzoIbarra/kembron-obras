import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import {
  createDeduction,
  createAdditionOnExistingItem,
} from '@/domains/presupuesto/services/presupuestoService';
import { itemChangeOrderBodySchema } from '@/domains/presupuesto/types/schemas';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden registrar adicionales y deductivos' }, { status: 403 });
  }

  const { id: itemId } = await params;
  const body = await req.json();
  const result = itemChangeOrderBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const { type, name, amount, description } = result.data;
  const userId = session.user.id;

  const record =
    type === 'DEDUCTIVO'
      ? await createDeduction(userId, { itemId, name, amount, description })
      : await createAdditionOnExistingItem(userId, { itemId, name, amount, description });

  return NextResponse.json(record, { status: 201 });
}
