import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import type { ProgramacionCellDto, AvanceRealDto } from '../types';

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

export async function createRegistroAvance(
  itemId: string,
  userId: string,
  data: { advancedQuantity: string; date: string },
): Promise<void> {
  await prisma.registroAvance.create({
    data: {
      itemId,
      userId,
      advancedQuantity: new Prisma.Decimal(data.advancedQuantity),
      date: new Date(data.date),
    },
  });
}

export async function listAvanceReal(obraId: string): Promise<AvanceRealDto> {
  const titulos = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      name: true,
      items: {
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          unit: true,
          quantity: true,
          theoreticalAmount: true,
          progressRecords: {
            orderBy: { date: 'asc' },
            select: {
              id: true,
              advancedQuantity: true,
              date: true,
              usuario: { select: { username: true } },
            },
          },
        },
      },
    },
  });

  return {
    titulos: titulos.map((t) => ({
      id: t.id,
      name: t.name,
      items: t.items.map((item) => ({
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity.toString(),
        theoreticalAmount: item.theoreticalAmount.toString(),
        registros: item.progressRecords.map((r) => ({
          id: r.id,
          advancedQuantity: r.advancedQuantity.toString(),
          date: r.date.toISOString().split('T')[0],
          userName: r.usuario.username,
        })),
      })),
    })),
  };
}
