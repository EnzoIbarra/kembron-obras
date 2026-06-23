import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import {
  computeItemRealBudget,
  computeItemExecuted,
} from '@/domains/presupuesto/utils/budgetCalculations';
import type { DashboardDto, ObraDashboardDto } from '../types/dashboard';

export async function getDashboardData(): Promise<DashboardDto> {
  const obras = await prisma.obra.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      name: true,
      status: true,
      active: true,
      titulos: {
        select: {
          items: {
            select: {
              quantity: true,
              theoreticalAmount: true,
              createdByAdicionalId: true,
              changeOrders: {
                select: { id: true, type: true, amount: true },
              },
              expenses: {
                select: { amount: true },
              },
              progressRecords: {
                select: { advancedQuantity: true },
              },
            },
          },
        },
      },
    },
  });

  const obraRows: ObraDashboardDto[] = obras.map((obra) => {
    const items = obra.titulos.flatMap((t) => t.items);

    // Physical progress — same formula as itemCumulativePct (curvas.ts), inlined
    // to avoid importing a client utility into a server-only service.
    let physicalSum = 0;
    for (const item of items) {
      const qty = Number(item.quantity);
      const advanced = item.progressRecords.reduce(
        (s, r) => s + Number(r.advancedQuantity),
        0,
      );
      physicalSum += qty === 0 ? 0 : Math.min(100, (advanced / qty) * 100);
    }
    const physicalProgress =
      items.length === 0
        ? 0
        : Math.round((physicalSum / items.length) * 100) / 100;

    // Real budget and executed — reuse existing budget utilities to keep
    // the double-counting exclusion rule in a single authoritative place.
    let realBudgetAcc = new Prisma.Decimal(0);
    let executedAcc = new Prisma.Decimal(0);
    for (const item of items) {
      realBudgetAcc = realBudgetAcc.plus(
        computeItemRealBudget(
          item.theoreticalAmount,
          item.changeOrders,
          item.createdByAdicionalId,
        ),
      );
      executedAcc = executedAcc.plus(computeItemExecuted(item.expenses));
    }

    return {
      id: obra.id,
      name: obra.name,
      status: obra.status,
      active: obra.active,
      physicalProgress,
      realBudget: realBudgetAcc.toString(),
      executed: executedAcc.toString(),
    };
  });

  const activeCount   = obraRows.filter((o) => o.active).length;
  const inactiveCount = obraRows.filter((o) => !o.active).length;

  const totalRealBudget = obraRows
    .reduce((acc, o) => acc.plus(o.realBudget), new Prisma.Decimal(0))
    .toString();

  // Average across ALL obras (PDF section 5.3 — "avance promedio de todas las obras").
  const avgPhysicalProgress =
    obraRows.length === 0
      ? 0
      : Math.round(
          (obraRows.reduce((s, o) => s + o.physicalProgress, 0) / obraRows.length) * 100,
        ) / 100;

  return {
    kpis: { activeCount, inactiveCount, totalRealBudget, avgPhysicalProgress },
    obras: obraRows,
  };
}
