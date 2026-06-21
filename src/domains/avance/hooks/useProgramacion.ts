'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { ProgramacionCellDto } from '../types';

export function useProgramacion(obraId: string) {
  return useQuery({
    queryKey: ['programacion', obraId],
    queryFn: async () => {
      const res = await fetch(`/api/obras/${obraId}/programacion`);
      if (!res.ok) throw new Error('Error al cargar la programación');
      return res.json() as Promise<ProgramacionCellDto[]>;
    },
  });
}

export function useUpsertScheduleCell(obraId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      weekNumber,
      plannedQuantity,
    }: {
      itemId: string;
      weekNumber: number;
      plannedQuantity: string | null;
    }) => {
      const res = await fetch(`/api/items/${itemId}/programacion`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weekNumber, plannedQuantity }),
      });
      if (!res.ok) throw new Error('Error al guardar');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['programacion', obraId] });
    },
  });
}
