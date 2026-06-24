import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PresupuestoDataDto } from '../types';
import type { TituloFormValues, ItemFormValues } from '../types/schemas';

function presupuestoKey(obraId: string) {
  return ['presupuesto', obraId] as const;
}

export function usePresupuesto(obraId: string) {
  return useQuery({
    queryKey: presupuestoKey(obraId),
    queryFn: async (): Promise<PresupuestoDataDto> => {
      const res = await fetch(`/api/obras/${obraId}/titulos`);
      if (!res.ok) throw new Error('Error al cargar el presupuesto');
      return res.json();
    },
  });
}

export function useCreateTitulo(obraId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: TituloFormValues) => {
      const res = await fetch(`/api/obras/${obraId}/titulos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al crear el título');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: presupuestoKey(obraId) });
      toast.success('Título creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useCreateItem(obraId: string, tituloId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ItemFormValues) => {
      const res = await fetch(`/api/titulos/${tituloId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al crear el ítem');
      }
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: presupuestoKey(obraId) });
      toast.success('Ítem creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
