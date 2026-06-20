import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { createAdditionWithNewItem } from '@/domains/presupuesto/services/presupuestoService';
import { additionWithNewItemBodySchema } from '@/domains/presupuesto/types/schemas';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden registrar adicionales' }, { status: 403 });
  }

  const { id: tituloId } = await params;
  const body = await req.json();
  const result = additionWithNewItemBodySchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const userId = session.user.id;
  const record = await createAdditionWithNewItem(userId, { tituloId, ...result.data });
  return NextResponse.json(record, { status: 201 });
}
