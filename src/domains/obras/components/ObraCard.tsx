'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { ObraDto } from '../types';
import { ObraStatus } from '../types';
import { STATUS_LABEL, STATUS_COLOR, formatDate } from '../utils/obraFormatting';

type Props = {
  obra: ObraDto;
  onEdit: (obra: ObraDto) => void;
  onToggleActive: (obra: ObraDto) => void;
  isToggling?: boolean;
};

const STATUS_BORDER: Record<ObraStatus, string> = {
  EN_EJECUCION: 'border-l-green-500',
  PAUSADA: 'border-l-amber-500',
  FINALIZADA: 'border-l-gray-400',
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function ObraCard({ obra, onEdit, onToggleActive, isToggling }: Props) {
  const router = useRouter();
  const inactive = !obra.active;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => router.push(`/obras/${obra.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && router.push(`/obras/${obra.id}`)}
      className={`relative rounded-xl border border-l-4 bg-white p-5 shadow-sm flex flex-col gap-4 cursor-pointer
        hover:shadow-md transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-blue-500
        ${STATUS_BORDER[obra.status as ObraStatus]}
        ${inactive ? 'opacity-60' : ''}`}
    >
      {inactive && (
        <span className="absolute top-3 right-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
          Inactiva
        </span>
      )}

      {/* Header */}
      <div className="pr-16">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">{obra.name}</h3>
        <p className="text-sm font-medium text-gray-700 mt-0.5">{obra.client}</p>
        <p className="text-xs text-gray-400 mt-0.5">{obra.location}</p>
      </div>

      {/* Status + period */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[obra.status as ObraStatus]}`}
        >
          {STATUS_LABEL[obra.status as ObraStatus]}
        </span>
        <span className="text-xs text-gray-500">
          {formatDate(obra.startDate)} – {formatDate(obra.theoreticalEndDate)}
        </span>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Avance físico</span>
            <span className="font-semibold text-gray-700">{obra.physicalProgress}%</span>
          </div>
          <ProgressBar value={obra.physicalProgress} color="bg-blue-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-500">Avance económico</span>
            <span className="font-semibold text-gray-700">{obra.economicProgress}%</span>
          </div>
          <ProgressBar value={obra.economicProgress} color="bg-emerald-500" />
        </div>
      </div>

      {/* Actions — stopPropagation prevents bubbling to the card's navigation handler */}
      <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
        <Link
          href={`/obras/${obra.id}`}
          onClick={(e) => e.stopPropagation()}
          className="w-full rounded-lg bg-blue-600 py-2 text-center text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Ver detalle
        </Link>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(obra); }}
            className="flex-1 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Editar
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(obra); }}
            disabled={isToggling}
            className={`flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
              obra.active
                ? 'border border-red-200 text-red-600 hover:bg-red-50'
                : 'border border-green-200 text-green-700 hover:bg-green-50'
            }`}
          >
            {obra.active ? 'Desactivar' : 'Reactivar'}
          </button>
        </div>
      </div>
    </div>
  );
}
