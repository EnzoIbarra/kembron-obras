import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { ObraDto } from '../types';
import type { ObraFormValues } from '../types/schemas';

const OBRAS_KEY = ['obras'] as const;

async function fetchObras(): Promise<ObraDto[]> {
  const res = await fetch('/api/obras');
  if (!res.ok) throw new Error('Error al cargar las obras');
  return res.json();
}

export function useObras() {
  return useQuery({ queryKey: OBRAS_KEY, queryFn: fetchObras });
}

export function useCreateObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: ObraFormValues) => {
      const res = await fetch('/api/obras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al crear la obra');
      }
      return res.json() as Promise<ObraDto>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OBRAS_KEY });
      toast.success('Obra creada');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateObra() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ObraFormValues }) => {
      const res = await fetch(`/api/obras/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al actualizar la obra');
      }
      return res.json() as Promise<ObraDto>;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OBRAS_KEY });
      toast.success('Obra actualizada');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useToggleObraActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/obras/${id}/toggle-active`, { method: 'POST' });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al cambiar el estado de la obra');
      }
      return res.json() as Promise<ObraDto>;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: OBRAS_KEY });
      toast.success(data.active ? 'Obra reactivada' : 'Obra desactivada');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
