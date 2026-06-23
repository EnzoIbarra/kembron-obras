'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';
import { useDashboard } from '../hooks/useDashboard';

const arsCompact = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const arsFull = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
});

function shortName(name: string) {
  return name.length > 18 ? name.slice(0, 16) + '…' : name;
}

export function DashboardView() {
  const { data, isLoading, error } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => <div key={n} className="h-24 animate-pulse rounded-xl bg-gray-100" />)}
        </div>
        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
        <div className="h-72 animate-pulse rounded-xl bg-gray-100" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Error al cargar el dashboard. Recargá la página.
      </div>
    );
  }

  const { kpis, obras } = data;

  // Physical progress chart data
  const progressData = obras.map((o) => ({
    name: shortName(o.name),
    avance: o.physicalProgress,
    active: o.active,
  }));

  // Budget vs executed chart data (raw numbers for Recharts; formatted in tooltip)
  const budgetData = obras.map((o) => ({
    name: shortName(o.name),
    presupuestado: Number(o.realBudget),
    ejecutado: Number(o.executed),
    active: o.active,
  }));

  return (
    <div className="flex flex-col gap-6">
      {/* ── KPI cards ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label="Obras activas"         value={String(kpis.activeCount)} />
        <KpiCard label="Proyectos desactivados" value={String(kpis.inactiveCount)} />
        <KpiCard label="Presupuesto total"      value={arsCompact.format(Number(kpis.totalRealBudget))} />
        <KpiCard label="Avance promedio"        value={`${kpis.avgPhysicalProgress.toFixed(1)}%`} />
      </div>

      {/* ── Chart 1: physical progress per obra ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-4 text-sm font-semibold text-gray-700">Avance físico por obra</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={progressData} margin={{ top: 4, right: 16, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis domain={[0, 100]} unit="%" tick={{ fontSize: 11 }} width={42} />
            <Tooltip formatter={(v: unknown) => [`${(v as number).toFixed(1)}%`, 'Avance']} />
            <Bar dataKey="avance" name="Avance físico" radius={[4, 4, 0, 0]}>
              {progressData.map((entry, i) => (
                <Cell key={i} fill="#3b82f6" opacity={entry.active ? 1 : 0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="mt-1 text-xs text-gray-400">Las obras desactivadas se muestran con menor opacidad.</p>
      </div>

      {/* ── Chart 2: presupuestado vs ejecutado ── */}
      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <p className="mb-4 text-sm font-semibold text-gray-700">Presupuestado vs ejecutado por obra</p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={budgetData} margin={{ top: 4, right: 16, bottom: 24, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 11 }}
              interval={0}
              angle={-20}
              textAnchor="end"
              height={48}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              width={56}
              tickFormatter={(v) => arsCompact.format(v)}
            />
            <Tooltip
              formatter={(v: unknown, name: string | number | undefined) => [
                arsFull.format(v as number),
                name === 'presupuestado' ? 'Presupuestado' : 'Ejecutado',
              ]}
            />
            <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
            <Bar dataKey="presupuestado" name="Presupuestado" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {budgetData.map((entry, i) => (
                <Cell key={i} fill="#3b82f6" opacity={entry.active ? 1 : 0.4} />
              ))}
            </Bar>
            <Bar dataKey="ejecutado" name="Ejecutado" fill="#22c55e" radius={[4, 4, 0, 0]}>
              {budgetData.map((entry, i) => (
                <Cell key={i} fill="#22c55e" opacity={entry.active ? 1 : 0.4} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
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
