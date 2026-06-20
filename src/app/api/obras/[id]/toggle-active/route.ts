import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { toggleObraActive } from '@/domains/obras/services/obrasService';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'ADMIN') {
    return NextResponse.json(
      { error: 'Solo administradores pueden activar o desactivar obras' },
      { status: 403 }
    );
  }

  const { id } = await params;

  try {
    const obra = await toggleObraActive(id);
    return NextResponse.json(obra);
  } catch {
    return NextResponse.json({ error: 'Obra no encontrada' }, { status: 404 });
  }
}
