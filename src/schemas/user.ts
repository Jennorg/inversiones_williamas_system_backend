import { z } from 'zod';
const baseUserSchema = z.object({
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario debe tener como máximo 50 caracteres")
    .optional(), 
  email: z.string().email("Formato de email inválido").optional(),
  role: z.enum(['admin', 'seller', 'warehouse', 'user'])
    .default('user')
    .optional(), 
  isActive: z.boolean().default(true).optional(), 
});
export const userCreateSchema = baseUserSchema.extend({
  username: z.string()
    .min(3, "El nombre de usuario es requerido y debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario debe tener como máximo 50 caracteres"),
  email: z.string().email("El email es requerido y debe tener un formato válido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  role: z.enum(['admin', 'seller', 'warehouse', 'user']).default('user').optional(),
  isActive: z.boolean().default(true).optional(),
});
export const userUpdateSchema = baseUserSchema.extend({
  username: baseUserSchema.shape.username.optional(), 
  email: baseUserSchema.shape.email.optional(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional(), 
});
export const userLoginSchema = z.object({
  identifier: z.string()
    .min(1, "El nombre de usuario o email es requerido"),
  password: z.string()
    .min(1, "La contraseña es requerida"),
});
