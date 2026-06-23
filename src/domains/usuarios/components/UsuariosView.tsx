'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useUsuarios, useDeleteUsuario } from '../hooks/useUsuarios';
import { UsuarioFormDialog } from './UsuarioFormDialog';
import { AsignacionesDialog } from './AsignacionesDialog';
import type { UsuarioDto } from '../types';

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
};

const ROLE_COLOR: Record<string, string> = {
  ADMIN: 'bg-purple-100 text-purple-700',
  SUPERVISOR: 'bg-blue-100 text-blue-700',
};

type DialogState =
  | { type: 'create' }
  | { type: 'edit'; usuario: UsuarioDto }
  | { type: 'asignaciones'; usuario: UsuarioDto };

export function UsuariosView() {
  const { data: session } = useSession();
  const { data: usuarios, isLoading, error } = useUsuarios();
  const deleteMutation = useDeleteUsuario();
  const [dialog, setDialog] = useState<DialogState | null>(null);

  async function handleDelete(usuario: UsuarioDto) {
    if (!window.confirm(`¿Eliminar al usuario "${usuario.username}"? Esta acción no se puede deshacer.`)) return;
    await deleteMutation.mutateAsync(usuario.id);
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="h-14 animate-pulse rounded-xl bg-gray-100" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
        Error al cargar usuarios. Recargá la página.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{usuarios?.length ?? 0} usuario{usuarios?.length !== 1 ? 's' : ''}</p>
        <button
          onClick={() => setDialog({ type: 'create' })}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">
              <th className="px-4 py-3">Usuario</th>
              <th className="px-4 py-3">Rol</th>
              <th className="hidden px-4 py-3 sm:table-cell">Obras asignadas</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {usuarios?.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-900">{u.username}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${ROLE_COLOR[u.role] ?? ''}`}>
                    {ROLE_LABEL[u.role] ?? u.role}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-gray-500 sm:table-cell">
                  {u.role === 'SUPERVISOR'
                    ? u.assignments.length === 0
                      ? <span className="text-gray-300">Sin asignar</span>
                      : u.assignments.map((a) => a.obraName).join(', ')
                    : <span className="text-gray-300">—</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => setDialog({ type: 'edit', usuario: u })}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      Editar
                    </button>
                    {u.role === 'SUPERVISOR' && (
                      <button
                        onClick={() => setDialog({ type: 'asignaciones', usuario: u })}
                        className="rounded-lg px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        Asignaciones
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(u)}
                      disabled={u.id === session?.user.id || deleteMutation.isPending}
                      className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios?.length === 0 && (
          <div className="py-12 text-center text-sm text-gray-500">
            No hay usuarios registrados.
          </div>
        )}
      </div>

      {/* Dialogs */}
      <UsuarioFormDialog
        mode="create"
        open={dialog?.type === 'create'}
        onOpenChange={(open) => { if (!open) setDialog(null); }}
      />
      {dialog?.type === 'edit' && (
        <UsuarioFormDialog
          mode="edit"
          usuario={dialog.usuario}
          open
          onOpenChange={(open) => { if (!open) setDialog(null); }}
        />
      )}
      {dialog?.type === 'asignaciones' && (
        <AsignacionesDialog
          usuario={dialog.usuario}
          open
          onOpenChange={(open) => { if (!open) setDialog(null); }}
        />
      )}
    </div>
  );
}
