'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as Label from '@radix-ui/react-label';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { useChangeOrders, useCreateItemChangeOrder, useCreateAdditionWithNewItem } from '../hooks/useChangeOrders';
import {
  itemChangeOrderFormSchema,
  additionWithNewItemFormSchema,
  type ItemChangeOrderFormValues,
  type AdditionWithNewItemFormValues,
} from '../types/schemas';
import { formatCurrency } from '@/shared/utils/format';
import { CONSTRUCTION_UNITS } from '../utils/units';
import type { ChangeOrderRowDto, PresupuestoDataDto } from '../types';

// ── Shared field styles ───────────────────────────────────────────────────────
const inputCls = 'rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 w-full';
const labelCls = 'text-sm font-medium text-gray-700';
const errorCls = 'text-xs text-red-500';

// ── Form: deductivo or adicional on existing item ─────────────────────────────
function ExistingItemForm({
  obraId,
  orderType,
  presupuestoData,
  onDone,
}: {
  obraId: string;
  orderType: 'ADICIONAL' | 'DEDUCTIVO';
  presupuestoData: PresupuestoDataDto | undefined;
  onDone: () => void;
}) {
  const mutation = useCreateItemChangeOrder(obraId);
  const allItems = presupuestoData?.titulos.flatMap((t) =>
    t.items.map((item) => ({ id: item.id, label: `${t.name} — ${item.name}` }))
  ) ?? [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ItemChangeOrderFormValues>({
    resolver: zodResolver(itemChangeOrderFormSchema),
    defaultValues: { type: orderType },
  });

  async function onSubmit(values: ItemChangeOrderFormValues) {
    await mutation.mutateAsync({ ...values, type: orderType });
    reset();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <input type="hidden" {...register('type')} value={orderType} />

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="co-itemId" className={labelCls}>Ítem afectado</Label.Root>
        <select id="co-itemId" {...register('itemId')} className={inputCls}>
          <option value="">Seleccioná un ítem…</option>
          {allItems.map((item) => (
            <option key={item.id} value={item.id}>{item.label}</option>
          ))}
        </select>
        {errors.itemId && <p className={errorCls}>{errors.itemId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="co-name" className={labelCls}>Nombre</Label.Root>
        <input id="co-name" {...register('name')} placeholder="Descripción del cambio" className={inputCls} />
        {errors.name && <p className={errorCls}>{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="co-amount" className={labelCls}>Monto ($)</Label.Root>
        <input id="co-amount" type="number" step="any" min="0" {...register('amount')} placeholder="0.00" className={inputCls} />
        {errors.amount && <p className={errorCls}>{errors.amount.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="co-desc" className={labelCls}>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label.Root>
        <textarea id="co-desc" {...register('description')} rows={2} placeholder="Detalles adicionales…" className={`${inputCls} resize-none`} />
      </div>

      {mutation.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutation.error.message}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Dialog.Close className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </Dialog.Close>
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Guardando…' : orderType === 'DEDUCTIVO' ? 'Crear deductivo' : 'Crear adicional'}
        </button>
      </div>
    </form>
  );
}

// ── Form: adicional that creates a new item ───────────────────────────────────
function NewItemForm({
  obraId,
  presupuestoData,
  onDone,
}: {
  obraId: string;
  presupuestoData: PresupuestoDataDto | undefined;
  onDone: () => void;
}) {
  const mutation = useCreateAdditionWithNewItem(obraId);
  const titulos = presupuestoData?.titulos ?? [];

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AdditionWithNewItemFormValues>({
    resolver: zodResolver(additionWithNewItemFormSchema),
  });

  async function onSubmit(values: AdditionWithNewItemFormValues) {
    await mutation.mutateAsync(values);
    reset();
    onDone();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="ni-tituloId" className={labelCls}>Título destino</Label.Root>
        <select id="ni-tituloId" {...register('tituloId')} className={inputCls}>
          <option value="">Seleccioná un título…</option>
          {titulos.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        {errors.tituloId && <p className={errorCls}>{errors.tituloId.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="ni-itemName" className={labelCls}>Nombre del nuevo ítem</Label.Root>
        <input id="ni-itemName" {...register('itemName')} placeholder="Ej: Muro de contención norte" className={inputCls} />
        {errors.itemName && <p className={errorCls}>{errors.itemName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="ni-qty" className={labelCls}>Cantidad</Label.Root>
          <input id="ni-qty" type="number" step="any" min="0" {...register('quantity')} placeholder="0" className={inputCls} />
          {errors.quantity && <p className={errorCls}>{errors.quantity.message}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <Label.Root htmlFor="ni-unit" className={labelCls}>Unidad</Label.Root>
          <select id="ni-unit" {...register('unit')} className={inputCls}>
            <option value="">Seleccioná…</option>
            {CONSTRUCTION_UNITS.map((u) => (
              <option key={u.value} value={u.value}>{u.label}</option>
            ))}
          </select>
          {errors.unit && <p className={errorCls}>{errors.unit.message}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="ni-price" className={labelCls}>Precio unitario ($)</Label.Root>
        <input id="ni-price" type="number" step="any" min="0" {...register('unitPrice')} placeholder="0.00" className={inputCls} />
        {errors.unitPrice && <p className={errorCls}>{errors.unitPrice.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="ni-name" className={labelCls}>Nombre del adicional</Label.Root>
        <input id="ni-name" {...register('name')} placeholder="Ej: Adicional por ampliación norte" className={inputCls} />
        {errors.name && <p className={errorCls}>{errors.name.message}</p>}
      </div>

      <div className="flex flex-col gap-1">
        <Label.Root htmlFor="ni-desc" className={labelCls}>Descripción <span className="text-gray-400 font-normal">(opcional)</span></Label.Root>
        <textarea id="ni-desc" {...register('description')} rows={2} placeholder="Detalles adicionales…" className={`${inputCls} resize-none`} />
      </div>

      {mutation.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{mutation.error.message}</p>}

      <div className="flex justify-end gap-2 pt-1">
        <Dialog.Close className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
          Cancelar
        </Dialog.Close>
        <button
          type="submit"
          disabled={isSubmitting || mutation.isPending}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {mutation.isPending ? 'Guardando…' : 'Crear adicional + ítem'}
        </button>
      </div>
    </form>
  );
}

// ── Dialog shell ──────────────────────────────────────────────────────────────
function ChangeOrderDialog({
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
  const [orderType, setOrderType] = useState<'ADICIONAL' | 'DEDUCTIVO'>('ADICIONAL');
  const [targetType, setTargetType] = useState<'existing' | 'new'>('existing');
  const isNewItem = orderType === 'ADICIONAL' && targetType === 'new';

  function handleDone() { onOpenChange(false); }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold text-gray-900">Nuevo adicional / deductivo</Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>

          {/* Type toggle */}
          <div className="mb-4">
            <p className={`${labelCls} mb-1.5`}>Tipo</p>
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {(['ADICIONAL', 'DEDUCTIVO'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOrderType(t)}
                  className={`flex-1 py-2 text-sm font-medium transition-colors ${
                    orderType === t
                      ? t === 'ADICIONAL' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {t === 'ADICIONAL' ? 'Adicional' : 'Deductivo'}
                </button>
              ))}
            </div>
          </div>

          {/* Target toggle — only for Adicional */}
          {orderType === 'ADICIONAL' && (
            <div className="mb-4">
              <p className={`${labelCls} mb-1.5`}>Sobre</p>
              <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                {([['existing', 'Ítem existente'], ['new', 'Nuevo ítem']] as const).map(([v, lbl]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setTargetType(v)}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      targetType === v ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Conditional form — key forces remount on mode change, resetting state */}
          {isNewItem ? (
            <NewItemForm key="new" obraId={obraId} presupuestoData={presupuestoData} onDone={handleDone} />
          ) : (
            <ExistingItemForm key={orderType} obraId={obraId} orderType={orderType} presupuestoData={presupuestoData} onDone={handleDone} />
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ── Change order list row ─────────────────────────────────────────────────────
function ChangeOrderRow({ co }: { co: ChangeOrderRowDto }) {
  const isAdicion = co.type === 'ADICIONAL';
  return (
    <div className="rounded-xl border border-gray-200 p-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex flex-col gap-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${isAdicion ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isAdicion ? 'Adicional' : 'Deductivo'}
          </span>
          <span className="text-sm font-medium text-gray-900 truncate">{co.name}</span>
        </div>
        <p className="text-xs text-gray-400">
          {co.item.titulo.name} — {co.item.name}
        </p>
        {co.description && <p className="text-xs text-gray-500">{co.description}</p>}
        <p className="text-xs text-gray-400">por {co.usuario.username} · {new Date(co.createdAt).toLocaleDateString('es-AR')}</p>
      </div>
      <div className={`shrink-0 text-sm font-semibold ${isAdicion ? 'text-green-700' : 'text-red-700'}`}>
        {isAdicion ? '+' : '−'}{formatCurrency(co.amount)}
      </div>
    </div>
  );
}

// ── Main sub-tab component ────────────────────────────────────────────────────
export function AdicionalesDeductivosSubTab({ obraId }: { obraId: string }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: presupuestoData } = usePresupuesto(obraId);
  const { data: changeOrders, isLoading, error } = useChangeOrders(obraId);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {changeOrders?.length ?? 0} registro{changeOrders?.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setDialogOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Nuevo
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

      {!isLoading && !error && changeOrders?.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-500 text-sm">Sin adicionales ni deductivos registrados.</p>
          <button onClick={() => setDialogOpen(true)} className="mt-2 text-sm font-medium text-blue-600 hover:underline">
            Registrar el primero
          </button>
        </div>
      )}

      {!isLoading && changeOrders && changeOrders.length > 0 && (
        <div className="flex flex-col gap-3">
          {changeOrders.map((co) => <ChangeOrderRow key={co.id} co={co} />)}
        </div>
      )}

      <ChangeOrderDialog
        obraId={obraId}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        presupuestoData={presupuestoData}
      />
    </div>
  );
}
