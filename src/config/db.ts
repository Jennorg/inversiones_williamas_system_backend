import { InferSelectModel, InferInsertModel, relations } from 'drizzle-orm';
import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core'; 
export const products = sqliteTable('products', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  sku: text('sku').notNull().unique(),
  unitPrice: real('unit_price').notNull().default(0.00), 
  description: text('description'),
  category: text('category'),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const sedes = sqliteTable('sedes', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    address: text('address'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const customers = sqliteTable('customers', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    email: text('email').unique().notNull(),
    phone: text('phone'),
    address: text('address'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const users = sqliteTable('users', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    username: text('username').unique().notNull(),
    email: text('email').unique().notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role', { enum: ['admin', 'seller', 'warehouse', 'user'] }).default('user').notNull(),
    isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const authTokens = sqliteTable('auth_tokens', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    userId: integer('user_id', { mode: 'number' }).notNull(),
    token: text('token').unique().notNull(),
    tokenType: text('token_type', { enum: ['session', 'password_reset', 'email_verification'] }).notNull(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const suppliers = sqliteTable('suppliers', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    name: text('name').notNull(),
    contactPerson: text('contact_person'),
    phone: text('phone'),
    email: text('email'),
    address: text('address'),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const salesOrders = sqliteTable('sales_orders', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    customerId: integer('customer_id', { mode: 'number' }).notNull(),
    orderDate: text('order_date').default('CURRENT_TIMESTAMP').notNull(),
    totalAmount: real('total_amount').notNull(),
    status: text('status', { enum: ['pending', 'processing', 'completed', 'cancelled'] }).default('pending').notNull(),
    sedeId: integer('sede_id', { mode: 'number' }),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const salesOrderItems = sqliteTable('sales_order_items', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    orderId: integer('order_id', { mode: 'number' }).notNull(),
    productId: integer('product_id', { mode: 'number' }).notNull(),
    quantity: integer('quantity', { mode: 'number' }).notNull(),
    unitPriceAtSale: real('unit_price_at_sale').notNull(),
});
export const purchaseOrders = sqliteTable('purchase_orders', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    supplierId: integer('supplier_id', { mode: 'number' }).notNull(),
    orderDate: text('order_date').default('CURRENT_TIMESTAMP').notNull(),
    expectedDeliveryDate: text('expected_delivery_date'),
    totalAmount: real('total_amount'),
    status: text('status', { enum: ['pending', 'processing', 'ordered', 'received', 'completed', 'cancelled', 'shipped'] }).default('pending').notNull(),
    sedeId: integer('sede_id', { mode: 'number' }),
    createdAt: text('created_at').default('CURRENT_TIMESTAMP').notNull(),
    updatedAt: text('updated_at').default('CURRENT_TIMESTAMP').notNull(),
});
export const purchaseOrderItems = sqliteTable('purchase_order_items', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    orderId: integer('order_id', { mode: 'number' }).notNull(),
    productId: integer('product_id', { mode: 'number' }).notNull(),
    quantity: integer('quantity', { mode: 'number' }).notNull(),
    unitCostAtPurchase: real('unit_cost_at_purchase').notNull(),
});
export const transactionHistory = sqliteTable('transaction_history', { 
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    transactionType: text('transaction_type').notNull(),
    transactionId: integer('transaction_id', { mode: 'number' }),
    entityTable: text('entity_table'),
    userId: integer('user_id', { mode: 'number' }),
    details: text('details'),
    transactionDate: text('transaction_date').default('CURRENT_TIMESTAMP').notNull(),
});
export const sedeProductAssociations = sqliteTable('sede_product_associations', { 
    sedeId: integer('sede_id', { mode: 'number' }).notNull(),
    productId: integer('product_id', { mode: 'number' }).notNull(),
    stockAtSede: integer('stock_at_sede', { mode: 'number' }).default(0).notNull(),
});
export const productsRelations = relations(products, ({ many }) => ({
  salesOrderItems: many(salesOrderItems),
  purchaseOrderItems: many(purchaseOrderItems),
  sedeProductAssociations: many(sedeProductAssociations),
}));
export const sedesRelations = relations(sedes, ({ many }) => ({
  salesOrders: many(salesOrders),
  purchaseOrders: many(purchaseOrders),
  sedeProductAssociations: many(sedeProductAssociations),
}));
export const customersRelations = relations(customers, ({ many }) => ({
  salesOrders: many(salesOrders),
}));
export const usersRelations = relations(users, ({ many }) => ({
  authTokens: many(authTokens),
  transactionHistory: many(transactionHistory),
}));
export const authTokensRelations = relations(authTokens, ({ one }) => ({
  user: one(users, {
    fields: [authTokens.userId],
    references: [users.id],
  }),
}));
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  purchaseOrders: many(purchaseOrders),
}));
export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesOrders.customerId],
    references: [customers.id],
  }),
  sede: one(sedes, {
    fields: [salesOrders.sedeId],
    references: [sedes.id],
  }),
  items: many(salesOrderItems),
}));
export const salesOrderItemsRelations = relations(salesOrderItems, ({ one }) => ({
  salesOrder: one(salesOrders, {
    fields: [salesOrderItems.orderId],
    references: [salesOrders.id],
  }),
  product: one(products, {
    fields: [salesOrderItems.productId],
    references: [products.id],
  }),
}));
export const purchaseOrdersRelations = relations(purchaseOrders, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [purchaseOrders.supplierId],
    references: [suppliers.id],
  }),
  sede: one(sedes, {
    fields: [purchaseOrders.sedeId],
    references: [sedes.id],
  }),
  items: many(purchaseOrderItems),
}));
export const purchaseOrderItemsRelations = relations(purchaseOrderItems, ({ one }) => ({
  purchaseOrder: one(purchaseOrders, {
    fields: [purchaseOrderItems.orderId],
    references: [purchaseOrders.id],
  }),
  product: one(products, {
    fields: [purchaseOrderItems.productId],
    references: [products.id],
  }),
}));
export const transactionHistoryRelations = relations(transactionHistory, ({ one }) => ({
  user: one(users, {
    fields: [transactionHistory.userId],
    references: [users.id],
  }),
}));
export const sedeProductAssociationsRelations = relations(sedeProductAssociations, ({ one }) => ({
  sede: one(sedes, {
    fields: [sedeProductAssociations.sedeId],
    references: [sedes.id],
  }),
  product: one(products, {
    fields: [sedeProductAssociations.productId],
    references: [products.id],
  }),
}));
export type Product = InferSelectModel<typeof products>;
export type ProductInsert = InferInsertModel<typeof products>;
export type Sede = InferSelectModel<typeof sedes>;
export type SedeInsert = InferInsertModel<typeof sedes>;
export type Customer = InferSelectModel<typeof customers>;
export type CustomerInsert = InferInsertModel<typeof customers>;
export type User = InferSelectModel<typeof users>;
export type UserInsert = InferInsertModel<typeof users>;
export type AuthToken = InferSelectModel<typeof authTokens>;
export type AuthTokenInsert = InferInsertModel<typeof authTokens>;
export type Supplier = InferSelectModel<typeof suppliers>;
export type SupplierInsert = InferInsertModel<typeof suppliers>;
export type SalesOrder = InferSelectModel<typeof salesOrders>;
export type SalesOrderInsert = InferInsertModel<typeof salesOrders>;
export type SalesOrderItem = InferSelectModel<typeof salesOrderItems>;
export type SalesOrderItemInsert = InferInsertModel<typeof salesOrderItems>;
export type PurchaseOrder = InferSelectModel<typeof purchaseOrders>;
export type PurchaseOrderInsert = InferInsertModel<typeof purchaseOrders>;
export type PurchaseOrderItem = InferSelectModel<typeof purchaseOrderItems>;
export type PurchaseOrderItemInsert = InferInsertModel<typeof purchaseOrderItems>;
export type TransactionHistory = InferSelectModel<typeof transactionHistory>;
export type TransactionHistoryInsert = InferInsertModel<typeof transactionHistory>;
export type SedeProductAssociation = InferSelectModel<typeof sedeProductAssociations>;
export type SedeProductAssociationInsert = InferInsertModel<typeof sedeProductAssociations>;