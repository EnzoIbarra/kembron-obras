import { ObraStatus } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import type { ObraWithProgress, MisObraDto } from '../types';

export async function listObras(): Promise<ObraWithProgress[]> {
  const obras = await prisma.obra.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  });

  return obras.map((obra) => ({
    ...obra,
    physicalProgress: 0, // TODO: computed from Items + RegistroAvance (Bloque avance)
    economicProgress: 0, // TODO: computed from Gastos ÷ Real budget (Bloque presupuesto)
  }));
}

export async function createObra(data: {
  name: string;
  location: string;
  client: string;
  status: ObraStatus;
  startDate: Date;
  theoreticalEndDate: Date;
}) {
  return prisma.obra.create({ data: { ...data, active: true } });
}

export async function updateObra(
  id: string,
  data: {
    name?: string;
    location?: string;
    client?: string;
    status?: ObraStatus;
    startDate?: Date;
    theoreticalEndDate?: Date;
  }
) {
  return prisma.obra.update({ where: { id }, data });
}

export async function getObraById(id: string): Promise<ObraWithProgress | null> {
  const obra = await prisma.obra.findUnique({ where: { id } });
  if (!obra) return null;
  return {
    ...obra,
    physicalProgress: 0, // TODO: computed from Items + RegistroAvance (Bloque avance)
    economicProgress: 0, // TODO: computed from Gastos ÷ Real budget (Bloque presupuesto)
  };
}

export async function toggleObraActive(id: string) {
  const obra = await prisma.obra.findUniqueOrThrow({ where: { id } });
  return prisma.obra.update({ where: { id }, data: { active: !obra.active } });
}

export async function listMisObras(userId: string): Promise<MisObraDto[]> {
  const assignments = await prisma.asignacionObraSupervisor.findMany({
    where: { userId },
    select: {
      obra: {
        select: {
          id: true,
          name: true,
          status: true,
          active: true,
          startDate: true,
          theoreticalEndDate: true,
          titulos: {
            select: {
              items: {
                select: {
                  quantity: true,
                  progressRecords: { select: { advancedQuantity: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  return assignments.map(({ obra }) => {
    const items = obra.titulos.flatMap((t) => t.items);
    let physicalSum = 0;
    for (const item of items) {
      const qty = Number(item.quantity);
      const adv = item.progressRecords.reduce((s, r) => s + Number(r.advancedQuantity), 0);
      physicalSum += qty === 0 ? 0 : Math.min(100, (adv / qty) * 100);
    }
    const physicalProgress =
      items.length === 0 ? 0 : Math.round((physicalSum / items.length) * 100) / 100;

    return {
      id: obra.id,
      name: obra.name,
      status: obra.status,
      active: obra.active,
      startDate: obra.startDate.toISOString(),
      theoreticalEndDate: obra.theoreticalEndDate.toISOString(),
      physicalProgress,
    };
  });
}
