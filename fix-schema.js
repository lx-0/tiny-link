// Script to create schema and tables explicitly with direct SQL
import pg from 'pg';
const { Pool } = pg;

async function fixSchema() {
  // Get schema name from environment variable 
  const schemaName = process.env.DB_SCHEMA || 'tinylink';
  console.log(`Fixing schema: ${schemaName}`);
  
  // Create database connection
  const pool = new Pool({
    connectionString: process.env.SUPABASE_DATABASE_URL,
    max: 3,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected to database');
    
    try {
      // Create schema if it doesn't exist
      console.log(`Creating schema "${schemaName}"...`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
      
      // Set the search path
      console.log(`Setting search path to "${schemaName}"...`);
      await client.query(`SET search_path TO ${schemaName}, public;`);
      
      // Create users table
      console.log(`Creating table "${schemaName}.users"...`);
      await client.query(`
        CREATE TABLE IF NOT EXISTS ${schemaName}.users (
          id SERIAL PRIMARY KEY,
          username TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          email TEXT NOT NULL,
          user_id TEXT NOT NULL
        );
      `);
      
      // Create urls table
      console.log(`Creating table "${schemaName}.urls"...`);
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
      
      // Check if tables exist
      const usersResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${schemaName}'
          AND table_name = 'users'
        );
      `);
      
      const urlsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = '${schemaName}'
          AND table_name = 'urls'
        );
      `);
      
      console.log(`Users table exists: ${usersResult.rows[0].exists}`);
      console.log(`URLs table exists: ${urlsResult.rows[0].exists}`);
      
      console.log('Schema and tables created successfully!');
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error fixing schema:', error);
  } finally {
    // Close the pool
    await pool.end();
  }
}

// Run the function
fixSchema().catch(console.error);