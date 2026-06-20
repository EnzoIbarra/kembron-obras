'use client';

import { useState } from 'react';
import { ObraCard } from './ObraCard';
import { ObraFormDialog } from './ObraFormDialog';
import { useObras, useToggleObraActive } from '../hooks/useObras';
import type { ObraDto } from '../types';

export function ObrasList() {
  const { data: obras, isLoading, error } = useObras();
  const toggleActive = useToggleObraActive();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingObra, setEditingObra] = useState<ObraDto | null>(null);

  function handleToggle(obra: ObraDto) {
    toggleActive.mutate(obra.id);
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="rounded-xl border bg-white p-5 h-48 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-600">
        {error.message}
      </div>
    );
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">
          {obras?.length ?? 0} obra{obras?.length !== 1 ? 's' : ''}
        </p>
        <button
          onClick={() => setCreateOpen(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
        >
          + Nueva obra
        </button>
      </div>

      {/* Grid */}
      {obras?.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">No hay obras registradas.</p>
          <button
            onClick={() => setCreateOpen(true)}
            className="mt-3 text-sm font-medium text-blue-600 hover:underline"
          >
            Crear la primera obra
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {obras?.map((obra) => (
            <ObraCard
              key={obra.id}
              obra={obra}
              onEdit={setEditingObra}
              onToggleActive={handleToggle}
              isToggling={toggleActive.isPending && toggleActive.variables === obra.id}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <ObraFormDialog open={createOpen} onOpenChange={setCreateOpen} />
      <ObraFormDialog
        open={!!editingObra}
        onOpenChange={(open) => !open && setEditingObra(null)}
        obra={editingObra}
      />
    </>
  );
}
