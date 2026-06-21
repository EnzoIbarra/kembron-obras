import { z } from 'zod';

const positiveDecimal = z
  .string()
  .regex(/^\d+(\.\d+)?$/, 'Debe ser un número positivo')
  .refine((v) => parseFloat(v) > 0, 'Debe ser mayor a cero');

export const programacionCellBodySchema = z.object({
  weekNumber: z.number().int().positive(),
  // null → delete the record (cell cleared); string → upsert
  plannedQuantity: positiveDecimal.nullable(),
});
