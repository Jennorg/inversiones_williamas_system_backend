// src/services/purchaseOrder.service.js
import { db } from '../config/index.js';
import { purchaseOrders } from '../config/db.js';
import { eq, sql, and } from 'drizzle-orm';

import { PurchaseOrder, PurchaseOrderInsert } from '../config/db.js';

/**
 * Obtiene todas las órdenes de compra de la base de datos.
 * @returns {Promise<PurchaseOrder[]>} Un array de objetos de órdenes de compra.
 */
export const getAllPurchaseOrdersFromDb = async () => {
  const allPurchaseOrders: PurchaseOrder[] = await db.select().from(purchaseOrders);
  return allPurchaseOrders;
};

/**
 * Obtiene una orden de compra por su ID.
 * @param {number} id El ID de la orden de compra.
 * @returns {Promise<PurchaseOrder | null>} El objeto de la orden de compra o null si no se encuentra.
 */
export const getPurchaseOrderByIdFromDb = async (id: number) => {
  const purchaseOrder: PurchaseOrder | undefined = await db.select()
    .from(purchaseOrders)
    .where(eq(purchaseOrders.id, id))
    .limit(1)
    .execute()
    .then(rows => rows[0]);
  return purchaseOrder || null;
};

/**
 * Crea una nueva orden de compra en la base de datos.
 * @param {PurchaseOrderInsert} purchaseOrderData Los datos de la orden de compra a insertar.
 * @returns {Promise<PurchaseOrder>} El objeto de la orden de compra recién creada.
 */
export const createPurchaseOrderInDb = async (purchaseOrderData: PurchaseOrderInsert) => {
  const newPurchaseOrder: PurchaseOrder[] = await db.insert(purchaseOrders)
    .values(purchaseOrderData)
    .returning()
    .execute();
  return newPurchaseOrder[0];
};

/**
 * Actualiza una orden de compra existente en la base de datos.
 * @param {number} id El ID de la orden de compra a actualizar.
 * @param {Partial<PurchaseOrderInsert>} updateData Los datos a actualizar.
 * @returns {Promise<PurchaseOrder | null>} El objeto de la orden de compra actualizada o null si no se encuentra.
 */
export const updatePurchaseOrderInDb = async (id: number, updateData: Partial<PurchaseOrderInsert>) => {
  const updatedPurchaseOrder: PurchaseOrder[] = await db.update(purchaseOrders)
    .set(updateData)
    .where(eq(purchaseOrders.id, id))
    .returning()
    .execute();
  return updatedPurchaseOrder[0] || null;
};

/**
 * Elimina una orden de compra de la base de datos.
 * @param {number} id El ID de la orden de compra a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (0 o 1).
 */
export const deletePurchaseOrderFromDb = async (id: number) => {
  const result = await db.delete(purchaseOrders)
    .where(eq(purchaseOrders.id, id))
    .execute(); 

  // --- PASO DE DEPURACIÓN CRUCIAL ---
  // Haz un console.log del 'result' para ver su estructura real en tu terminal
  console.log("Resultado de la operación DELETE de Drizzle para SQLite:", result);

  // --- CORRECCIÓN TEMPORAL ---
  // Dependiendo de tu driver SQLite (ej. drizzle-orm/libsql), la propiedad para las filas afectadas
  // podría ser 'rowsAffected', 'changes', o incluso otra.
  // Aquí intentamos un cast a 'any' para ver si tiene 'changes' o 'rowsAffected'.
  // Después de ver el console.log, podrás reemplazar esto con la propiedad exacta.
  
  // Por ejemplo, si console.log muestra { rowsAffected: 1 }, entonces usa (result as any).rowsAffected
  // Si muestra { changes: 1 }, entonces usa (result as any).changes
  
  // Si ninguna de las dos funciona, consulta el console.log y usa la propiedad correcta.
  return (result as any).changes || (result as any).rowsAffected || 0; 
};