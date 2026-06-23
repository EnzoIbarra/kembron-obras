import { z } from 'zod';

export const createUsuarioSchema = z.object({
  username: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  role: z.enum(['ADMIN', 'SUPERVISOR']),
});

export const updateUsuarioSchema = z
  .object({
    username: z.string().min(2, 'Mínimo 2 caracteres').max(50).optional(),
    role: z.enum(['ADMIN', 'SUPERVISOR']).optional(),
    // Empty string means "no change"; min(6) only enforced when non-empty
    password: z.string().optional(),
  })
  .refine(
    (d) => d.username !== undefined || d.role !== undefined || (d.password && d.password.length > 0),
    { message: 'Al menos un campo debe modificarse' },
  )
  .refine(
    (d) => !d.password || d.password.length === 0 || d.password.length >= 6,
    { message: 'La contraseña debe tener al menos 6 caracteres', path: ['password'] },
  );

export const asignacionesSchema = z.object({
  obraIds: z.array(z.string()),
});

export type CreateUsuarioValues = z.infer<typeof createUsuarioSchema>;
export type UpdateUsuarioValues = z.infer<typeof updateUsuarioSchema>;
export type AsignacionesValues = z.infer<typeof asignacionesSchema>;
