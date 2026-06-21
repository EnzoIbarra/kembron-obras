import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import type { ProgramacionCellDto } from '../types';

export async function listProgramacion(obraId: string): Promise<ProgramacionCellDto[]> {
  const records = await prisma.programacionSemanal.findMany({
    where: { item: { titulo: { obraId } } },
    select: { itemId: true, weekNumber: true, plannedQuantity: true },
    orderBy: [{ itemId: 'asc' }, { weekNumber: 'asc' }],
  });
  return records.map((r) => ({
    itemId: r.itemId,
    weekNumber: r.weekNumber,
    plannedQuantity: r.plannedQuantity.toString(),
  }));
}

export async function upsertScheduleCell(
  itemId: string,
  weekNumber: number,
  plannedQuantity: string | null,
): Promise<void> {
  if (plannedQuantity === null) {
    await prisma.programacionSemanal.deleteMany({ where: { itemId, weekNumber } });
    return;
  }
  await prisma.programacionSemanal.upsert({
    where: { itemId_weekNumber: { itemId, weekNumber } },
    create: { itemId, weekNumber, plannedQuantity: new Prisma.Decimal(plannedQuantity) },
    update: { plannedQuantity: new Prisma.Decimal(plannedQuantity) },
  });
}
