'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AvanceRealDto } from '../types';

export function useAvanceReal(obraId: string) {
  return useQuery({
    queryKey: ['avance-real', obraId],
    queryFn: async () => {
      const res = await fetch(`/api/obras/${obraId}/avance-real`);
      if (!res.ok) throw new Error('Error al cargar el avance real');
      return res.json() as Promise<AvanceRealDto>;
    },
  });
}

export function useCreateRegistroAvance(obraId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      itemId,
      advancedQuantity,
      date,
    }: {
      itemId: string;
      advancedQuantity: string;
      date: string;
    }) => {
      const res = await fetch(`/api/items/${itemId}/avance-real`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ advancedQuantity, date }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error ?? 'Error al registrar avance');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['avance-real', obraId] });
    },
  });
}
