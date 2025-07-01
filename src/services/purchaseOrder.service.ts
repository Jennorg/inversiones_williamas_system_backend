import { db } from '../config/index.js';
import { purchaseOrders } from '../config/db.js';
import { eq, sql, and } from 'drizzle-orm';
import { PurchaseOrder, PurchaseOrderInsert } from '../config/db.js';
export const getAllPurchaseOrdersFromDb = async () => {
  const allPurchaseOrders: PurchaseOrder[] = await db.select().from(purchaseOrders);
  return allPurchaseOrders;
};
export const getPurchaseOrderByIdFromDb = async (id: number) => {
  const purchaseOrder: PurchaseOrder | undefined = await db.select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, id))
    .limit(1)
    .execute()
    .then(rows => rows[0]);
  return purchaseOrder || null;
};
export const createPurchaseOrderInDb = async (purchaseOrderData: PurchaseOrderInsert) => {
  const newPurchaseOrder: PurchaseOrder[] = await db.insert(purchaseOrders)
    .values(purchaseOrderData)
    .returning()
    .execute();
  return newPurchaseOrder[0];
};
export const updatePurchaseOrderInDb = async (id: number, updateData: Partial<PurchaseOrderInsert>) => {
  const updatedPurchaseOrder: PurchaseOrder[] = await db.update(purchaseOrders)
    .set(updateData)
    .where(eq(purchaseOrders.id, id))
    .returning()
    .execute();
  return updatedPurchaseOrder[0] || null;
};
export const deletePurchaseOrderFromDb = async (id: number) => {
  const result = await db.delete(purchaseOrders)
    .where(eq(purchaseOrders.id, id))
    .execute(); 
  console.log("Resultado de la operación DELETE de Drizzle para SQLite:", result);
  return (result as any).changes || (result as any).rowsAffected || 0; 
};