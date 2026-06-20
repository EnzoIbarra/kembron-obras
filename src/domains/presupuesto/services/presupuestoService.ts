import { Prisma } from '@prisma/client';
import { prisma } from '@/shared/lib/prisma';
import { computeItemRealBudget, computeItemExecuted, sumBudgetColumns } from '../utils/budgetCalculations';
import type { PresupuestoData } from '../types';

export async function createTitulo(obraId: string, data: { name: string }) {
  const last = await prisma.titulo.findFirst({
    where: { obraId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  });
  const nextOrder = (last?.sortOrder ?? 0) + 1;
  return prisma.titulo.create({
    data: { obraId, name: data.name, sortOrder: nextOrder },
  });
}

export async function createItem(
  tituloId: string,
  data: { name: string; quantity: number; unit: string; unitPrice: number }
) {
  // Convert through string to avoid floating-point precision issues before Decimal math
  const qty = new Prisma.Decimal(data.quantity.toString());
  const price = new Prisma.Decimal(data.unitPrice.toString());
  const theoreticalAmount = qty.times(price);

  return prisma.item.create({
    data: {
      tituloId,
      name: data.name,
      quantity: qty,
      unit: data.unit,
      unitPrice: price,
      theoreticalAmount,
    },
  });
}

export async function listTitulosWithItems(obraId: string): Promise<PresupuestoData> {
  const raw = await prisma.titulo.findMany({
    where: { obraId },
    orderBy: { sortOrder: 'asc' },
    include: {
      items: {
        include: {
          changeOrders: true, // AdicionalDeductivo[] via "ChangeOrderTargetsItem"
          expenses: true,     // Gasto[]
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  const titulos = raw.map((titulo) => {
    const items = titulo.items.map((item) => {
      const real = computeItemRealBudget(
        item.theoreticalAmount,
        item.changeOrders,
        item.createdByAdicionalId
      );
      const executed = computeItemExecuted(item.expenses);
      return {
        id: item.id,
        name: item.name,
        unit: item.unit,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        theoreticalAmount: item.theoreticalAmount,
        real,
        executed,
      };
    });

    const subtotal = sumBudgetColumns(items);
    return { id: titulo.id, name: titulo.name, sortOrder: titulo.sortOrder, items, subtotal };
  });

  const allItems = titulos.flatMap((t) => t.items);
  const total = sumBudgetColumns(allItems);

  return { titulos, total };
}
