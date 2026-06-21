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

// ── Change order schemas ───────────────────────────────────────────────────────

// API route body for POST /api/items/[id]/change-orders (existing item target)
export const itemChangeOrderBodySchema = z.object({
  type: z.enum(['ADICIONAL', 'DEDUCTIVO']),
  name: z.string().min(1, 'El nombre es requerido').max(200),
  amount: positiveDecimalString('El monto'),
  description: z.string().max(500).optional(),
});

// Form schema (extends body schema with the item selector)
export const itemChangeOrderFormSchema = itemChangeOrderBodySchema.extend({
  itemId: z.string().min(1, 'Seleccioná un ítem'),
});

// API route body for POST /api/titulos/[id]/change-orders (creates a new item)
export const additionWithNewItemBodySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  itemName: z.string().min(1, 'El nombre del ítem es requerido').max(200),
  quantity: positiveDecimalString('La cantidad'),
  unit: z.string().min(1, 'La unidad es requerida').max(50),
  unitPrice: positiveDecimalString('El precio unitario'),
  description: z.string().max(500).optional(),
});

// Form schema (extends body schema with the titulo selector)
export const additionWithNewItemFormSchema = additionWithNewItemBodySchema.extend({
  tituloId: z.string().min(1, 'Seleccioná un título'),
});

// ── Gasto schemas ─────────────────────────────────────────────────────────────

// API route body for POST /api/items/[id]/gastos
export const gastoBodySchema = z.object({
  description: z.string().min(1, 'La descripción es requerida').max(500),
  category: z.enum(['MANO_DE_OBRA', 'MATERIAL', 'EQUIPO', 'SUBCONTRATO', 'OTROS']),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Fecha inválida (YYYY-MM-DD)'),
  amount: positiveDecimalString('El monto'),
});

// Form schema (extends body schema with the item selector)
export const gastoFormSchema = gastoBodySchema.extend({
  itemId: z.string().min(1, 'Seleccioná un ítem'),
});

export type TituloFormValues = z.infer<typeof tituloSchema>;
export type ItemFormValues = z.infer<typeof itemSchema>;
export type ItemChangeOrderFormValues = z.infer<typeof itemChangeOrderFormSchema>;
export type AdditionWithNewItemFormValues = z.infer<typeof additionWithNewItemFormSchema>;
export type GastoFormValues = z.infer<typeof gastoFormSchema>;
