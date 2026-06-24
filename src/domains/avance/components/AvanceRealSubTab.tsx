'use client';

import { useState, useMemo } from 'react';
import { useAvanceReal } from '../hooks/useAvanceReal';
import { LogProgressDialog } from './LogProgressDialog';
import { itemCumulativePct } from '../utils/curvas';

type Props = { obraId: string };

type LogTarget = { itemId: string; itemName: string; unit: string };

export function AvanceRealSubTab({ obraId }: Props) {
  const { data, isLoading, error } = useAvanceReal(obraId);
  const [expandedTitulos, setExpandedTitulos] = useState<Set<string>>(new Set());
  const [logTarget, setLogTarget] = useState<LogTarget | null>(null);

  const obraProgress = useMemo(() => {
    if (!data) return null;
    const items = data.titulos.flatMap((t) => t.items);
    if (items.length === 0) return null;
    const sum = items.reduce((acc, item) => acc + itemCumulativePct(item), 0);
    return Math.round((sum / items.length) * 100) / 100;
  }, [data]);

  function toggleTitulo(id: string) {
    setExpandedTitulos((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <div className="h-11 animate-pulse border-b border-gray-100 bg-gray-50" />
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
              <div className="h-3 flex-1 animate-pulse rounded bg-gray-100" />
              <div className="h-2.5 w-20 animate-pulse rounded bg-gray-100" />
              <div className="h-7 w-20 animate-pulse rounded-lg bg-gray-100" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</div>;
  }

  if (!data?.titulos.length) {
    return <p className="py-8 text-center text-sm text-gray-400">No hay ítems — creá el presupuesto primero.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {obraProgress !== null && (
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
          <span className="text-sm font-medium text-gray-700">Avance físico acumulado</span>
          <div className="flex items-center gap-3">
            <div className="h-2 w-32 rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${obraProgress}%` }} />
            </div>
            <span className="min-w-[48px] text-right text-sm font-semibold text-gray-900">
              {obraProgress.toFixed(1)}%
            </span>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200">
        {data.titulos.map((titulo) => {
          const isExpanded = expandedTitulos.has(titulo.id);
          return (
            <div key={titulo.id}>
              <button
                type="button"
                onClick={() => toggleTitulo(titulo.id)}
                className="flex w-full items-center gap-2 px-4 py-3 text-left transition-colors hover:bg-gray-50"
              >
                <span className="text-xs text-gray-400">{isExpanded ? '▼' : '▶'}</span>
                <span className="flex-1 text-sm font-semibold text-gray-800">{titulo.name}</span>
                <span className="text-xs text-gray-400">{titulo.items.length} ítems</span>
              </button>

              {isExpanded && (
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                  {titulo.items.map((item) => {
                    const pct = itemCumulativePct(item);
                    return (
                      <div key={item.id} className="bg-white px-4 py-3">
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm text-gray-700">{item.name}</span>
                              <span className="text-xs text-gray-400">{item.unit}</span>
                            </div>
                            <div className="mt-1.5 flex items-center gap-2">
                              <div className="h-1.5 w-24 rounded-full bg-gray-200">
                                <div className="h-1.5 rounded-full bg-green-500 transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs font-medium text-gray-600">{pct.toFixed(1)}%</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setLogTarget({ itemId: item.id, itemName: item.name, unit: item.unit })}
                            className="shrink-0 rounded-lg border border-gray-200 px-2 py-1 text-xs font-semibold text-gray-500 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                          >
                            + Registrar
                          </button>
                        </div>

                        {item.registros.length > 0 && (
                          <div className="mt-2 flex flex-col gap-1 border-l-2 border-gray-100 pl-3">
                            {item.registros.map((r) => (
                              <div key={r.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-gray-500">
                                <span className="font-medium text-gray-700">
                                  +{Number(r.advancedQuantity).toLocaleString('es-AR')} {item.unit}
                                </span>
                                <span>{r.date}</span>
                                <span className="text-gray-400">{r.userName}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {logTarget && (
        <LogProgressDialog
          obraId={obraId}
          itemId={logTarget.itemId}
          itemName={logTarget.itemName}
          unit={logTarget.unit}
          open={logTarget !== null}
          onOpenChange={(open) => { if (!open) setLogTarget(null); }}
        />
      )}
    </div>
  );
}
