import { z } from 'zod';

// Esquema para validar datos al crear una nueva sede
export const sedeCreateSchema = z.object({
  name: z.string()
    .min(1, "El nombre de la sede es requerido")
    .max(100, "El nombre de la sede no puede exceder los 100 caracteres"),
  address: z.string()
    .max(255, "La dirección no puede exceder los 255 caracteres")
    .optional(), 
});

// Esquema para validar datos al actualizar una sede (todos los campos opcionales)
export const sedeUpdateSchema = sedeCreateSchema.partial();
