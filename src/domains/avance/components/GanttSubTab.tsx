'use client';

import { useMemo } from 'react';
import { useAvanceReal } from '../hooks/useAvanceReal';
import { useProgramacion } from '../hooks/useProgramacion';
import { calculateTotalWeeks, getCurrentWeekNumber } from '../utils/semanas';
import { itemCumulativePct } from '../utils/curvas';

type Props = { obraId: string; startDate: Date; theoreticalEndDate: Date };

// These constants are used both for Tailwind sizing classes and for the
// overlay pixel-offset formula — they must stay in sync with the CSS.
const NAME_W = 200; // px — matches min-w-[200px] on name cells
const WEEK_W = 32;  // px — matches w-8 on each week column

export function GanttSubTab({ obraId, startDate, theoreticalEndDate }: Props) {
  const { data: avance, isLoading: loadingAvance } = useAvanceReal(obraId);
  const { data: programacion, isLoading: loadingProg } = useProgramacion(obraId);

  const totalWeeks = useMemo(
    () => calculateTotalWeeks(startDate, theoreticalEndDate),
    [startDate, theoreticalEndDate],
  );
  const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);

  // getCurrentWeekNumber defaults today = new Date() — fine for a read-only view.
  const currentWeek = useMemo(
    () => getCurrentWeekNumber(startDate, theoreticalEndDate),
    [startDate, theoreticalEndDate],
  );

  // barRange: first and last scheduled week per item.
  // All ProgramacionSemanal records represent non-zero planned qty (upsert/delete semantics),
  // so no filtering needed — every record counts.
  const barRange = useMemo(() => {
    const map = new Map<string, { first: number; last: number }>();
    for (const cell of programacion ?? []) {
      const existing = map.get(cell.itemId);
      if (!existing) {
        map.set(cell.itemId, { first: cell.weekNumber, last: cell.weekNumber });
      } else {
        if (cell.weekNumber < existing.first) existing.first = cell.weekNumber;
        if (cell.weekNumber > existing.last) existing.last = cell.weekNumber;
      }
    }
    return map;
  }, [programacion]);

  if (loadingAvance || loadingProg) {
    return (
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <div className="flex h-10 items-center gap-3 border-b border-gray-100 bg-gray-50 px-4">
          <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-3 w-7 animate-pulse rounded bg-gray-200" />
          ))}
        </div>
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex h-10 items-center gap-3 border-b border-gray-100 px-4 last:border-b-0">
            <div className="h-3 w-36 animate-pulse rounded bg-gray-100" />
            <div
              className="h-5 animate-pulse rounded-md bg-gray-100"
              style={{ width: `${48 + n * 16}px`, marginLeft: `${(n - 1) * 28}px` }}
            />
          </div>
        ))}
      </div>
    );
  }

  if (!avance?.titulos.length) {
    return <p className="py-8 text-center text-sm text-gray-400">No hay ítems — creá el presupuesto primero.</p>;
  }

  const gridCols = `${NAME_W}px repeat(${totalWeeks}, ${WEEK_W}px)`;
  const stickyName = 'sticky left-0 z-20 bg-inherit border-r border-gray-200';

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      {/* min-w-max: relative parent expands to full content width.
          The absolute overlay uses inset-y-0 (top:0 bottom:0), NOT height:100%,
          so it stretches to the parent's content height — all rows, including
          those below the viewport fold — without needing an explicit height. */}
      <div className="relative min-w-max">

        {/* Current-week column overlay */}
        {currentWeek !== null && (
          <div
            className="pointer-events-none absolute inset-y-0 z-0 border-l-2 border-blue-400 bg-blue-50/60"
            style={{
              left: `${NAME_W + (currentWeek - 1) * WEEK_W}px`,
              width: `${WEEK_W}px`,
            }}
          />
        )}

        {/* Header row */}
        <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: gridCols }}>
          <div className={`${stickyName} bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-600`}>
            Ítem
          </div>
          {weeks.map((w) => (
            <div
              key={w}
              className={`py-3 text-center text-xs font-medium ${w === currentWeek ? 'font-semibold text-blue-600' : 'text-gray-400'}`}
            >
              S{w}
            </div>
          ))}
        </div>

        {/* Body */}
        {avance.titulos.map((titulo) => (
          <div key={titulo.id}>
            {/* Título row — static header, no bar */}
            <div className="grid border-b border-gray-200 bg-gray-50" style={{ gridTemplateColumns: gridCols }}>
              <div className={`${stickyName} bg-gray-50 px-4 py-2.5 text-sm font-semibold text-gray-800`}>
                {titulo.name}
              </div>
            </div>

            {/* Item rows */}
            {titulo.items.map((item) => {
              const range = barRange.get(item.id);
              const pct = itemCumulativePct(item);

              // Grid-column math — name occupies column 1; week w occupies column (w + 1):
              //   colStart = range.first + 1          (column where the first scheduled week lives)
              //   colEnd   = range.last  + 2          (exclusive: column after the last scheduled week)
              // Example: weeks 3–7 → grid-column: 4 / 9
              //   colStart = 3+1 = 4; colEnd = 7+2 = 9; spans cols 4,5,6,7,8 = weeks 3,4,5,6,7 ✓
              const colStart = range ? range.first + 1 : undefined;
              const colEnd   = range ? range.last  + 2 : undefined;

              return (
                <div
                  key={item.id}
                  className="grid items-center border-b border-gray-100 bg-white last:border-b-0"
                  style={{ gridTemplateColumns: gridCols }}
                >
                  <div className={`${stickyName} bg-white px-4 py-2`}>
                    <div className="text-sm leading-tight text-gray-700">{item.name}</div>
                    <div className="mt-0.5 text-xs text-gray-400">{item.unit} · {pct.toFixed(1)}%</div>
                  </div>

                  {/* Bar — only rendered when the item has at least one scheduled week.
                      position:relative + z-index:10 ensures bars paint above the z-0 overlay. */}
                  {range && colStart !== undefined && colEnd !== undefined && (
                    <div
                      className="relative z-10 my-1.5 h-5 overflow-hidden rounded-md bg-gray-200"
                      style={{ gridColumn: `${colStart} / ${colEnd}` }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 rounded-md bg-green-500 transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
