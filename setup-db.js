// Database initialization script
import pkg from 'pg';
const { Pool } = pkg;

// Get schema name from environment variable
const schemaName = process.env.DB_SCHEMA || 'tinylink';
console.log(`Setting up schema: ${schemaName}`);

// Create the database connection
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
});

async function setupSchema() {
  const client = await pool.connect();
  try {
    // Create schema if it doesn't exist
    await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
    console.log(`Schema "${schemaName}" created or already exists.`);
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL,
        user_id TEXT NOT NULL
      );
    `);
    console.log(`Table "${schemaName}.users" created or already exists.`);
    
    // Create urls table
    await client.query(`
      CREATE TABLE IF NOT EXISTS ${schemaName}.urls (
        id SERIAL PRIMARY KEY,
        original_url TEXT NOT NULL,
        short_code TEXT NOT NULL UNIQUE,
        user_id INTEGER NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        clicks INTEGER NOT NULL DEFAULT 0
      );
    `);
    console.log(`Table "${schemaName}.urls" created or already exists.`);
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupSchema();