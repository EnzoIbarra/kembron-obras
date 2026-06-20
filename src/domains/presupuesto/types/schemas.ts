import { z } from 'zod';

export const tituloSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
});

export const itemSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  quantity: z.coerce
    .number({ required_error: 'La cantidad es requerida' })
    .positive('La cantidad debe ser mayor a cero'),
  unit: z.string().min(1, 'La unidad es requerida').max(50),
  unitPrice: z.coerce
    .number({ required_error: 'El precio unitario es requerido' })
    .positive('El precio unitario debe ser mayor a cero'),
});

export type TituloFormValues = z.infer<typeof tituloSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
