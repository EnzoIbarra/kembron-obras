import type { ProgramacionCellDto } from '../types';

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
