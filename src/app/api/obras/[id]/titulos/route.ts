import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { listTitulosWithItems, createTitulo } from '@/domains/presupuesto/services/presupuestoService';
import { tituloSchema } from '@/domains/presupuesto/types/schemas';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
  }

  const { id: obraId } = await params;
  const data = await listTitulosWithItems(obraId);
  return NextResponse.json(data);
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden crear títulos' }, { status: 403 });
  }

  const { id: obraId } = await params;
  const body = await req.json();
  const result = tituloSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const titulo = await createTitulo(obraId, result.data);
  return NextResponse.json(titulo, { status: 201 });
}
