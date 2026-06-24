'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { GastoRowDto } from '../types';
import type { GastoFormValues } from '../types/schemas';

function gastosKey(obraId: string) {
  return ['gastos', obraId] as const;
}

export function useGastos(obraId: string) {
  return useQuery({
    queryKey: gastosKey(obraId),
    queryFn: async (): Promise<GastoRowDto[]> => {
      const res = await fetch(`/api/obras/${obraId}/gastos`);
      if (!res.ok) throw new Error('Error al cargar los gastos');
      return res.json();
    },
  });
}

export function useCreateGasto(obraId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: GastoFormValues) => {
      const { itemId, ...body } = values;
      const res = await fetch(`/api/items/${itemId}/gastos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al registrar el gasto');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['presupuesto', obraId] });
      qc.invalidateQueries({ queryKey: gastosKey(obraId) });
      toast.success('Gasto registrado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
