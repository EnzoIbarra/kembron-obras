import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { replaceAsignaciones } from '@/domains/usuarios/services/usuariosService';
import { asignacionesSchema } from '@/domains/usuarios/types/schemas';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
  }

  const { id: userId } = await params;
  const body = await req.json();
  const result = asignacionesSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  await replaceAsignaciones(userId, result.data.obraIds);
  return NextResponse.json({ ok: true });
}
