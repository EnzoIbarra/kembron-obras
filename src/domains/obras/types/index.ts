import type { Obra, ObraStatus } from '@prisma/client';

export type ObraWithProgress = Obra & {
  physicalProgress: number;
  economicProgress: number;
};

// JSON-serialized shape of ObraWithProgress (dates become strings in API responses)
export type ObraDto = Omit<
  ObraWithProgress,
  'startDate' | 'theoreticalEndDate' | 'createdAt' | 'updatedAt'
> & {
  startDate: string;
  theoreticalEndDate: string;
  createdAt: string;
  updatedAt: string;
};

export { ObraStatus };
