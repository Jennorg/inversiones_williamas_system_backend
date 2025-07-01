import { z } from 'zod';

export const dateSchema = z.preprocess((arg) => {
  if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  return arg;
}, z.date());

export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

export const timestampsSchema = z.object({
  createdAt: dateSchema.optional(), // Creado por la DB, opcional en inputs
  updatedAt: dateSchema.optional(), // Actualizado por la DB, opcional en inputs
});

export const idParamsSchema = z.object({
  id: z.coerce.number().int().positive("El ID debe ser un número entero positivo."),
});