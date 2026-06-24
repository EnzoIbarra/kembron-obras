'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ChangeOrderRowDto } from '../types';
import type { ItemChangeOrderFormValues, AdditionWithNewItemFormValues } from '../types/schemas';

function changeOrdersKey(obraId: string) {
  return ['change-orders', obraId] as const;
}

function presupuestoKey(obraId: string) {
  return ['presupuesto', obraId] as const;
}

function invalidateBoth(qc: ReturnType<typeof useQueryClient>, obraId: string) {
  qc.invalidateQueries({ queryKey: presupuestoKey(obraId) });
  qc.invalidateQueries({ queryKey: changeOrdersKey(obraId) });
}

export function useChangeOrders(obraId: string) {
  return useQuery({
    queryKey: changeOrdersKey(obraId),
    queryFn: async (): Promise<ChangeOrderRowDto[]> => {
      const res = await fetch(`/api/obras/${obraId}/adicionales-deductivos`);
      if (!res.ok) throw new Error('Error al cargar adicionales y deductivos');
      return res.json();
    },
  });
}

/** Mutation for deduction or addition on an existing item.
 *  The itemId is included in the form values; the mutation extracts it for the URL. */
export function useCreateItemChangeOrder(obraId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: ItemChangeOrderFormValues) => {
      const { itemId, ...body } = values;
      const res = await fetch(`/api/items/${itemId}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al crear el adicional/deductivo');
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      invalidateBoth(qc, obraId);
      toast.success(variables.type === 'ADICIONAL' ? 'Adicional creado' : 'Deductivo creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

/** Mutation for addition that creates a brand-new item.
 *  The tituloId is included in the form values; the mutation extracts it for the URL. */
export function useCreateAdditionWithNewItem(obraId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (values: AdditionWithNewItemFormValues) => {
      const { tituloId, ...body } = values;
      const res = await fetch(`/api/titulos/${tituloId}/change-orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Error al crear el adicional con nuevo ítem');
      }
      return res.json();
    },
    onSuccess: () => {
      invalidateBoth(qc, obraId);
      toast.success('Adicional creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
