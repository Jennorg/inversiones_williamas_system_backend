import { db } from '../config/index.js'; // Ajusta la ruta a tu instancia de Drizzle DB
import * as schema from '../config/db.js'; // Ajusta la ruta a tu esquema Drizzle

// Importar los tipos inferidos de Drizzle
import { Product, ProductInsert } from '../config/db.js'; // CAMBIA ESTO a la ruta real de tus tipos inferidos
import { eq } from 'drizzle-orm'; // Para condiciones WHERE

/**
 * Obtiene todos los productos de la base de datos.
 * @returns {Promise<Product[]>} Una promesa que resuelve con un array de productos.
 */
export async function getAllProductsFromDb(): Promise<Product[]> {
  const products = await db.select().from(schema.products);
  return products;
}

/**
 * Obtiene un producto por su ID.
 * @param {number} id El ID del producto.
 * @returns {Promise<Product | null>} Una promesa que resuelve con el producto o null si no se encuentra.
 */
export async function getProductByIdFromDb(id: number): Promise<Product | null> {
  const product = await db.select().from(schema.products).where(eq(schema.products.id, id)).limit(1);
  return product[0] || null;
}

/**
 * Crea un nuevo producto en la base de datos.
 * @param {ProductInsert} productData Los datos del producto a crear.
 * @returns {Promise<Product>} Una promesa que resuelve con el producto creado.
 */
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

/**
 * Actualiza un producto existente por su ID.
 * @param {number} id El ID del producto a actualizar.
 * @param {Partial<ProductInsert>} productData Los datos parciales del producto a actualizar.
 * @returns {Promise<Product | null>} Una promesa que resuelve con el producto actualizado o null si no se encuentra.
 */
export async function updateProductInDb(id: number, productData: Partial<ProductInsert>): Promise<Product | null> {
  const updatedProduct = await db.update(schema.products).set(productData).where(eq(schema.products.id, id)).returning();
  return updatedProduct[0] || null;
}

/**
 * Elimina un producto por su ID.
 * @param {number} id El ID del producto a eliminar.
 * @returns {Promise<number>} Una promesa que resuelve con el número de filas eliminadas (0 o 1).
 */
export async function deleteProductFromDb(id: number): Promise<number> {
  const result = await db.delete(schema.products).where(eq(schema.products.id, id)).returning({ id: schema.products.id });
  return result.length > 0 ? 1 : 0;
}