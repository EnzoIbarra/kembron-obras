import { useQuery } from '@tanstack/react-query';
import type { DashboardDto } from '../types/dashboard';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'] as const,
    queryFn: async (): Promise<DashboardDto> => {
      const res = await fetch('/api/dashboard');
      if (!res.ok) throw new Error('Error al cargar el dashboard');
      return res.json();
    },
  });
}
