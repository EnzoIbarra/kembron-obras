import { ObraStatus, Prisma, ChangeOrderType } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import {
  computeItemRealBudget,
  computeItemExecuted,
} from '@/domains/presupuesto/utils/budgetCalculations';
import type { ObraWithProgress, MisObraDto } from '../types';

// Nested select reused by listObras and getObraById to compute progress metrics.
const progressInclude = {
  titulos: {
    select: {
      items: {
        select: {
          quantity: true,
          theoreticalAmount: true,
          createdByAdicionalId: true,
          changeOrders: { select: { id: true, type: true, amount: true } },
          expenses: { select: { amount: true } },
          progressRecords: { select: { advancedQuantity: true } },
        },
      },
    },
  },
} as const;

type ItemProgressRow = {
  quantity: Prisma.Decimal;
  theoreticalAmount: Prisma.Decimal;
  createdByAdicionalId: string | null;
  changeOrders: { id: string; type: ChangeOrderType; amount: Prisma.Decimal }[];
  expenses: { amount: Prisma.Decimal }[];
  progressRecords: { advancedQuantity: Prisma.Decimal }[];
};

function computeProgress(items: ItemProgressRow[]): {
  physicalProgress: number;
  economicProgress: number;
} {
  let physicalSum = 0;
  let realBudgetAcc = new Prisma.Decimal(0);
  let executedAcc = new Prisma.Decimal(0);

  for (const item of items) {
    const qty = Number(item.quantity);
    const adv = item.progressRecords.reduce(
      (s, r) => s + Number(r.advancedQuantity),
      0,
    );
    physicalSum += qty === 0 ? 0 : Math.min(100, (adv / qty) * 100);
    realBudgetAcc = realBudgetAcc.plus(
      computeItemRealBudget(item.theoreticalAmount, item.changeOrders, item.createdByAdicionalId),
    );
    executedAcc = executedAcc.plus(computeItemExecuted(item.expenses));
  }

  const physicalProgress =
    items.length === 0 ? 0 : Math.round((physicalSum / items.length) * 100) / 100;

  const economicProgress = realBudgetAcc.lessThanOrEqualTo(0)
    ? 0
    : Math.round(executedAcc.div(realBudgetAcc).toNumber() * 10000) / 100;

  return { physicalProgress, economicProgress };
}

export async function listObras(): Promise<ObraWithProgress[]> {
  const obras = await prisma.obra.findMany({
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    include: progressInclude,
  });

  return obras.map(({ titulos, ...obra }) => {
    const items = titulos.flatMap((t) => t.items);
    return { ...obra, ...computeProgress(items) };
  });
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
  const obra = await prisma.obra.findUnique({
    where: { id },
    include: progressInclude,
  });
  if (!obra) return null;
  const { titulos, ...rest } = obra;
  const items = titulos.flatMap((t) => t.items);
  return { ...rest, ...computeProgress(items) };
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
