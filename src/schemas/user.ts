import { z } from 'zod';

// Esquema base para propiedades de usuario comunes
const baseUserSchema = z.object({
  username: z.string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario debe tener como máximo 50 caracteres")
    .optional(), // Hacemos opcional aquí y lo manejamos en .extend() para create/update
  email: z.string().email("Formato de email inválido").optional(),
  role: z.enum(['admin', 'seller', 'warehouse', 'user'])
    .default('user')
    .optional(), // Opción por defecto 'user'
  isActive: z.boolean().default(true).optional(), // Es un booleano y por defecto true, opcional en Zod
});

// Esquema para la creación de un usuario (contraseña requerida)
export const userCreateSchema = baseUserSchema.extend({
  username: z.string()
    .min(3, "El nombre de usuario es requerido y debe tener al menos 3 caracteres")
    .max(50, "El nombre de usuario debe tener como máximo 50 caracteres"),
  email: z.string().email("El email es requerido y debe tener un formato válido"),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres"),
  // role y isActive pueden ser opcionales aquí si quieres que tomen el default
  role: z.enum(['admin', 'seller', 'warehouse', 'user']).default('user').optional(),
  isActive: z.boolean().default(true).optional(),
});

// Esquema para la actualización de un usuario (todos los campos son opcionales)
export const userUpdateSchema = baseUserSchema.extend({
  username: baseUserSchema.shape.username.optional(), // Asegurar que sea opcional para actualización
  email: baseUserSchema.shape.email.optional(),
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .optional(), // Contraseña es opcional para actualizar
});

// Esquema para el inicio de sesión (puede ser username o email)
export const userLoginSchema = z.object({
  identifier: z.string()
    .min(1, "El nombre de usuario o email es requerido"),
  password: z.string()
    .min(1, "La contraseña es requerida"),
});

// Puedes añadir otros esquemas Zod relacionados con usuarios aquí