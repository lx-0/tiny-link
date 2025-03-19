// Simple script to create schema and tables
import pkg from "pg";
const { Pool } = pkg;

// Get schema name from environment variable or default to 'tinylink'
const schemaName = process.env.DB_SCHEMA || 'tinylink';
console.log(`Creating schema: ${schemaName}`);

// Create the database connection
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
});

async function createSchema() {
  const client = await pool.connect();
  try {
    // Create schema
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
    console.log(`Schema "${schemaName}" created or already exists.`);
    
    // Create tables using the same structure as in the schema.ts file
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        user_id TEXT NOT NULL
      );
    `;
    
    const createUrlsTable = `
      CREATE TABLE IF NOT EXISTS ${schemaName}.urls (
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        short_code TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        clicks INTEGER NOT NULL DEFAULT 0
      );
    `;
    
    await client.query(createUsersTable);
    console.log(`Table "${schemaName}.users" created or already exists.`);
    
    await client.query(createUrlsTable);
    console.log(`Table "${schemaName}.urls" created or already exists.`);
    
    console.log("Schema and tables created successfully!");
  } catch (error) {
    console.error("Error creating schema and tables:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

createSchema();