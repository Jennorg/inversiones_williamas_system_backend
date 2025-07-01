import { db } from '../config/index.js';
import * as schema from '../config/db.js';
import { InferSelectModel, InferInsertModel, eq } from 'drizzle-orm';
type Customer = InferSelectModel<typeof schema.customers>;
type CustomerInsert = InferInsertModel<typeof schema.customers>;
export async function getAllCustomersFromDb(): Promise<Customer[]> {
  const customers = await db.select().from(schema.customers);
  return customers;
}
export async function getCustomerByIdFromDb(id: number): Promise<Customer | null> {
  const customer = await db.select().from(schema.customers).where(eq(schema.customers.id, id)).limit(1);
  return customer[0] || null;
}
export async function createCustomerInDb(customerData: CustomerInsert): Promise<Customer> {
  const newCustomer = await db.insert(schema.customers).values(customerData).returning();
  return newCustomer[0];
}
export async function updateCustomerInDb(id: number, customerData: Partial<CustomerInsert>): Promise<Customer | null> {
  const updatedCustomer = await db.update(schema.customers).set(customerData).where(eq(schema.customers.id, id)).returning();
  return updatedCustomer[0] || null;
}
export async function deleteCustomerFromDb(id: number): Promise<number> {
  const result = await db.delete(schema.customers).where(eq(schema.customers.id, id)).returning({ id: schema.customers.id });
  return result.length > 0 ? 1 : 0;
}