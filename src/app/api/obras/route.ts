import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { listObras, createObra } from '@/domains/obras/services/obrasService';
import { obraSchema } from '@/domains/obras/types/schemas';
import { ObraStatus } from '@prisma/client';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    // Supervisors read obras through GET /api/mis-obras (scoped to assigned obras).
    return NextResponse.json({ error: 'Acceso restringido a administradores' }, { status: 403 });
  }

  const obras = await listObras();
  return NextResponse.json(obras);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Solo administradores pueden crear obras' }, { status: 403 });
  }

  const body = await request.json();
  const result = obraSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: 'Datos inválidos', details: result.error.flatten() }, { status: 422 });
  }

  const { startDate, theoreticalEndDate, status, ...rest } = result.data;
  const obra = await createObra({
    ...rest,
    status: status as ObraStatus,
    startDate: new Date(startDate),
    theoreticalEndDate: new Date(theoreticalEndDate),
  });

  return NextResponse.json(obra, { status: 201 });
}
