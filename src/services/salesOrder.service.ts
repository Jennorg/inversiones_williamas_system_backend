// src/api/services/salesOrder.service.ts
import { db } from '../config/index.js'; // Tu instancia de Drizzle DB (ruta ajustada)
import * as schema from '../config/db.js'; // Tus tablas de esquema Drizzle (ruta ajustada)
import { SalesOrder, SalesOrderInsert, SalesOrderItem as DrizzleSalesOrderItem } from '../config/db.js'; // Tipos inferidos de Drizzle (ruta ajustada)
import { eq } from 'drizzle-orm'; // Para operaciones WHERE
import { z } from 'zod'; // Necesario para inferir tipos de Zod si los usas para items
import { salesOrderItemCreateSchema } from '../schemas/order.js'; // Importa el schema Zod para los ítems de orden de venta

// Define el tipo para los ítems de la orden tal como vienen del frontend (parseados por Zod)
type SalesOrderItemPayload = z.infer<typeof salesOrderItemCreateSchema>;

export async function getAllSalesOrdersFromDb(): Promise<SalesOrder[]> {
  const salesOrders = await db.select().from(schema.salesOrders); // Asume que tienes una tabla 'salesOrders'
  return salesOrders;
}

export async function getSalesOrderByIdFromDb(id: number): Promise<SalesOrder | null> {
  const salesOrder = await db.select().from(schema.salesOrders).where(eq(schema.salesOrders.id, id)).limit(1);
  return salesOrder[0] || null;
}

export async function createSalesOrderInDb(
  salesOrderData: SalesOrderInsert,
  itemsPayload: SalesOrderItemPayload[] // Los ítems vienen como payload de Zod
): Promise<SalesOrder> {
  return db.transaction(async (tx) => {
    // 1. Crear la orden de venta principal
    const newSalesOrder = await tx.insert(schema.salesOrders).values(salesOrderData).returning();
    const createdSalesOrder = newSalesOrder[0];

    // 2. Crear los ítems de la orden de venta
    const orderItemsToInsert = itemsPayload.map(item => ({
      orderId: createdSalesOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtSale: item.unitPriceAtSale,
    }));

    if (orderItemsToInsert.length > 0) {
      await tx.insert(schema.salesOrderItems).values(orderItemsToInsert).execute(); // Asume que tienes una tabla 'salesOrderItems'
    }

    return createdSalesOrder;
  });
}

export async function updateSalesOrderInDb(id: number, salesOrderData: Partial<SalesOrderInsert>): Promise<SalesOrder | null> {
  const updatedSalesOrder = await db.update(schema.salesOrders)
    .set({
      ...salesOrderData,
      updatedAt: new Date().toISOString(), // Asume que tienes un campo updatedAt en tu esquema de Drizzle
    })
    .where(eq(schema.salesOrders.id, id))
    .returning();
  return updatedSalesOrder[0] || null;
}

export async function deleteSalesOrderInDb(id: number): Promise<number> {
  return db.transaction(async (tx) => {
    // 1. Eliminar los ítems de la orden primero
    await tx.delete(schema.salesOrderItems).where(eq(schema.salesOrderItems.orderId, id)).execute(); // Asume que tienes una tabla 'salesOrderItems'

    // 2. Luego, eliminar la orden de venta principal
    const result = await tx.delete(schema.salesOrders).where(eq(schema.salesOrders.id, id)).execute();
    return result.rowsAffected;
  });
}