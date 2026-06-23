'use client';

import { useQuery } from '@tanstack/react-query';
import type { MisObraDto } from '../types';

export function useMisObras() {
  return useQuery({
    queryKey: ['mis-obras'] as const,
    queryFn: async (): Promise<MisObraDto[]> => {
      const res = await fetch('/api/mis-obras');
      if (!res.ok) throw new Error('Error al cargar tus obras');
      return res.json();
    },
  });
}
