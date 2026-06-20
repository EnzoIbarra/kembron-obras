import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { updateObra } from '@/domains/obras/services/obrasService';
import { obraSchema } from '@/domains/obras/types/schemas';
import { ObraStatus } from '@prisma/client';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden editar obras' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const result = obraSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const { startDate, theoreticalEndDate, status, ...rest } = result.data;

  try {
    const obra = await updateObra(id, {
      ...rest,
      status: status as ObraStatus,
      startDate: new Date(startDate),
      theoreticalEndDate: new Date(theoreticalEndDate),
    });
    return NextResponse.json(obra);
  } catch {
    return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 });
  }
}
