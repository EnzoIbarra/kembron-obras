import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { listAvanceReal } from '@/domains/avance/services/avanceService';
import { prisma } from '@/shared/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { role, id: userId } = session.user;
  if (role !== 'ADMIN' && role !== 'SUPERVISOR') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  if (role === 'SUPERVISOR') {
    const assignment = await prisma.asignacionObraSupervisor.findFirst({
      where: { userId, obraId: id },
      select: { id: true },
    });
    if (!assignment) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const data = await listAvanceReal(id);
  return NextResponse.json(data);
}
