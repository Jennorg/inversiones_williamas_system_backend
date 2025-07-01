// src/schemas/sede.ts
import { z } from 'zod';

// Esquema para la creación de una sede
export const sedeCreateSchema = z.object({
  name: z.string()
    .min(1, "El nombre de la sede es requerido")
    .max(100, "El nombre de la sede no puede exceder los 100 caracteres"),
  address: z.string()
    .max(255, "La dirección no puede exceder los 255 caracteres")
    .optional(), // Opcional, dependiendo de si la dirección es siempre obligatoria
});

// Esquema para la actualización de una sede (todos los campos son opcionales)
// Usamos .partial() para hacer que todas las propiedades de sedeCreateSchema sean opcionales.
export const sedeUpdateSchema = sedeCreateSchema.partial();

// Si necesitas un esquema de actualización más específico (por ejemplo, con validaciones diferentes),
// puedes definirlo explícitamente así:
/*
export const sedeUpdateSchema = z.object({
  name: z.string().min(1, "El nombre de la sede es requerido").max(100, "El nombre de la sede no puede exceder los 100 caracteres").optional(),
  address: z.string().max(255, "La dirección no puede exceder los 255 caracteres").optional(),
  phone: z.string().regex(/^\d{7,15}$/, "Formato de número de teléfono inválido (7 a 15 dígitos)").optional(),
  email: z.string().email("Formato de correo electrónico inválido").optional(),
});
*/