import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Did you forget to provide the Supabase database URL?",
  );
}

// Get schema from environment variable or default to 'custom'
const schemaName = process.env.DB_SCHEMA || 'custom';

export const pool = new pg.Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });

// Create and switch to schema
pool.on('connect', async (client) => {
  await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
  await client.query(`SET search_path TO ${schemaName}, public;`);
});

export const db = drizzle(pool, { schema });
