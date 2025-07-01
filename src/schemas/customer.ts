// src/schemas/customer.js
import { z } from 'zod';

export const customerCreateSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."), // <--- CAMBIO AQUÍ
  lastName: z.string().min(1, "El apellido es requerido."), // <--- CAMBIO AQUÍ
  email: z.string().email("Formato de email inválido.").min(1, "El email es requerido."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  // rfc: z.string().optional().nullable(), // <--- ELIMINADO/COMENTADO, si no existe en DB/Drizzle
});

export const customerSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string(), // <--- CAMBIO AQUÍ
  lastName: z.string(), // <--- CAMBIO AQUÍ
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  // rfc: z.string().nullable(), // <--- ELIMINADO/COMENTADO, si no existe en DB/Drizzle
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const customerUpdateSchema = customerCreateSchema.partial();