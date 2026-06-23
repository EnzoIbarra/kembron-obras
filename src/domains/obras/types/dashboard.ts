export type ObraDashboardDto = {
  id: string;
  name: string;
  status: 'EN_EJECUCION' | 'FINALIZADA' | 'PAUSADA';
  active: boolean;
  physicalProgress: number; // 0–100, rounded to 2 decimal places
  realBudget: string;       // Decimal → string
  executed: string;         // Decimal → string
};

export type DashboardDto = {
  kpis: {
    activeCount: number;
    inactiveCount: number;
    totalRealBudget: string;     // sum across ALL obras
    avgPhysicalProgress: number; // simple average across ALL obras; 0 if none
  };
  obras: ObraDashboardDto[];
};
