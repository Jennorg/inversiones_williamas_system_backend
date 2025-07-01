// src/schemas/purchaseOrder.js
import { z } from 'zod';

export const purchaseOrderCreateSchema = z.object({
  // CAMBIO AQUÍ: customerId A supplierId
  supplierId: z.number().int().positive("El ID del proveedor debe ser un número positivo."),
  orderDate: z.string().datetime("La fecha de orden debe ser una fecha y hora válida.").optional(), // Podría ser generado por la DB
  totalAmount: z.number().positive("El monto total debe ser positivo.").default(0), // Podría calcularse en el servicio
  status: z.enum(['pending', 'processing', 'ordered', 'received', 'completed', 'cancelled', 'shipped']).default('pending'),
});

export const purchaseOrderSchema = z.object({
  id: z.number().int().positive(),
  // CAMBIO AQUÍ: customerId A supplierId
  supplierId: z.number().int().positive(),
  orderDate: z.date(),
  totalAmount: z.number(),
  status: z.enum(['pending', 'processing', 'ordered', 'received', 'completed', 'cancelled', 'shipped']),
  createdAt: z.date(),
  updatedAt: z.date().nullable(),
});

export const purchaseOrderUpdateSchema = purchaseOrderCreateSchema.partial();