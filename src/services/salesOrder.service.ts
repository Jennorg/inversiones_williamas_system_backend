import { db } from '../config/index.js'; 
import * as schema from '../config/db.js'; 
import { SalesOrder, SalesOrderInsert, SalesOrderItem as DrizzleSalesOrderItem } from '../config/db.js'; 
import { eq } from 'drizzle-orm'; 
import { z } from 'zod'; 
import { salesOrderItemCreateSchema } from '../schemas/order.js'; 
type SalesOrderItemPayload = z.infer<typeof salesOrderItemCreateSchema>;
export async function getAllSalesOrdersFromDb(): Promise<SalesOrder[]> {
  const salesOrders = await db.select().from(schema.salesOrders); 
  return salesOrders;
}
export async function getSalesOrderByIdFromDb(id: number): Promise<SalesOrder | null> {
  const salesOrder = await db.select().from(schema.salesOrders).where(eq(schema.salesOrders.id, id)).limit(1);
  return salesOrder[0] || null;
}
export async function createSalesOrderInDb(
  salesOrderData: SalesOrderInsert,
  itemsPayload: SalesOrderItemPayload[] 
): Promise<SalesOrder> {
  return db.transaction(async (tx) => {
    const newSalesOrder = await tx.insert(schema.salesOrders).values(salesOrderData).returning();
    const createdSalesOrder = newSalesOrder[0];
    const orderItemsToInsert = itemsPayload.map(item => ({
      orderId: createdSalesOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPriceAtSale: item.unitPriceAtSale,
    }));
    if (orderItemsToInsert.length > 0) {
      await tx.insert(schema.salesOrderItems).values(orderItemsToInsert).execute(); 
    }
    return createdSalesOrder;
  });
}
export async function updateSalesOrderInDb(id: number, salesOrderData: Partial<SalesOrderInsert>): Promise<SalesOrder | null> {
  const updatedSalesOrder = await db.update(schema.salesOrders)
    .set({
      ...salesOrderData,
      updatedAt: new Date().toISOString(), 
    })
    .where(eq(schema.salesOrders.id, id))
    .returning();
  return updatedSalesOrder[0] || null;
}
export async function deleteSalesOrderInDb(id: number): Promise<number> {
  return db.transaction(async (tx) => {
    await tx.delete(schema.salesOrderItems).where(eq(schema.salesOrderItems.orderId, id)).execute(); 
    const result = await tx.delete(schema.salesOrders).where(eq(schema.salesOrders.id, id)).execute();
    return result.rowsAffected;
  });
}