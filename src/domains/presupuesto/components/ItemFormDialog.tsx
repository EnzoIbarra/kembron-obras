'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { itemSchema, type ItemFormValues } from '../types/schemas';
import { useCreateItem } from '../hooks/usePresupuesto';

type Props = {
  obraId: string;
  tituloId: string;
  tituloName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ItemFormDialog({ obraId, tituloId, tituloName, open, onOpenChange }: Props) {
  const mutation = useCreateItem(obraId, tituloId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormValues>({ resolver: zodResolver(itemSchema) });

  async function onSubmit(values: ItemFormValues) {
    await mutation.mutateAsync(values);
    onOpenChange(false);
    reset();
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl">
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Nuevo ítem</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <p className="text-xs text-gray-500 mb-4">En: {tituloName}</p>

          {mutation.error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutation.error.message}</p>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="item-name" className="text-sm font-medium text-gray-700">
                Nombre del ítem
              </Label.Root>
              <input
                id="item-name"
                {...register('name')}
                placeholder="Ej: Excavación a cielo abierto"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="item-quantity" className="text-sm font-medium text-gray-700">
                  Cantidad
                </Label.Root>
                <input
                  id="item-quantity"
                  type="number"
                  step="any"
                  min="0"
                  {...register('quantity')}
                  placeholder="0"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.quantity && <p className="text-xs text-red-500">{errors.quantity.message}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <Label.Root htmlFor="item-unit" className="text-sm font-medium text-gray-700">
                  Unidad
                </Label.Root>
                <input
                  id="item-unit"
                  {...register('unit')}
                  placeholder="m², ml, kg…"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
                {errors.unit && <p className="text-xs text-red-500">{errors.unit.message}</p>}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label.Root htmlFor="item-unitPrice" className="text-sm font-medium text-gray-700">
                Precio unitario ($)
              </Label.Root>
              <input
                id="item-unitPrice"
                type="number"
                step="any"
                min="0"
                {...register('unitPrice')}
                placeholder="0.00"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {errors.unitPrice && <p className="text-xs text-red-500">{errors.unitPrice.message}</p>}
            </div>

            <p className="text-xs text-gray-400">
              El monto teórico (cantidad × precio unitario) se calcula automáticamente y queda congelado al crear el ítem.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                Cancelar
              </Dialog.Close>
              <button
                type="submit"
                disabled={isSubmitting || mutation.isPending}
                className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {mutation.isPending ? 'Guardando…' : 'Crear ítem'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
