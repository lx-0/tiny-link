import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Did you forget to provide the Supabase database URL?",
  );
}

// Get schema from environment variable or default to 'urlshortener'
const schemaName = process.env.DB_SCHEMA || 'urlshortener';

export const pool = new pg.Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });

// Create and switch to schema
pool.on('connect', (client) => {
  client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
  client.query(`SET search_path TO ${schemaName};`);
});

export const db = drizzle(pool, { schema });
