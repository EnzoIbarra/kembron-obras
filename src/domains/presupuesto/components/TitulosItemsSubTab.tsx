'use client';

import { useState } from 'react';
import { usePresupuesto } from '../hooks/usePresupuesto';
import { TituloFormDialog } from './TituloFormDialog';
import { ItemFormDialog } from './ItemFormDialog';
import { formatCurrency } from '@/shared/utils/format';
import type { TituloRowDto } from '../types';
import { Card } from '@/shared/components/ui/Card';
import { Button } from '@/shared/components/ui/Button';

type Props = { obraId: string };

function TableHeader() {
  return (
    <div className="hidden md:grid md:grid-cols-[1fr_140px_140px_140px] px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
      <span>Ítem</span>
      <span className="text-right">Teórico</span>
      <span className="text-right">Real</span>
      <span className="text-right">Ejecutado</span>
    </div>
  );
}

function AmountCells({
  theoretical, real, executed, bold,
}: {
  theoretical: string; real: string; executed: string; bold?: boolean;
}) {
  const cls = bold ? 'font-semibold' : 'font-medium';
  // Outer wrapper holds md:hidden alone (no competing display class) to avoid
  // the Tailwind v4 CSS ordering conflict between `grid` and `md:hidden`.
  return (
    <div className="md:hidden">
      <div className={`mt-2 grid grid-cols-3 gap-1 text-xs ${cls}`}>
        <div><div className="text-gray-400 mb-0.5 font-normal">Teórico</div><div className="text-gray-900">{formatCurrency(theoretical)}</div></div>
        <div><div className="text-gray-400 mb-0.5 font-normal">Real</div><div className="text-gray-900">{formatCurrency(real)}</div></div>
        <div><div className="text-gray-400 mb-0.5 font-normal">Ejecutado</div><div className="text-gray-900">{formatCurrency(executed)}</div></div>
      </div>
    </div>
  );
}

function TituloBlock({ titulo, obraId }: { titulo: TituloRowDto; obraId: string }) {
  const [itemDialogOpen, setItemDialogOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-2 bg-gray-50 px-4 py-3 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-800">{titulo.name}</span>
        <button
          onClick={() => setItemDialogOpen(true)}
          className="shrink-0 rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-white transition-colors"
        >
          + Ítem
        </button>
      </div>

      <TableHeader />

      {titulo.items.length === 0 ? (
        <div className="px-4 py-6 text-center text-sm text-gray-400">
          Sin ítems —{' '}
          <button className="text-blue-600 hover:underline" onClick={() => setItemDialogOpen(true)}>
            agregar el primero
          </button>
        </div>
      ) : (
        titulo.items.map((item) => (
          <div key={item.id} className="border-b border-gray-100 last:border-b-0 md:grid md:grid-cols-[1fr_140px_140px_140px]">
            <div className="px-4 py-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
                {item.origin === 'ADICIONAL' && (
                  <span className="shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">AD</span>
                )}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">
                {Number(item.quantity).toLocaleString('es-AR')} {item.unit}
              </div>
              <AmountCells theoretical={item.theoreticalAmount} real={item.real} executed={item.executed} />
            </div>
            <div className="hidden md:flex md:items-center md:justify-end px-4 text-sm text-gray-700">{formatCurrency(item.theoreticalAmount)}</div>
            <div className="hidden md:flex md:items-center md:justify-end px-4 text-sm text-gray-700">{formatCurrency(item.real)}</div>
            <div className="hidden md:flex md:items-center md:justify-end px-4 text-sm text-gray-700">{formatCurrency(item.executed)}</div>
          </div>
        ))
      )}

      <div className="bg-gray-50 border-t border-gray-200 md:grid md:grid-cols-[1fr_140px_140px_140px]">
        <div className="px-4 py-3">
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Subtotal</span>
          <AmountCells theoretical={titulo.subtotal.theoretical} real={titulo.subtotal.real} executed={titulo.subtotal.executed} bold />
        </div>
        <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-semibold text-gray-700">{formatCurrency(titulo.subtotal.theoretical)}</div>
        <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-semibold text-gray-700">{formatCurrency(titulo.subtotal.real)}</div>
        <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-semibold text-gray-700">{formatCurrency(titulo.subtotal.executed)}</div>
      </div>

      <ItemFormDialog obraId={obraId} tituloId={titulo.id} tituloName={titulo.name} open={itemDialogOpen} onOpenChange={setItemDialogOpen} />
    </Card>
  );
}

export function TitulosItemsSubTab({ obraId }: Props) {
  const { data, isLoading, error } = usePresupuesto(obraId);
  const [tituloDialogOpen, setTituloDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2].map((n) => <div key={n} className="h-32 rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />)}
      </div>
    );
  }

  if (error) {
    return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">{error.message}</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{data?.titulos.length ?? 0} título{data?.titulos.length !== 1 ? 's' : ''}</p>
        <Button onClick={() => setTituloDialogOpen(true)}>+ Nuevo título</Button>
      </div>

      {data?.titulos.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-12 text-center">
          <p className="text-gray-500 text-sm">Sin títulos presupuestarios.</p>
          <button onClick={() => setTituloDialogOpen(true)} className="mt-2 text-sm font-medium text-blue-600 hover:underline">
            Crear el primero
          </button>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {data?.titulos.map((titulo) => <TituloBlock key={titulo.id} titulo={titulo} obraId={obraId} />)}
      </div>

      {data && data.titulos.length > 0 && (
        <div className="mt-4 rounded-xl border border-gray-300 bg-gray-900 text-white md:grid md:grid-cols-[1fr_140px_140px_140px]">
          <div className="px-4 py-3">
            <span className="text-sm font-bold uppercase tracking-wide">Total obra</span>
            <div className="mt-2 grid grid-cols-3 gap-1 text-xs md:hidden font-semibold">
              <div><div className="text-gray-400 mb-0.5 font-normal">Teórico</div><div>{formatCurrency(data.total.theoretical)}</div></div>
              <div><div className="text-gray-400 mb-0.5 font-normal">Real</div><div>{formatCurrency(data.total.real)}</div></div>
              <div><div className="text-gray-400 mb-0.5 font-normal">Ejecutado</div><div>{formatCurrency(data.total.executed)}</div></div>
            </div>
          </div>
          <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-bold">{formatCurrency(data.total.theoretical)}</div>
          <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-bold">{formatCurrency(data.total.real)}</div>
          <div className="hidden md:flex md:items-center md:justify-end px-4 py-3 text-sm font-bold">{formatCurrency(data.total.executed)}</div>
        </div>
      )}

      <TituloFormDialog obraId={obraId} open={tituloDialogOpen} onOpenChange={setTituloDialogOpen} />
    </>
  );
}
