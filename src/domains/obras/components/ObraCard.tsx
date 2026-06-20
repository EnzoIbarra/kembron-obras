'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { ObraDto } from '../types';
import { ObraStatus } from '../types';

const STATUS_LABEL: Record<ObraStatus, string> = {
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada',
  PAUSADA: 'Pausada',
};

const STATUS_COLOR: Record<ObraStatus, string> = {
  EN_EJECUCION: 'bg-green-100 text-green-800',
  FINALIZADA: 'bg-blue-100 text-blue-800',
  PAUSADA: 'bg-yellow-100 text-yellow-800',
};

type Props = {
  obra: ObraDto;
  onEdit: (obra: ObraDto) => void;
  onToggleActive: (obra: ObraDto) => void;
  isToggling?: boolean;
};

function ProgressBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function ObraCard({ obra, onEdit, onToggleActive, isToggling }: Props) {
  const inactive = !obra.active;

  return (
    <div
      className={`relative rounded-xl border bg-white p-5 shadow-sm flex flex-col gap-4 transition-opacity ${
        inactive ? 'opacity-60' : ''
      }`}
    >
      {inactive && (
        <span className="absolute top-3 right-3 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600">
          Inactiva
        </span>
      )}

      {/* Header */}
      <div className="pr-16">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">{obra.name}</h3>
        <p className="text-sm text-gray-500 mt-0.5">{obra.client}</p>
        <p className="text-xs text-gray-400 mt-0.5">{obra.location}</p>
      </div>

      {/* Status + period */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_COLOR[obra.status as ObraStatus]}`}
        >
          {STATUS_LABEL[obra.status as ObraStatus]}
        </span>
        <span className="text-xs text-gray-500">
          {format(new Date(obra.startDate), 'd MMM yyyy', { locale: es })}
          {' – '}
          {format(new Date(obra.theoreticalEndDate), 'd MMM yyyy', { locale: es })}
        </span>
      </div>

      {/* Progress */}
      <div className="flex flex-col gap-2">
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Avance físico</span>
            <span>{obra.physicalProgress}%</span>
          </div>
          <ProgressBar value={obra.physicalProgress} color="bg-blue-500" />
        </div>
        <div>
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Avance económico</span>
            <span>{obra.economicProgress}%</span>
          </div>
          <ProgressBar value={obra.economicProgress} color="bg-emerald-500" />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1 border-t border-gray-100">
        <button
          onClick={() => onEdit(obra)}
          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Editar
        </button>
        <button
          onClick={() => onToggleActive(obra)}
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
  );
}
