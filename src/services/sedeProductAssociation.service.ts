import { db } from '../config/index.js';
import { sedeProductAssociations } from '../config/db.js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../config/db.js';

// Interfaz para crear una nueva asociación sede-producto
interface CreateSedeProductAssociationPayload {
  sedeId: number;
  productId: number;
  stockAtSede: number;
}

// Interfaz para representar una asociación sede-producto
interface SedeProductAssociation {
  sedeId: number;
  productId: number;
  stockAtSede: number;
}

// Crear una nueva asociación entre una sede y un producto en la base de datos
export const createSedeProductAssociationInDb = async (
  payload: CreateSedeProductAssociationPayload
): Promise<SedeProductAssociation> => {
  const [newAssociation] = await db.insert(sedeProductAssociations).values({
    sedeId: payload.sedeId,
    productId: payload.productId,
    stockAtSede: payload.stockAtSede,
  }).returning();
  return newAssociation as SedeProductAssociation;
};

// Obtener todas las sedes que tienen un producto específico
export const getSedesByProductId = async (productId: number) => {
  // Buscar todas las asociaciones para el producto dado
  const associations = await db.select().from(schema.sedeProductAssociations)
    .where(eq(schema.sedeProductAssociations.productId, productId));

  // Extraer los IDs de las sedes asociadas
  const sedeIds = associations.map(a => a.sedeId);
  if (sedeIds.length === 0) return [];

  // Obtener la información completa de las sedes
  const sedes = await db.select().from(schema.sedes)
    .where(inArray(schema.sedes.id, sedeIds));

  // Combinar información de sede con el stock disponible
  return sedes.map(sede => {
    const assoc = associations.find(a => a.sedeId === sede.id);
    return {
      ...sede,
      stockAtSede: assoc ? assoc.stockAtSede : 0,
    };
  });
};

// Obtener el stock por sede para un producto específico
export async function getStockBySedeForProduct(productId: number): Promise<{ sedeId: number, stock: number }[]> {
  const associations = await db.select().from(schema.sedeProductAssociations)
    .where(eq(schema.sedeProductAssociations.productId, productId));
  return associations.map(a => ({ sedeId: a.sedeId, stock: a.stockAtSede }));
}

// Obtener el stock por sede para múltiples productos
export async function getStockBySedeForProducts(productIds: number[]): Promise<Record<number, { sedeId: number, stock: number }[]>> {
  if (productIds.length === 0) return {};
  const associations = await db.select().from(schema.sedeProductAssociations)
    .where(inArray(schema.sedeProductAssociations.productId, productIds));
  const stockMap: Record<number, { sedeId: number, stock: number }[]> = {};
  for (const assoc of associations) {
    if (!stockMap[assoc.productId]) stockMap[assoc.productId] = [];
    stockMap[assoc.productId].push({ sedeId: assoc.sedeId, stock: assoc.stockAtSede });
  }
  return stockMap;
}
