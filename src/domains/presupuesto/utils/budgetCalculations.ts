import { Prisma, ChangeOrderType } from '@prisma/client';
import type { AdicionalDeductivo, Gasto } from '@prisma/client';

/**
 * Real budget for a single item.
 *
 * Formula: theoreticalAmount + Σ(additions) − Σ(deductions)
 *
 * Exclusion rule: when createdByAdicionalId is non-null, the AdicionalDeductivo
 * with that id is excluded from the additions sum. The item's theoreticalAmount
 * already captures the full budget value of that change order — including it in
 * the additions sum would double-count it.
 */
export function computeItemRealBudget(
  theoreticalAmount: Prisma.Decimal,
  changeOrders: Pick<AdicionalDeductivo, 'id' | 'type' | 'amount'>[],
  createdByAdicionalId: string | null
): Prisma.Decimal {
  const additions = changeOrders
    .filter((co) => co.type === ChangeOrderType.ADICIONAL && co.id !== createdByAdicionalId)
    .reduce((sum, co) => sum.plus(co.amount), new Prisma.Decimal(0));

  const deductions = changeOrders
    .filter((co) => co.type === ChangeOrderType.DEDUCTIVO)
    .reduce((sum, co) => sum.plus(co.amount), new Prisma.Decimal(0));

  return theoreticalAmount.plus(additions).minus(deductions);
}

/** Executed amount for a single item: sum of all its expenses. */
export function computeItemExecuted(
  expenses: Pick<Gasto, 'amount'>[]
): Prisma.Decimal {
  return expenses.reduce((sum, g) => sum.plus(g.amount), new Prisma.Decimal(0));
}

/** Aggregate three-column totals across an array of items with pre-computed values. */
export function sumBudgetColumns(
  items: { theoreticalAmount: Prisma.Decimal; real: Prisma.Decimal; executed: Prisma.Decimal }[]
) {
  return items.reduce(
    (acc, item) => ({
      theoretical: acc.theoretical.plus(item.theoreticalAmount),
      real: acc.real.plus(item.real),
      executed: acc.executed.plus(item.executed),
    }),
    {
      theoretical: new Prisma.Decimal(0),
      real: new Prisma.Decimal(0),
      executed: new Prisma.Decimal(0),
    }
  );
}
