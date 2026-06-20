import { ObraStatus } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import type { ObraWithProgress } from '../types';

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

export async function toggleObraActive(id: string) {
  const obra = await prisma.obra.findUniqueOrThrow({ where: { id } });
  return prisma.obra.update({ where: { id }, data: { active: !obra.active } });
}
