import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/domains/usuarios/auth/authOptions';
import { programacionCellBodySchema } from '@/domains/avance/types/schemas';
import { upsertScheduleCell } from '@/domains/avance/services/avanceService';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { id: itemId } = await params;
  const body = await req.json();
  const result = programacionCellBodySchema.safeParse(body);
  if (!result.success) return NextResponse.json({ error: result.error.flatten() }, { status: 422 });
  await upsertScheduleCell(itemId, result.data.weekNumber, result.data.plannedQuantity);
  return NextResponse.json({ ok: true });
}
