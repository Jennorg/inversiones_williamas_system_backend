import { db } from '../config/index.js';
import * as schema from '../config/db.js'; 
import { Sede, SedeInsert } from '../config/db.js'; 
import { eq } from 'drizzle-orm'; 
export async function getAllSedesFromDb(): Promise<Sede[]> {
  const sedes = await db.select().from(schema.sedes);
  return sedes;
}
export async function getSedeByIdFromDb(id: number): Promise<Sede | null> {
  const sede = await db.select().from(schema.sedes).where(eq(schema.sedes.id, id)).limit(1);
  return sede[0] || null;
}
export async function createSedeInDb(sedeData: SedeInsert): Promise<Sede> {
  const newSede = await db.insert(schema.sedes).values(sedeData).returning();
  return newSede[0];
}
export async function updateSedeInDb(id: number, sedeData: Partial<SedeInsert>): Promise<Sede | null> {
  const updatedSede = await db.update(schema.sedes)
    .set({
      ...sedeData,
      updatedAt: new Date().toISOString(), 
    })
    .where(eq(schema.sedes.id, id))
    .returning();
  return updatedSede[0] || null;
}
export async function deleteSedeInDb(id: number): Promise<number> {
  const result = await db.delete(schema.sedes).where(eq(schema.sedes.id, id)).execute();
  return result.rowsAffected; 
}