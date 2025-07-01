import { z } from 'zod';

// Esquema para validar datos al crear un nuevo cliente
export const customerCreateSchema = z.object({
  firstName: z.string().min(1, "El nombre es requerido."), 
  lastName: z.string().min(1, "El apellido es requerido."), 
  email: z.string().email("Formato de email inválido.").min(1, "El email es requerido."),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

// Esquema completo para un cliente (incluye campos generados por la DB)
export const customerSchema = z.object({
  id: z.number().int().positive(),
  firstName: z.string(), 
  lastName: z.string(), 
  email: z.string().email(),
  phone: z.string().nullable(),
  address: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

// Esquema para validar datos al actualizar un cliente (todos los campos opcionales)
export const customerUpdateSchema = customerCreateSchema.partial();