'use client';

import Link from 'next/link';
import { useMisObras } from '../hooks/useMisObras';

const STATUS_LABEL: Record<string, string> = {
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada',
  PAUSADA: 'Pausada',
};

const STATUS_COLOR: Record<string, string> = {
  EN_EJECUCION: 'bg-green-100 text-green-700',
  FINALIZADA: 'bg-gray-100 text-gray-600',
  PAUSADA: 'bg-yellow-100 text-yellow-700',
};

export function MisObrasView() {
  const { data: obras, isLoading, error } = useMisObras();

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((n) => (
          <div key={n} className="h-28 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Error al cargar tus obras. Recargá la página.
      </div>
    );
  }

  if (!obras || obras.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-500">No tenés obras asignadas.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {obras.map((obra) => (
        <Link
          key={obra.id}
          href={`/mis-obras/${obra.id}`}
          className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-blue-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2 mb-3">
            <p className="font-semibold text-gray-900">{obra.name}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                STATUS_COLOR[obra.status] ?? 'bg-gray-100 text-gray-600'
              }`}
            >
              {STATUS_LABEL[obra.status] ?? obra.status}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-gray-500">Avance físico</span>
            <span className="text-xs font-semibold text-gray-700">
              {obra.physicalProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-blue-500 transition-all"
              style={{ width: `${Math.min(100, obra.physicalProgress)}%` }}
            />
          </div>
        </Link>
      ))}
    </div>
  );
}
