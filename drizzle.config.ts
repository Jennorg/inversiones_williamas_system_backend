import type { Config } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/config/db.ts',
  out: './drizzle',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
    token: process.env.DATABASE_TOKEN!,
  },
} satisfies Config; 