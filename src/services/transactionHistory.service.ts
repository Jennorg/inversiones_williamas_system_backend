import { db } from '../config/index.js';
import * as schema from '../config/db.js';
import { InferSelectModel, InferInsertModel, eq } from 'drizzle-orm';
type TransactionHistory = InferSelectModel<typeof schema.transactionHistory>;
type TransactionHistoryInsert = InferInsertModel<typeof schema.transactionHistory>;
export async function getAllTransactionHistoryFromDb(): Promise<TransactionHistory[]> {
  const history = await db.select().from(schema.transactionHistory);
  return history;
}
export async function getTransactionHistoryByIdFromDb(id: number): Promise<TransactionHistory | null> {
  const entry = await db.select().from(schema.transactionHistory).where(eq(schema.transactionHistory.id, id)).limit(1);
  return entry[0] || null;
}
export async function createTransactionHistoryInDb(historyData: TransactionHistoryInsert): Promise<TransactionHistory> {
  const newEntry = await db.insert(schema.transactionHistory).values(historyData).returning();
  return newEntry[0];
}
