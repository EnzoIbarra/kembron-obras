'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { useCreateGasto } from '../hooks/useGastos';
import { gastoBodySchema } from '../types/schemas';
import type { GastoFormValues } from '../types/schemas';

type BodyValues = Omit<GastoFormValues, 'itemId'>;

const CATEGORY_LABEL: Record<string, string> = {
  MANO_DE_OBRA: 'Mano de obra',
  MATERIAL: 'Material',
  EQUIPO: 'Equipo',
  SUBCONTRATO: 'Subcontrato',
  OTROS: 'Otros',
};

const today = new Date().toISOString().split('T')[0];
const inputCls =
  'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full';
const labelCls = 'text-sm font-medium text-gray-700';
const errorCls = 'text-xs text-red-500';

type Props = {
  obraId: string;
  itemId: string;
  itemName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SupervisorLogGastoDialog({
  obraId,
  itemId,
  itemName,
  open,
  onOpenChange,
}: Props) {
  const mutation = useCreateGasto(obraId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BodyValues>({
    resolver: zodResolver(gastoBodySchema),
    defaultValues: { date: today, category: 'MATERIAL' },
  });

  async function onSubmit(values: BodyValues) {
    await mutation.mutateAsync({ ...values, itemId } as GastoFormValues);
    reset({ date: today, category: 'MATERIAL' });
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      mutation.reset();
      reset({ date: today, category: 'MATERIAL' });
    }
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto focus:outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Registrar gasto
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </Dialog.Close>
          </div>
          <p className="mb-5 text-sm text-gray-500">{itemName}</p>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="sg-description" className={labelCls}>
                Descripción
              </Label.Root>
              <input
                id="sg-description"
                {...register('description')}
                placeholder="Ej: Hormigón H-21 para losa"
                className={inputCls}
              />
              {errors.description && (
                <p className={errorCls}>{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="sg-category" className={labelCls}>
                  Categoría
                </Label.Root>
                <select id="sg-category" {...register('category')} className={inputCls}>
                  {Object.entries(CATEGORY_LABEL).map(([v, l]) => (
                    <option key={v} value={v}>
                      {l}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className={errorCls}>{errors.category.message}</p>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="sg-date" className={labelCls}>
                  Fecha
                </Label.Root>
                <input
                  id="sg-date"
                  type="date"
                  {...register('date')}
                  className={inputCls}
                />
                {errors.date && <p className={errorCls}>{errors.date.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="sg-amount" className={labelCls}>
                Monto ($)
              </Label.Root>
              <input
                id="sg-amount"
                type="number"
                step="any"
                min="0"
                {...register('amount')}
                placeholder="0.00"
                className={inputCls}
              />
              {errors.amount && <p className={errorCls}>{errors.amount.message}</p>}
            </div>

            {mutation.error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {mutation.error.message}
              </p>
            )}

            <div className="flex gap-3 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {mutation.isPending ? 'Guardando…' : 'Registrar gasto'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
