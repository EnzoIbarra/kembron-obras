'use client';

import { Fragment, useState, useEffect, useRef, useMemo } from 'react';
import { usePresupuesto } from '@/domains/presupuesto/hooks/usePresupuesto';
import { useProgramacion, useUpsertScheduleCell } from '../hooks/useProgramacion';
import { calculateTotalWeeks } from '../utils/semanas';
import type { ScheduleMap } from '../types';

type Props = { obraId: string; startDate: Date; theoreticalEndDate: Date };

const stickyCol = 'sticky left-0 z-10 border-r border-gray-200';
const inputCls =
  'w-14 rounded border border-gray-200 bg-gray-50 px-1 py-1 text-center text-xs text-gray-900 ' +
  'focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-400';

export function ProgramacionSubTab({ obraId, startDate, theoreticalEndDate }: Props) {
  const { data: presupuesto, isLoading: loadingRows } = usePresupuesto(obraId);
  const { data: programacion, isLoading: loadingCells, error } = useProgramacion(obraId);
  const { mutate: upsertCell, isError: saveError } = useUpsertScheduleCell(obraId);

  const totalWeeks = useMemo(
    () => calculateTotalWeeks(startDate, theoreticalEndDate),
    [startDate, theoreticalEndDate],
  );
  const weeks = useMemo(() => Array.from({ length: totalWeeks }, (_, i) => i + 1), [totalWeeks]);

  const [localMap, setLocalMap] = useState<ScheduleMap>({});
  const savedRef = useRef<ScheduleMap>({});
  const initialized = useRef(false);

  useEffect(() => {
    if (programacion && !initialized.current) {
      const map: ScheduleMap = {};
      for (const cell of programacion) {
        if (!map[cell.itemId]) map[cell.itemId] = {};
        map[cell.itemId][cell.weekNumber] = cell.plannedQuantity;
      }
      setLocalMap(map);
      savedRef.current = structuredClone(map);
      initialized.current = true;
    }
  }, [programacion]);

  function handleChange(itemId: string, week: number, value: string) {
    setLocalMap((prev) => ({ ...prev, [itemId]: { ...prev[itemId], [week]: value } }));
  }

  function handleBlur(itemId: string, week: number) {
    const current = localMap[itemId]?.[week] ?? '';
    const saved = savedRef.current[itemId]?.[week] ?? '';
    if (current === saved) return;
    const qty = current.trim() || null;
    upsertCell(
      { itemId, weekNumber: week, plannedQuantity: qty },
      {
        onSuccess: () => {
          if (!savedRef.current[itemId]) savedRef.current[itemId] = {};
          savedRef.current[itemId][week] = current;
        },
      },
    );
  }

  if (loadingRows || loadingCells) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((n) => <div key={n} className="h-10 rounded-lg bg-gray-100 animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</div>;
  }

  if (!presupuesto?.titulos.length) {
    return (
      <p className="py-8 text-center text-sm text-gray-400">
        No hay ítems en el presupuesto — creá títulos e ítems primero.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {saveError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          Error al guardar — revisá tu conexión e intentá de nuevo.
        </p>
      )}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="border-collapse text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className={`${stickyCol} bg-gray-50 min-w-[200px] px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600`}>
                Ítem
              </th>
              {weeks.map((w) => (
                <th key={w} className="w-16 min-w-[64px] px-2 py-3 text-center text-xs font-medium text-gray-500">
                  S{w}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {presupuesto.titulos.map((titulo) => (
              <Fragment key={titulo.id}>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <td className={`${stickyCol} bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-800`}>
                    {titulo.name}
                  </td>
                  {weeks.map((w) => (
                    <td key={w} className="px-2 py-2 text-center text-xs text-gray-300">—</td>
                  ))}
                </tr>
                {titulo.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 last:border-b-0">
                    <td className={`${stickyCol} bg-white px-4 py-2`}>
                      <div className="text-sm leading-tight text-gray-700">{item.name}</div>
                      <div className="mt-0.5 text-xs text-gray-400">
                        {item.unit} · total {Number(item.quantity).toLocaleString('es-AR')}
                      </div>
                    </td>
                    {weeks.map((w) => (
                      <td key={w} className="px-1 py-1 text-center">
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={localMap[item.id]?.[w] ?? ''}
                          onChange={(e) => handleChange(item.id, w, e.target.value)}
                          onBlur={() => handleBlur(item.id, w)}
                          className={inputCls}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
