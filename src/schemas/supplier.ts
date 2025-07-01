import { z } from 'zod';
import { timestampsSchema } from './base.js';
export interface Supplier {
  id: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
export const supplierCreateSchema = z.object({
  name: z.string().min(3, "El nombre del proveedor es requerido."),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Formato de correo electrónico inválido.").optional(),
  address: z.string().optional(),
});
export const supplierUpdateSchema = supplierCreateSchema.partial();
export const supplierSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  contactPerson: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().optional().nullable(),
}).merge(timestampsSchema);