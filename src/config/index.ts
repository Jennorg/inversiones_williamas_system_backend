import dotenv from 'dotenv';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from './db.js';

// 1. Carga las variables de entorno lo primero posible
dotenv.config();

// 2. Obtén y valida las variables de entorno para la base de datos
const tursoDatabaseUrl = process.env.DATABASE_URL;
const tursoDatabaseToken = process.env.DATABASE_TOKEN;

if (!tursoDatabaseUrl) {
  // Es crítico que la URL de la base de datos exista
  throw new Error("Missing environment variable: DATABASE_URL. Please set it in your .env file.");
}

if (!tursoDatabaseToken) {
  // El token también es crucial para la autenticación en Turso
  throw new Error("Missing environment variable: DATABASE_TOKEN. Please set it in your .env file.");
}

// 3. Crea el cliente de Turso con las variables validadas
const client = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoDatabaseToken,
});


export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL, // Ruta por defecto para SQLite
};


// 4. Inicializa Drizzle con el cliente y el esquema
export const db = drizzle(client, { schema });