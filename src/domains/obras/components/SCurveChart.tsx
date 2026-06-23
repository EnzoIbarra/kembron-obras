'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { CurvaPoint } from '@/domains/avance/utils/curvas';

type Props = {
  title: string;
  planned: CurvaPoint[];
  actual: CurvaPoint[];
  totalWeeks: number;
};

export function SCurveChart({ title, planned, actual, totalWeeks }: Props) {
  const plannedMap = new Map(planned.map((p) => [p.weekNumber, p.cumulativePct]));
  const actualMap = new Map(actual.map((p) => [p.weekNumber, p.cumulativePct]));

  const data = Array.from({ length: totalWeeks }, (_, i) => {
    const w = i + 1;
    return {
      week: w,
      planned: plannedMap.get(w) ?? null,
      actual: actualMap.get(w) ?? null,
    };
  });

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="mb-4 text-sm font-semibold text-gray-700">{title}</p>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data} margin={{ top: 4, right: 16, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11 }}
            label={{ value: 'Semana', position: 'insideBottom', offset: -12, fontSize: 11 }}
          />
          <YAxis
            domain={[0, 100]}
            tickCount={6}
            unit="%"
            tick={{ fontSize: 11 }}
            width={42}
          />
          <Tooltip
            formatter={(v: unknown) => (v !== null ? `${(v as number).toFixed(1)}%` : '-')}
            labelFormatter={(w) => `Semana ${w}`}
          />
          <Legend verticalAlign="top" wrapperStyle={{ fontSize: 12, paddingBottom: 8 }} />
          <Line
            type="monotone"
            dataKey="planned"
            name="Planificado"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="actual"
            name="Real"
            stroke="#22c55e"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
