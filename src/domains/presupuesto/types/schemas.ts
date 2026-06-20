import { z } from 'zod';

export const tituloSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
});

// Validates a numeric string without converting it to a JS number, so the raw
// string survives to new Prisma.Decimal() with no float intermediate step.
const positiveDecimalString = (label: string) =>
  z
    .string({ required_error: `${label} es requerido` })
    .min(1, `${label} es requerido`)
    .regex(/^\d+(\.\d+)?$/, `${label} debe ser un número positivo`)
    .refine((v) => parseFloat(v) > 0, `${label} debe ser mayor a cero`);

export const itemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  quantity: positiveDecimalString('La cantidad'),
  unit: z.string().min(1, 'La unidad es requerida').max(50),
  unitPrice: positiveDecimalString('El precio unitario'),
});

export type TituloFormValues = z.infer<typeof tituloSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
