import { z } from 'zod';
import { ObraStatus } from '@prisma/client';

export const obraSchema = z
  .object({
    name: z.string().min(1, 'El nombre es requerido').max(200),
    location: z.string().min(1, 'La ubicación es requerida').max(200),
    client: z.string().min(1, 'El cliente es requerido').max(200),
    status: z.nativeEnum(ObraStatus, {
      errorMap: () => ({ message: 'Estado inválido' }),
    }),
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    theoreticalEndDate: z.string().min(1, 'La fecha de fin teórica es requerida'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.theoreticalEndDate) return true;
      return new Date(data.theoreticalEndDate) > new Date(data.startDate);
    },
    {
      message: 'La fecha de fin teórica debe ser posterior a la fecha de inicio',
      path: ['theoreticalEndDate'],
    }
  );

export type ObraFormValues = z.infer<typeof obraSchema>;
