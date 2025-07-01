import { z } from 'zod';
import { timestampsSchema, dateSchema } from './base.js';
import { productSchema } from './product.js'; 
export const salesOrderItemCreateSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive("La cantidad debe ser un número positivo."),
  unitPriceAtSale: z.number().positive("El precio de venta debe ser un número positivo."),
});
export const salesOrderCreateSchema = z.object({
  customerId: z.number().int().positive("El ID del cliente es requerido."),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']).default('pending'),
  sedeId: z.number().int().positive().optional(),
  items: z.array(salesOrderItemCreateSchema).min(1, "Una orden de venta debe tener al menos un ítem."),
});
export const salesOrderUpdateSchema = salesOrderCreateSchema.partial();
export const salesOrderItemSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitPriceAtSale: z.number().positive(),
  product: productSchema.partial().optional(), 
});
export const salesOrderSchema = z.object({
  id: z.number().int().positive(),
  customerId: z.number().int().positive(),
  orderDate: dateSchema,
  totalAmount: z.number().positive(),
  status: z.enum(['pending', 'processing', 'completed', 'cancelled']),
  sedeId: z.number().int().positive().optional().nullable(),
  customer: z.object({ id: z.number(), firstName: z.string(), lastName: z.string() }).optional(),
  sede: z.object({ id: z.number(), name: z.string() }).optional(),
  items: z.array(salesOrderItemSchema).optional(),
}).merge(timestampsSchema);
export const purchaseOrderItemCreateSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().positive("La cantidad debe ser un número positivo."),
  unitCostAtPurchase: z.number().positive("El costo de compra debe ser un número positivo."),
});
export const purchaseOrderCreateSchema = z.object({
  supplierId: z.number().int().positive("El ID del proveedor es requerido."),
  expectedDeliveryDate: dateSchema.optional(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']).default('pending'),
  sedeId: z.number().int().positive().optional(),
  items: z.array(purchaseOrderItemCreateSchema).min(1, "Una orden de compra debe tener al menos un ítem."),
});
export const purchaseOrderUpdateSchema = purchaseOrderCreateSchema.partial();
export const purchaseOrderItemSchema = z.object({
  id: z.number().int().positive(),
  orderId: z.number().int().positive(),
  productId: z.number().int().positive(),
  quantity: z.number().int().positive(),
  unitCostAtPurchase: z.number().positive(),
  product: productSchema.partial().optional(), 
});
export const purchaseOrderSchema = z.object({
  id: z.number().int().positive(),
  supplierId: z.number().int().positive(),
  orderDate: dateSchema,
  expectedDeliveryDate: dateSchema.optional().nullable(),
  totalAmount: z.number().positive().optional().nullable(),
  status: z.enum(['pending', 'ordered', 'received', 'cancelled']),
  sedeId: z.number().int().positive().optional().nullable(),
  supplier: z.object({ id: z.number(), name: z.string() }).optional(),
  sede: z.object({ id: z.number(), name: z.string() }).optional(),
  items: z.array(purchaseOrderItemSchema).optional(),
}).merge(timestampsSchema);