import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { createItem } from '@/domains/presupuesto/services/presupuestoService';
import { itemSchema } from '@/domains/presupuesto/types/schemas';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden crear ítems' }, { status: 403 });
  }

  const { id: tituloId } = await params;
  const body = await req.json();
  const result = itemSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const item = await createItem(tituloId, result.data);
  return NextResponse.json(item, { status: 201 });
}
