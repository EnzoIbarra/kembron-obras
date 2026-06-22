'use client';

import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useCreateRegistroAvance } from '../hooks/useAvanceReal';

type Props = {
  obraId: string;
  itemId: string;
  itemName: string;
  unit: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function LogProgressDialog({ obraId, itemId, itemName, unit, open, onOpenChange }: Props) {
  const [qty, setQty] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { mutate, isPending, error, reset } = useCreateRegistroAvance(obraId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(
      { itemId, advancedQuantity: qty, date },
      {
        onSuccess: () => {
          setQty('');
          setDate(new Date().toISOString().split('T')[0]);
          onOpenChange(false);
        },
      },
    );
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl focus:outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <Dialog.Title className="mb-1 text-base font-semibold text-gray-900">
            Registrar avance
          </Dialog.Title>
          <p className="mb-5 text-sm text-gray-500">{itemName}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Cantidad ejecutada ({unit})
              </label>
              <input
                type="number"
                min="0"
                step="any"
                required
                value={qty}
                onChange={(e) => setQty(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">Fecha</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            {error && <p className="text-sm text-red-600">{error.message}</p>}

            <div className="flex gap-3 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
