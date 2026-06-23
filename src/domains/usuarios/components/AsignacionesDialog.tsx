'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useObras } from '@/domains/obras/hooks/useObras';
import { useReplaceAsignaciones } from '../hooks/useUsuarios';
import type { UsuarioDto } from '../types';

type Props = {
  usuario: UsuarioDto;
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function AsignacionesDialog({ usuario, open, onOpenChange }: Props) {
  const { data: obras, isLoading: obrasLoading } = useObras();
  const mutation = useReplaceAsignaciones();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (open) {
      setSelected(new Set(usuario.assignments.map((a) => a.obraId)));
    }
  }, [open, usuario.assignments]);

  function toggle(obraId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(obraId)) next.delete(obraId);
      else next.add(obraId);
      return next;
    });
  }

  async function handleSave() {
    await mutation.mutateAsync({ userId: usuario.id, obraIds: Array.from(selected) });
    onOpenChange(false);
  }

  function handleOpenChange(next: boolean) {
    if (!next) mutation.reset();
    onOpenChange(next);
  }

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
        <Dialog.Content className="fixed inset-x-4 top-1/2 z-50 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl max-h-[80vh] overflow-y-auto focus:outline-none sm:inset-x-auto sm:left-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2">
          <div className="flex items-center justify-between mb-1">
            <Dialog.Title className="text-base font-semibold text-gray-900">
              Obras asignadas
            </Dialog.Title>
            <Dialog.Close className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 transition-colors">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </Dialog.Close>
          </div>
          <p className="mb-4 text-sm text-gray-500">{usuario.username}</p>

          {obrasLoading && (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-10 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          )}

          {!obrasLoading && obras && (
            <div className="flex flex-col gap-2 mb-6">
              {obras.map((obra) => (
                <label
                  key={obra.id}
                  className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-3 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.has(obra.id)}
                    onChange={() => toggle(obra.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-900">{obra.name}</span>
                </label>
              ))}
              {obras.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">
                  No hay obras creadas aún.
                </p>
              )}
            </div>
          )}

          {mutation.error && (
            <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {mutation.error.message}
            </p>
          )}

          <div className="flex gap-3">
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex-1 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </Dialog.Close>
            <button
              onClick={handleSave}
              disabled={mutation.isPending}
              className="flex-1 rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {mutation.isPending ? 'Guardando…' : 'Guardar asignaciones'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
