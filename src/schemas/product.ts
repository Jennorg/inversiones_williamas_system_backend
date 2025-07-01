import { z } from 'zod';

export const productCreateSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido."),
  sku: z.string().min(1, "El SKU del producto es requerido.").max(50, "El SKU no debe exceder los 50 caracteres."),
  price: z.number().positive("El precio debe ser un número positivo.").min(0.01, "El precio mínimo es 0.01"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  // --- CAMPOS NUEVOS PARA LA ASOCIACIÓN INICIAL CON SEDE ---
  sedeId: z.number().int().positive("El ID de la sede es requerido y debe ser un número positivo."), // O 'sede_id' si es lo que usas
  initialStockAtSede: z.number().int().min(0, "El stock inicial en la sede no puede ser negativo."), // O 'stock_at_sede'
});

export const productSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  sku: z.string(),
  price: z.number(),
  description: z.string().nullable(),
  category: z.string().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const productUpdateSchema = productCreateSchema.partial();