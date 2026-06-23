import type { ProgramacionCellDto } from '../types';

type ActualRecord = { itemId: string; weekNumber: number; advancedQuantity: string };
type ItemSpec = { id: string; quantity: string }; // physical quantity — denominator for progress %

export type CurvaPoint = { weekNumber: number; cumulativePct: number };

export function buildPlannedCurve(
  cells: ProgramacionCellDto[],
  totalWeeks: number,
  valueOf: (cell: ProgramacionCellDto) => number,
): CurvaPoint[] {
  if (cells.length === 0) return [];

  const weeklyTotals = new Map<number, number>();
  let grandTotal = 0;

  for (const cell of cells) {
    const value = valueOf(cell);
    weeklyTotals.set(cell.weekNumber, (weeklyTotals.get(cell.weekNumber) ?? 0) + value);
    grandTotal += value;
  }

  if (grandTotal === 0) return [];

  const result: CurvaPoint[] = [];
  let cumulative = 0;

  for (let w = 1; w <= totalWeeks; w++) {
    cumulative += weeklyTotals.get(w) ?? 0;
    result.push({
      weekNumber: w,
      cumulativePct: Math.round((cumulative / grandTotal) * 10000) / 100,
    });
  }

  return result;
}

// Per-item cumulative physical progress % capped at 100.
// Structural type keeps this usable from both AvanceRealSubTab and GanttSubTab.
export function itemCumulativePct(item: {
  quantity: string;
  registros: { advancedQuantity: string }[];
}): number {
  const totalQty = Number(item.quantity);
  if (totalQty === 0) return 0;
  const advanced = item.registros.reduce((sum, r) => sum + Number(r.advancedQuantity), 0);
  return Math.min(100, Math.round((advanced / totalQty) * 10000) / 100);
}

// Financial actual curve — cumulative expenses as % of real budget.
// Denominator guard: returns [] when totalReal ≤ 0 to avoid NaN/Infinity.
export function buildActualFinancialCurve(
  expenses: { weekNumber: number; amount: string }[],
  totalReal: string,
  totalWeeks: number,
): CurvaPoint[] {
  const total = Number(totalReal);
  if (total <= 0) return [];

  const weeklyTotals = new Map<number, number>();
  for (const e of expenses) {
    weeklyTotals.set(e.weekNumber, (weeklyTotals.get(e.weekNumber) ?? 0) + Number(e.amount));
  }

  const result: CurvaPoint[] = [];
  let cumulative = 0;
  for (let w = 1; w <= totalWeeks; w++) {
    cumulative += weeklyTotals.get(w) ?? 0;
    result.push({
      weekNumber: w,
      cumulativePct: Math.round((cumulative / total) * 10000) / 100,
    });
  }
  return result;
}

// Physical progress curve — simple average of per-item cumulative % (each capped at 100).
// records must be pre-mapped to weekNumber by the caller (date→week via semanas.ts).
export function buildActualCurve(
  records: ActualRecord[],
  items: ItemSpec[],
  totalWeeks: number,
): CurvaPoint[] {
  if (items.length === 0) return [];

  // Bucket registered quantities per item per week
  const weeklyByItem = new Map<string, Map<number, number>>();
  for (const r of records) {
    if (!weeklyByItem.has(r.itemId)) weeklyByItem.set(r.itemId, new Map());
    const m = weeklyByItem.get(r.itemId)!;
    m.set(r.weekNumber, (m.get(r.weekNumber) ?? 0) + Number(r.advancedQuantity));
  }

  // Running cumulative per item across weeks
  const cumulativeByItem = new Map<string, number>(items.map((item) => [item.id, 0]));

  const result: CurvaPoint[] = [];

  for (let w = 1; w <= totalWeeks; w++) {
    for (const item of items) {
      const thisWeek = weeklyByItem.get(item.id)?.get(w) ?? 0;
      cumulativeByItem.set(item.id, cumulativeByItem.get(item.id)! + thisWeek);
    }

    let totalPct = 0;
    for (const item of items) {
      const qty = Number(item.quantity);
      const pct =
        qty > 0
          ? Math.min(100, (cumulativeByItem.get(item.id)! / qty) * 100)
          : 0;
      totalPct += pct;
    }

    result.push({
      weekNumber: w,
      cumulativePct: Math.round((totalPct / items.length) * 100) / 100,
    });
  }

  return result;
}
