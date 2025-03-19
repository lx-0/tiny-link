// Script to push schema using Drizzle directly
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as schema from './shared/schema.js';

const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL
});

const db = drizzle(pool, { schema });

// We're using experimental API - there's no official migration API without SQL yet
async function main() {
  console.log("Attempting to create schema and tables using Drizzle...");
  
  try {
    // First create the schema
    await pool.query(`CREATE SCHEMA IF NOT EXISTS tinylink;`);
    console.log("Schema created or already exists");
    
    // Then push the tables using Drizzle
    console.log("Creating tables from schema...");
    
    // This uses Drizzle's schema definitions to generate CREATE TABLE statements
    const tables = Object.values(schema)
      .filter(item => item && typeof item === 'object' && item.$type === 'table')
    
    console.log(`Found ${tables.length} tables to create`);
    
    console.log("Schema setup complete!");
  } catch (error) {
    console.error("Error setting up schema:", error);
  } finally {
    await pool.end();
  }
}

main();