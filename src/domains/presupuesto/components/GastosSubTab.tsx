'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useGastos, useCreateGasto } from '../hooks/useGastos';
import { gastoFormSchema, type GastoFormValues } from '../types/schemas';
import { formatCurrency } from '@/shared/utils/format';
import type { GastoRowDto, PresupuestoDataDto } from '../types';

const CATEGORY_LABEL: Record<string, string> = {
  MANO_DE_OBRA: 'Mano de obra',
  MATERIAL: 'Material',
  EQUIPO: 'Equipo',
  SUBCONTRATO: 'Subcontrato',
  OTROS: 'Otros',
};

const CATEGORY_COLOR: Record<string, string> = {
  MANO_DE_OBRA: 'bg-blue-100 text-blue-700',
  MATERIAL: 'bg-orange-100 text-orange-700',
  EQUIPO: 'bg-purple-100 text-purple-700',
  SUBCONTRATO: 'bg-yellow-100 text-yellow-700',
  OTROS: 'bg-gray-100 text-gray-600',
};

const today = new Date().toISOString().split('T')[0];
const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full';
const labelCls = 'text-sm font-medium text-gray-700';
const errorCls = 'text-xs text-red-500';

// ── Gasto list row ────────────────────────────────────────────────────────────
function GastoRow({ gasto }: { gasto: GastoRowDto }) {
  const dateStr = gasto.date.slice(0, 10);
  const [y, m, d] = dateStr.split('-');
  const formatted = `${d}/${m}/${y}`;

  return (
    <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-400">{formatted}</span>
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${CATEGORY_COLOR[gasto.category] ?? 'bg-gray-100 text-gray-600'}`}>
            {CATEGORY_LABEL[gasto.category] ?? gasto.category}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-900 truncate">{gasto.description}</p>
        <p className="text-xs text-gray-400">{gasto.item.titulo.name} — {gasto.item.name}</p>
        <p className="text-xs text-gray-400">por {gasto.usuario.username}</p>
      </div>
      <div className="shrink-0 text-sm font-semibold text-gray-900">{formatCurrency(gasto.amount)}</div>
    </div>
  );
}

// ── Gasto form (inside dialog) ────────────────────────────────────────────────
function GastoForm({
  obraId,
  presupuestoData,
  onDone,
}: {
  obraId: string;
  presupuestoData: PresupuestoDataDto | undefined;
  onDone: () => void;
}) {
  const mutation = useCreateGasto(obraId);
  const allItems = presupuestoData?.titulos.flatMap((t) =>
    t.items.map((item) => ({ id: item.id, label: `${t.name} — ${item.name}` }))
  ) ?? [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<GastoFormValues>({
    resolver: zodResolver(gastoFormSchema),
    defaultValues: { date: today },
  });

  async function onSubmit(values: GastoFormValues) {
    await mutation.mutateAsync(values);
    reset({ date: today });
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="g-itemId" className={labelCls}>Ítem</Label.Root>
        <select id="g-itemId" {...register('itemId')} className={inputCls}>
          <option value="">Seleccioná un ítem…</option>
          {allItems.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        {errors.itemId && <p className={errorCls}>{errors.itemId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="g-description" className={labelCls}>Descripción</Label.Root>
        <input id="g-description" {...register('description')} placeholder="Ej: Hormigón H-21 para losa" className={inputCls} />
        {errors.description && <p className={errorCls}>{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="g-category" className={labelCls}>Categoría</Label.Root>
          <select id="g-category" {...register('category')} className={inputCls}>
            {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          {errors.category && <p className={errorCls}>{errors.category.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="g-date" className={labelCls}>Fecha</Label.Root>
          <input id="g-date" type="date" {...register('date')} className={inputCls} />
          {errors.date && <p className={errorCls}>{errors.date.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="g-amount" className={labelCls}>Monto ($)</Label.Root>
        <input id="g-amount" type="number" step="any" min="0" {...register('amount')} placeholder="0.00" className={inputCls} />
        {errors.amount && <p className={errorCls}>{errors.amount.message}</p>}
      </div>

      {mutation.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutation.error.message}</p>
      )}

      <div className="flex justify-end gap-2 pt-1">
        <Dialog.Close className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </Dialog.Close>
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Guardando…' : 'Registrar gasto'}
        </button>
      </div>
    </form>
  );
}

// ── Dialog shell ──────────────────────────────────────────────────────────────
function GastoDialog({
  obraId,
  open,
  onOpenChange,
  presupuestoData,
}: {
  obraId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  presupuestoData: PresupuestoDataDto | undefined;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Registrar gasto</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <GastoForm obraId={obraId} presupuestoData={presupuestoData} onDone={() => onOpenChange(false)} />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Main sub-tab component ────────────────────────────────────────────────────
export function GastosSubTab({ obraId }: { obraId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: presupuestoData } = usePresupuesto(obraId);
  const { data: gastos, isLoading, error } = useGastos(obraId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {gastos?.length ?? 0} gasto{gastos?.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Registrar gasto
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3">
          {[1, 2].map((n) => <div key={n} className="h-20 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />)}
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</div>
      )}

      {!isLoading && !error && gastos?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-500 text-sm">Sin gastos registrados.</p>
          <button onClick={() => setDialogOpen(true)} className="mt-2 text-sm font-medium text-blue-600 hover:underline">
            Registrar el primero
          </button>
        </div>
      )}

      {!isLoading && gastos && gastos.length > 0 && (
        <div className="flex flex-col gap-3">
          {gastos.map((g) => <GastoRow key={g.id} gasto={g} />)}
        </div>
      )}

      <GastoDialog obraId={obraId} open={dialogOpen} onOpenChange={setDialogOpen} presupuestoData={presupuestoData} />
    </div>
  );
}
