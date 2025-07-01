import { db } from '../config/index.js';
import * as schema from '../config/db.js';
import { InferSelectModel, InferInsertModel, eq } from 'drizzle-orm';

type Supplier = InferSelectModel<typeof schema.suppliers>;
type SupplierInsert = InferInsertModel<typeof schema.suppliers>;

export async function getAllSuppliersFromDb(): Promise<Supplier[]> {
  const suppliers = await db.select().from(schema.suppliers);
  return suppliers;
}

export async function getSupplierByIdFromDb(id: number): Promise<Supplier | null> {
  const supplier = await db.select().from(schema.suppliers).where(eq(schema.suppliers.id, id)).limit(1);
  return supplier[0] || null;
}

export async function createSupplierInDb(supplierData: SupplierInsert): Promise<Supplier> {
  const newSupplier = await db.insert(schema.suppliers).values(supplierData).returning();
  return newSupplier[0];
}

export async function updateSupplierInDb(id: number, supplierData: Partial<SupplierInsert>): Promise<Supplier | null> {
  const updatedSupplier = await db.update(schema.suppliers).set(supplierData).where(eq(schema.suppliers.id, id)).returning();
  return updatedSupplier[0] || null;
}

export async function deleteSupplierFromDb(id: number): Promise<number> {
  const result = await db.delete(schema.suppliers).where(eq(schema.suppliers.id, id)).returning({ id: schema.suppliers.id });
  return result.length > 0 ? 1 : 0;
}