import { db } from '../config/index.js';
import * as schema from '../config/db.js';
import { InferSelectModel, InferInsertModel, eq, or } from 'drizzle-orm';
type User = InferSelectModel<typeof schema.users>;
type UserInsert = InferInsertModel<typeof schema.users>;
export async function getAllUsersFromDb(): Promise<User[]> {
  const users = await db.select().from(schema.users);
  return users;
}
export async function getUserByIdFromDb(id: number): Promise<User | null> {
  const user = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
  return user[0] || null;
}
export async function getUserByUsernameOrEmailFromDb(identifier: string): Promise<User | null> {
    const user = await db.select().from(schema.users).where(
        or(eq(schema.users.username, identifier), eq(schema.users.email, identifier))
    ).limit(1);
    return user[0] || null;
}
export async function createUserInDb(userData: UserInsert): Promise<User> {
  const newUser = await db.insert(schema.users).values(userData).returning();
  return newUser[0];
}
export async function updateUserInDb(id: number, userData: Partial<UserInsert>): Promise<User | null> {
  const updatedUser = await db.update(schema.users).set(userData).where(eq(schema.users.id, id)).returning();
  return updatedUser[0] || null;
}
export async function deleteUserFromDb(id: number): Promise<number> {
  const result = await db.delete(schema.users).where(eq(schema.users.id, id)).returning({ id: schema.users.id });
  return result.length > 0 ? 1 : 0;
}