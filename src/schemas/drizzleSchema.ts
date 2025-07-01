import { sql } from 'drizzle-orm';
import {
  sqliteTable,    
  integer,        
  text,           
  real,           
} from 'drizzle-orm/sqlite-core';
export const products = sqliteTable('products', {
  id: integer('id').primaryKey(),
  name: text('name', { length: 100 }).notNull(),
  description: text('description', { length: 500 }), 
  sku: text('sku', { length: 50 }).notNull().unique(), 
  price: real('price').notNull(),
  stock: integer('stock').notNull(),
  category: text('category'),
  supplier: text('supplier'),
  lastUpdated: text('last_updated'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true), 
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
});
export type Product = typeof products.$inferSelect; 
export type ProductInsert = typeof products.$inferInsert; 