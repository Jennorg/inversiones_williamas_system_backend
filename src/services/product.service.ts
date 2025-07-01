import { db } from '../config/index.js'; 
import * as schema from '../config/db.js'; 
import { Product, ProductInsert } from '../config/db.js'; 
import { eq } from 'drizzle-orm'; 
export async function getAllProductsFromDb(): Promise<Product[]> {
  const products = await db.select().from(schema.products);
  return products;
}
export async function getProductByIdFromDb(id: number): Promise<Product | null> {
  const product = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  return product[0] || null;
}
export async function createProductInDb(productData: ProductInsert): Promise<Product> {
  const { createdAt, updatedAt, ...dataToInsert } = productData;
  const maxIdResult = await db.get(`SELECT MAX(id) as maxId FROM products`) as { maxId: number | null | undefined };
  const maxId = Number(maxIdResult?.maxId) || 0;
  const newId = maxId + 1;
  const now = new Date().toISOString();
  if ('createdAt' in dataToInsert || 'created_at' in dataToInsert || 'updatedAt' in dataToInsert) {
    console.warn('⚠️ El objeto a insertar contiene campos de fecha:', dataToInsert);
  }
  console.log('Insertando en products:', { ...dataToInsert, id: newId, createdAt: now, updatedAt: now });
  const newProduct = await db.insert(schema.products).values({ ...dataToInsert, id: newId, createdAt: now, updatedAt: now }).returning();
  return newProduct[0];
}
export async function updateProductInDb(id: number, productData: Partial<ProductInsert>): Promise<Product | null> {
  const updatedProduct = await db.update(schema.products).set(productData).where(eq(schema.products.id, id)).returning();
  return updatedProduct[0] || null;
}
export async function deleteProductFromDb(id: number): Promise<number> {
  const result = await db.delete(schema.products).where(eq(schema.products.id, id)).returning({ id: schema.products.id });
  return result.length > 0 ? 1 : 0;
}