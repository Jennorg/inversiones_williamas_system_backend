import { z } from 'zod';

// Esquema para procesar y validar fechas desde strings o objetos Date
export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

// Interfaz para timestamps comunes en todas las entidades
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

// Esquema para timestamps opcionales en inputs de usuario
export const timestampsSchema = z.object({
  createdAt: dateSchema.optional(),
  updatedAt: dateSchema.optional(),
});

// Esquema para validar parámetros de ID en URLs
export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número entero positivo."),
});