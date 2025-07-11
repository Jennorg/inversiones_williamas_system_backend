import { z } from 'zod';

// Esquema para validar datos al crear un nuevo producto
export const productCreateSchema = z.object({
  name: z.string().min(1, "El nombre del producto es requerido."),
  sku: z.string().min(1, "El SKU del producto es requerido.").max(50, "El SKU no debe exceder los 50 caracteres."),
  price: z.number().positive("El precio debe ser un número positivo.").min(0.01, "El precio mínimo es 0.01"),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  sedeId: z.number().int().positive("El ID de la sede es requerido y debe ser un número positivo."), 
  initialStockAtSede: z.number().int().min(0, "El stock inicial en la sede no puede ser negativo."), 
});

// Esquema completo para un producto (incluye campos generados por la DB)
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

// Esquema para validar datos al actualizar un producto (todos los campos opcionales)
export const productUpdateSchema = productCreateSchema.partial();