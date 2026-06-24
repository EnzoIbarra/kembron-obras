'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UsuarioDto } from '../types';
import type { CreateUsuarioValues, UpdateUsuarioValues } from '../types/schemas';

const KEY = ['usuarios'] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<UsuarioDto[]> => {
      const res = await fetch('/api/usuarios');
      if (!res.ok) throw new Error('Error al cargar usuarios');
      return res.json();
    },
  });
}

export function useCreateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: CreateUsuarioValues) => {
      const res = await fetch('/api/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al crear usuario');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Usuario creado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useUpdateUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUsuarioValues }) => {
      const res = await fetch(`/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al actualizar usuario');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Usuario actualizado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useDeleteUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/usuarios/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? 'Error al eliminar usuario');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Usuario eliminado');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}

export function useReplaceAsignaciones() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, obraIds }: { userId: string; obraIds: string[] }) => {
      const res = await fetch(`/api/usuarios/${userId}/asignaciones`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ obraIds }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error ?? 'Error al guardar asignaciones');
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: KEY });
      toast.success('Asignaciones guardadas');
    },
    onError: (err: Error) => toast.error(err.message),
  });
}
