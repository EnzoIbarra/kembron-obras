import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ObraStatus } from '@prisma/client';

export const STATUS_LABEL: Record<ObraStatus, string> = {
  EN_EJECUCION: 'En ejecución',
  FINALIZADA: 'Finalizada',
  PAUSADA: 'Pausada',
};

export const STATUS_COLOR: Record<ObraStatus, string> = {
  EN_EJECUCION: 'bg-green-100 text-green-800',
  FINALIZADA: 'bg-blue-100 text-blue-800',
  PAUSADA: 'bg-yellow-100 text-yellow-800',
};

export function formatDate(iso: string): string {
  return format(new Date(iso), 'd MMM yyyy', { locale: es });
}
