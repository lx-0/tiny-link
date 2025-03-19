import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_DATABASE_URL) {
  throw new Error(
    "SUPABASE_DATABASE_URL must be set. Did you forget to provide the Supabase database URL?",
  );
}

// Get schema from environment variable or default to 'tinylink'
const schemaName = process.env.DB_SCHEMA || 'tinylink';
console.log(`Initializing database connection with schema: ${schemaName}`);

// Create a pool with proper error handling and more lenient timeouts
export const pool = new pg.Pool({ 
  connectionString: process.env.SUPABASE_DATABASE_URL,
  max: 10, // Maximum number of clients the pool should contain
  idleTimeoutMillis: 60000, // How long a client is allowed to remain idle before being closed (1 minute)
  connectionTimeoutMillis: 30000, // How long to wait for a connection (30 seconds)
  allowExitOnIdle: false // Don't exit the process when pool is idle
});

// Log any pool errors
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Set search path on connect
pool.on('connect', async (client) => {
  try {
    console.log(`Setting search path to ${schemaName}, public...`);
    await client.query(`SET search_path TO ${schemaName}, public;`);
  } catch (error) {
    console.error('Error in pool connect handler:', error);
  }
});

export const db = drizzle(pool, { schema });
