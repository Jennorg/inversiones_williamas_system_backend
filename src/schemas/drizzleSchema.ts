import { sql } from 'drizzle-orm';
import {
  sqliteTable,    // Para definir una tabla SQLite
  integer,        // Para columnas de números enteros
  text,           // Para columnas de texto (VARCHAR, TEXT)
  real,           // Para columnas de números de punto flotante (FLOAT, REAL)
} from 'drizzle-orm/sqlite-core';

/**
 * Esquema de Drizzle ORM para la tabla 'products'.
 * Define la estructura de la tabla en la base de datos.
 */
export const products = sqliteTable('products', {
  // ID del producto: entero, clave primaria, auto-incrementable (si lo gestiona la DB)
  // Turso (SQLite) puede auto-incrementar PRIMARY KEY INTEGER columns
  id: integer('id').primaryKey(),

  // Nombre del producto: TEXT (string), no nulo
  name: text('name', { length: 100 }).notNull(),

  // Descripción del producto: TEXT, puede ser nulo
  description: text('description', { length: 500 }), // Opcional en Zod, por lo tanto no .notNull()

  // SKU (Stock Keeping Unit): TEXT (string), único, no nulo
  sku: text('sku', { length: 50 }).notNull().unique(), // Agregamos .unique() para asegurar que no se repita

  // Precio: REAL (número con decimales), no nulo
  price: real('price').notNull(),

  // Cantidad en stock: INTEGER, no nulo
  stock: integer('stock').notNull(),

  // Categoría: TEXT, puede ser nulo
  category: text('category'),

  // Proveedor: TEXT, puede ser nulo
  supplier: text('supplier'),

  // Fecha de última actualización: TEXT, puede ser nulo. Usamos TEXT para ISO 8601 strings.
  // Podrías usar `integer('last_updated', { mode: 'timestamp' })` si guardas timestamps UNIX.
  lastUpdated: text('last_updated'),

  // Activo: INTEGER (0 o 1) para booleano en SQLite, no nulo, con un valor por defecto
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true), // This was the corrected part, but if you put primaryKey here, it'd cause the error.
  // Fecha de creación: TEXT (para ISO 8601), no nulo, con valor por defecto generado por la DB
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});

// Tipos inferidos de Drizzle para facilitar el tipado en tu código
// Estos son útiles para cuando insertas o seleccionas datos
export type Product = typeof products.$inferSelect; // Tipo para seleccionar productos (todos los campos)
export type ProductInsert = typeof products.$inferInsert; // Tipo para insertar productos (campos no-DB-generados)