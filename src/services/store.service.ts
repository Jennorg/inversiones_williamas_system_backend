import { db } from '../config/index.js'; // Importa tu instancia de Drizzle db desde la configuración
import { products, Product, ProductInsert } from '../schemas/drizzleSchema.js';
import { eq } from 'drizzle-orm'; // Importa el operador 'eq' para condiciones WHERE

/**
 * @desc Obtiene todos los productos de la base de datos.
 * @returns {Promise<Product[]>} Un array de objetos Product.
 */
export async function getAllProductsFromDb(): Promise<Product[]> {
  try {
    const allProducts = await db.select().from(products);
    return allProducts;
  } catch (error: any) {
    console.error("Error retrieving all products from database:", error.message);
    throw new Error("Could not retrieve products from the database.");
  }
}

/**
 * @desc Obtiene un producto por su ID de la base de datos.
 * @param {number} id El ID numérico del producto.
 * @returns {Promise<Product | null>} El objeto Product si se encuentra, de lo contrario null.
 */
export async function getProductByIdFromDb(id: number): Promise<Product | null> {
  try {
    // Busca un producto donde el 'id' de la tabla sea igual al 'id' proporcionado
    const product = await db.select().from(products).where(eq(products.id, id)).limit(1);
    return product.length > 0 ? product[0] : null;
  } catch (error: any) {
    console.error(`Error retrieving product with ID ${id} from database:`, error.message);
    throw new Error(`Could not retrieve product with ID ${id} from the database.`);
  }
}

/**
 * @desc Crea un nuevo producto en la base de datos.
 * @param {ProductInsert} productData Los datos del producto a insertar.
 * @returns {Promise<Product>} El producto recién creado con su ID.
 */
export async function createProductInDb(productData: ProductInsert): Promise<Product> {
  try {
    // Inserta los datos del producto y usa .returning() para obtener el producto insertado
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

/**
 * @desc Actualiza un producto existente en la base de datos.
 * @param {number} id El ID del producto a actualizar.
 * @param {Partial<ProductInsert>} updateData Los campos a actualizar del producto.
 * @returns {Promise<Product | null>} El producto actualizado si se encuentra, de lo contrario null.
 */
export async function updateProductInDb(id: number, updateData: Partial<ProductInsert>): Promise<Product | null> {
  try {
    // Actualiza el producto donde el 'id' coincida y retorna el producto actualizado
    const updatedProduct = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return updatedProduct.length > 0 ? updatedProduct[0] : null;
  } catch (error: any) {
    console.error(`Error updating product with ID ${id} in database:`, error.message);
    throw new Error(`Could not update product with ID ${id} in the database.`);
  }
}

/**
 * @desc Elimina un producto de la base de datos.
 * @param {number} id El ID del producto a eliminar.
 * @returns {Promise<number>} El número de filas eliminadas (0 si no se encontró el producto).
 */
export async function deleteProductFromDb(id: number): Promise<number> { // <-- Ensure `export` is here
  try {
    const result = await db.delete(products).where(eq(products.id, id)).returning({ deletedId: products.id });
    return result.length > 0 ? 1 : 0;
  } catch (error: any) {
    console.error(`Error deleting product with ID ${id} from database:`, error.message);
    throw new Error(`Could not delete product with ID ${id} from the database.`);
  }
}