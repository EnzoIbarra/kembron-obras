'use client';

import { useState } from 'react';
import { useMisObras } from '../hooks/useMisObras';
import { useAvanceReal } from '@/domains/avance/hooks/useAvanceReal';
import { LogProgressDialog } from '@/domains/avance/components/LogProgressDialog';
import { SupervisorLogGastoDialog } from '@/domains/presupuesto/components/SupervisorLogGastoDialog';

type DialogState = {
  type: 'avance' | 'gasto';
  itemId: string;
  itemName: string;
  unit: string;
};

export function SupervisorObraView({ obraId }: { obraId: string }) {
  const { data: obras } = useMisObras();
  const { data: avance, isLoading, error } = useAvanceReal(obraId);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  const obra = obras?.find((o) => o.id === obraId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-24 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Error al cargar la obra. Recargá la página.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">{obra?.name ?? 'Obra'}</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Registrá avance o gastos por ítem.
        </p>
      </div>

      {/* Titulos → Items */}
      {avance?.titulos.map((titulo) => (
        <div key={titulo.id} className="flex flex-col gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
            {titulo.name}
          </p>

          {titulo.items.map((item) => {
            const adv = item.registros.reduce(
              (s, r) => s + Number(r.advancedQuantity),
              0,
            );
            const qty = Number(item.quantity);
            const pct = qty === 0 ? 0 : Math.min(100, (adv / qty) * 100);

            return (
              <div
                key={item.id}
                className="rounded-xl border border-gray-200 bg-white p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-400">{item.unit}</p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-gray-700">
                    {pct.toFixed(1)}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setDialog({
                        type: 'avance',
                        itemId: item.id,
                        itemName: item.name,
                        unit: item.unit,
                      })
                    }
                    className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    + Avance
                  </button>
                  <button
                    onClick={() =>
                      setDialog({
                        type: 'gasto',
                        itemId: item.id,
                        itemName: item.name,
                        unit: item.unit,
                      })
                    }
                    className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    + Gasto
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ))}

      {avance?.titulos.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-500">
            Esta obra aún no tiene ítems cargados.
          </p>
        </div>
      )}

      {/* Dialogs — always mounted so Radix close animations work */}
      <LogProgressDialog
        obraId={obraId}
        itemId={dialog?.type === 'avance' ? dialog.itemId : ''}
        itemName={dialog?.type === 'avance' ? dialog.itemName : ''}
        unit={dialog?.type === 'avance' ? dialog.unit : ''}
        open={dialog?.type === 'avance' ?? false}
        onOpenChange={(open) => { if (!open) setDialog(null); }}
      />
      <SupervisorLogGastoDialog
        obraId={obraId}
        itemId={dialog?.type === 'gasto' ? dialog.itemId : ''}
        itemName={dialog?.type === 'gasto' ? dialog.itemName : ''}
        open={dialog?.type === 'gasto' ?? false}
        onOpenChange={(open) => { if (!open) setDialog(null); }}
      />
    </div>
  );
}
