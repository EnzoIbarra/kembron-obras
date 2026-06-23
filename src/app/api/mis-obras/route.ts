import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { listMisObras } from '@/domains/obras/services/obrasService';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  if (session.user.role !== 'SUPERVISOR') {
    return NextResponse.json({ error: 'Solo supervisores' }, { status: 403 });
  }
  const data = await listMisObras(session.user.id);
  return NextResponse.json(data);
}
