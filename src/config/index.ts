import dotenv from 'dotenv';
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from './db.js';

// Cargar variables de entorno desde archivo .env
dotenv.config();

// Obtener credenciales de la base de datos Turso
const tursoDatabaseUrl = process.env.DATABASE_URL;
const tursoDatabaseToken = process.env.DATABASE_TOKEN;

// Validar que las variables críticas estén definidas
if (!tursoDatabaseUrl) {
  throw new Error("Missing environment variable: DATABASE_URL. Please set it in your .env file.");
}

if (!tursoDatabaseToken) {
  throw new Error("Missing environment variable: DATABASE_TOKEN. Please set it in your .env file.");
}

// Crear cliente de conexión a Turso
const client = createClient({
  url: tursoDatabaseUrl,
  authToken: tursoDatabaseToken,
});

// Configuración general de la aplicación
export const config = {
  port: process.env.PORT || 3000,
  databaseUrl: process.env.DATABASE_URL,
};

// Instancia de Drizzle ORM configurada con el esquema
export const db = drizzle(client, { schema });