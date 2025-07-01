// src/services/sedeProductAssociation.service.ts

import { db } from '../config/index.js';
import { sedeProductAssociations } from '../config/db.js';
import { eq, inArray } from 'drizzle-orm';
import * as schema from '../config/db.js';

interface CreateSedeProductAssociationPayload {
  sedeId: number;
  productId: number;
  stockAtSede: number;
}

interface SedeProductAssociation {
  sedeId: number;
  productId: number;
  stockAtSede: number;
}

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

export const getSedesByProductId = async (productId: number) => {
  // Busca todas las asociaciones de sedes para el producto dado
  const associations = await db.select().from(schema.sedeProductAssociations)
    .where(eq(schema.sedeProductAssociations.productId, productId));

  // Obtiene los IDs de las sedes asociadas
  const sedeIds = associations.map(a => a.sedeId);
  if (sedeIds.length === 0) return [];

  // Busca la información de las sedes usando inArray
  const sedes = await db.select().from(schema.sedes)
    .where(inArray(schema.sedes.id, sedeIds));

  // Une la información de la sede con el stock
  return sedes.map(sede => {
    const assoc = associations.find(a => a.sedeId === sede.id);
    return {
      ...sede,
      stockAtSede: assoc ? assoc.stockAtSede : 0,
    };
  });
};

// Devuelve el stock por sede para un producto específico
export async function getStockBySedeForProduct(productId: number): Promise<{ sedeId: number, stock: number }[]> {
  const associations = await db.select().from(schema.sedeProductAssociations)
    .where(eq(schema.sedeProductAssociations.productId, productId));
  return associations.map(a => ({ sedeId: a.sedeId, stock: a.stockAtSede }));
}

// Devuelve un mapa de productId a array de stock por sede para varios productos
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
