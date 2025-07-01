import { z } from 'zod';

export interface SedeProductAssociation {
  sedeId: number;
  productId: number;
  stockAtSede: number;
}

export const createSedeProductAssociationSchema = z.object({
  sede_id: z.number().int().positive("El ID de la sede es requerido y debe ser un número positivo."),
  product_id: z.number().int().positive("El ID del producto es requerido y debe ser un número positivo."),
  stock_at_sede: z.number().int().min(0, "El stock en la sede no puede ser negativo."),
});