'use client';

import { useMemo } from 'react';
import { usePresupuesto } from '@/domains/presupuesto/hooks/usePresupuesto';
import { useGastos } from '@/domains/presupuesto/hooks/useGastos';
import { useProgramacion } from '@/domains/avance/hooks/useProgramacion';
import { useAvanceReal } from '@/domains/avance/hooks/useAvanceReal';
import { calculateTotalWeeks, dateToWeekNumber } from '@/domains/avance/utils/semanas';
import {
  buildPlannedCurve,
  buildActualCurve,
  buildActualFinancialCurve,
  itemCumulativePct,
} from '@/domains/avance/utils/curvas';
import { SCurveChart } from './SCurveChart';

type Props = { obraId: string; startDate: string; theoreticalEndDate: string };

export function ResumenTab({ obraId, startDate, theoreticalEndDate }: Props) {
  const startObj = useMemo(() => new Date(startDate), [startDate]);
  const endObj   = useMemo(() => new Date(theoreticalEndDate), [theoreticalEndDate]);

  const { data: presupuesto, isLoading: loadingPres } = usePresupuesto(obraId);
  const { data: programacion, isLoading: loadingProg } = useProgramacion(obraId);
  const { data: avanceReal,   isLoading: loadingAvance } = useAvanceReal(obraId);
  const { data: gastos,       isLoading: loadingGastos } = useGastos(obraId);

  const totalWeeks = useMemo(() => calculateTotalWeeks(startObj, endObj), [startObj, endObj]);

  // ── KPI: días / tiempo ───────────────────────────────────────────────────
  const { daysElapsed, timePct } = useMemo(() => {
    const MS = 24 * 60 * 60 * 1000;
    const today = new Date();
    const s = new Date(Date.UTC(startObj.getUTCFullYear(), startObj.getUTCMonth(), startObj.getUTCDate()));
    const e = new Date(Date.UTC(endObj.getUTCFullYear(), endObj.getUTCMonth(), endObj.getUTCDate()));
    const t = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
    const elapsed = Math.max(0, Math.floor((t.getTime() - s.getTime()) / MS));
    const total = Math.max(1, Math.floor((e.getTime() - s.getTime()) / MS) + 1);
    return {
      daysElapsed: elapsed,
      timePct: Math.min(100, Math.round((elapsed / total) * 10000) / 100),
    };
  }, [startObj, endObj]);

  // ── KPI: avance físico ───────────────────────────────────────────────────
  const fisicoPct = useMemo(() => {
    if (!avanceReal) return null;
    const items = avanceReal.titulos.flatMap((t) => t.items);
    if (items.length === 0) return null;
    const sum = items.reduce((acc, i) => acc + itemCumulativePct(i), 0);
    return Math.round((sum / items.length) * 100) / 100;
  }, [avanceReal]);

  // ── KPI: avance económico ────────────────────────────────────────────────
  const economicoPct = useMemo(() => {
    if (!presupuesto) return null;
    const real     = Number(presupuesto.total.real);
    const executed = Number(presupuesto.total.executed);
    if (real <= 0) return 0; // guard: no budget yet
    return Math.round((executed / real) * 10000) / 100;
  }, [presupuesto]);

  // ── Título-level physical progress ───────────────────────────────────────
  const tituloPcts = useMemo(() => {
    if (!avanceReal) return [];
    return avanceReal.titulos.map((t) => {
      const pct =
        t.items.length === 0
          ? 0
          : Math.round(
              (t.items.reduce((acc, i) => acc + itemCumulativePct(i), 0) / t.items.length) * 100,
            ) / 100;
      return { id: t.id, name: t.name, pct };
    });
  }, [avanceReal]);

  // ── unitPrice lookup for financial planned curve ──────────────────────────
  const unitPriceByItemId = useMemo(() => {
    const map = new Map<string, number>();
    if (!presupuesto) return map;
    for (const t of presupuesto.titulos)
      for (const i of t.items) map.set(i.id, Number(i.unitPrice));
    return map;
  }, [presupuesto]);

  // ── Physical S-curves ────────────────────────────────────────────────────
  const physicalPlanned = useMemo(
    () => buildPlannedCurve(programacion ?? [], totalWeeks, (c) => Number(c.plannedQuantity)),
    [programacion, totalWeeks],
  );

  const physicalActual = useMemo(() => {
    if (!avanceReal) return [];
    const items    = avanceReal.titulos.flatMap((t) => t.items.map((i) => ({ id: i.id, quantity: i.quantity })));
    const records  = avanceReal.titulos.flatMap((t) =>
      t.items.flatMap((item) =>
        item.registros.map((r) => ({
          itemId: item.id,
          weekNumber: dateToWeekNumber(startObj, new Date(r.date + 'T00:00:00Z'), totalWeeks),
          advancedQuantity: r.advancedQuantity,
        })),
      ),
    );
    return buildActualCurve(records, items, totalWeeks);
  }, [avanceReal, startObj, totalWeeks]);

  // ── Financial S-curves ───────────────────────────────────────────────────
  const financialPlanned = useMemo(
    () =>
      buildPlannedCurve(
        programacion ?? [],
        totalWeeks,
        (c) => Number(c.plannedQuantity) * (unitPriceByItemId.get(c.itemId) ?? 0),
      ),
    [programacion, totalWeeks, unitPriceByItemId],
  );

  const financialActual = useMemo(() => {
    if (!gastos || !presupuesto) return [];
    const expenses = gastos.map((g) => ({
      weekNumber: dateToWeekNumber(startObj, new Date(g.date.split('T')[0] + 'T00:00:00Z'), totalWeeks),
      amount: g.amount,
    }));
    return buildActualFinancialCurve(expenses, presupuesto.total.real, totalWeeks);
  }, [gastos, presupuesto, startObj, totalWeeks]);

  const isLoading = loadingPres || loadingProg || loadingAvance || loadingGastos;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-20 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Avance físico" value={fisicoPct !== null ? `${fisicoPct.toFixed(1)}%` : '—'} />
        <KpiCard label="Avance económico" value={economicoPct !== null ? `${economicoPct.toFixed(1)}%` : '—'} />
        <KpiCard label="Días transcurridos" value={String(daysElapsed)} />
        <KpiCard label="Tiempo transcurrido" value={`${timePct.toFixed(1)}%`} />
      </div>

      {/* ── Progress by título ── */}
      {tituloPcts.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-3 text-sm font-semibold text-gray-700">Avance por título</p>
          <div className="flex flex-col gap-2">
            {tituloPcts.map((t) => (
              <div key={t.id} className="flex items-center gap-3">
                <span className="w-40 shrink-0 truncate text-xs text-gray-600">{t.name}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
                <span className="w-10 text-right text-xs font-medium text-gray-700">{t.pct.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── S-curves ── */}
      <SCurveChart
        title="Curva S — Avance físico"
        planned={physicalPlanned}
        actual={physicalActual}
        totalWeeks={totalWeeks}
      />
      <SCurveChart
        title="Curva S — Avance económico"
        planned={financialPlanned}
        actual={financialActual}
        totalWeeks={totalWeeks}
      />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-2xl font-bold text-gray-900">{value}</span>
    </div>
  );
}
