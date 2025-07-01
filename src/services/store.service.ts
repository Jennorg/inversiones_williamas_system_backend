import { db } from '../config/index.js'; 
import { products, Product, ProductInsert } from '../schemas/drizzleSchema.js';
import { eq } from 'drizzle-orm'; 
export async function getAllProductsFromDb(): Promise<Product[]> {
  try {
    const allProducts = await db.select().from(products);
    return allProducts;
  } catch (error: any) {
    console.error("Error retrieving all products from database:", error.message);
    throw new Error("Could not retrieve products from the database.");
  }
}
export async function getProductByIdFromDb(id: number): Promise<Product | null> {
  try {
    const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product.length > 0 ? product[0] : null;
  } catch (error: any) {
    console.error(`Error retrieving product with ID ${id} from database:`, error.message);
    throw new Error(`Could not retrieve product with ID ${id} from the database.`);
  }
}
export async function createProductInDb(productData: ProductInsert): Promise<Product> {
  try {
    const newProduct = await db.insert(products).values(productData).returning();
    if (newProduct.length === 0) {
        throw new Error("Failed to create product: No data returned after insertion.");
    }
    return newProduct[0];
  } catch (error: any) {
    console.error("Error creating product in database:", error.message);
    throw new Error("Could not create product in the database.");
  }
}
export async function updateProductInDb(id: number, updateData: Partial<ProductInsert>): Promise<Product | null> {
  try {
    const updatedProduct = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return updatedProduct.length > 0 ? updatedProduct[0] : null;
  } catch (error: any) {
    console.error(`Error updating product with ID ${id} in database:`, error.message);
    throw new Error(`Could not update product with ID ${id} in the database.`);
  }
}
export async function deleteProductFromDb(id: number): Promise<number> { 
  try {
    const result = await db.delete(products).where(eq(products.id, id)).returning({ deletedId: products.id });
    return result.length > 0 ? 1 : 0;
  } catch (error: any) {
    console.error(`Error deleting product with ID ${id} from database:`, error.message);
    throw new Error(`Could not delete product with ID ${id} from the database.`);
  }
}