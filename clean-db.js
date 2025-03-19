// Script to clean up incorrectly created tables from public schema
import pg from 'pg';

// Get database URL from environment
const dbUrl = process.env.SUPABASE_DATABASE_URL;
if (!dbUrl) {
  console.error('SUPABASE_DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create a new pool without the event handlers to avoid schema creation
const pool = new pg.Pool({ connectionString: dbUrl });

// Get schema from environment variable or default to 'custom'
const schemaName = process.env.DB_SCHEMA || 'custom';

async function cleanDatabase() {
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    try {
      // Drop tables from public schema
      console.log('Dropping tables from public schema...');
      await client.query('DROP TABLE IF EXISTS public.urls CASCADE;');
      await client.query('DROP TABLE IF EXISTS public.users CASCADE;');
      
      console.log('Public schema tables dropped successfully');
      
      // Clean up any other potential schema errors
      if (process.env.DB_SCHEMA) {
        console.log(`Cleaning up schema: ${process.env.DB_SCHEMA}`);
        await client.query(`DROP TABLE IF EXISTS ${process.env.DB_SCHEMA}.urls CASCADE;`);
        await client.query(`DROP TABLE IF EXISTS ${process.env.DB_SCHEMA}.users CASCADE;`);
        await client.query(`DROP SCHEMA IF EXISTS ${process.env.DB_SCHEMA} CASCADE;`);
      }

      // Also clean up 'urlshortener' schema if it exists from previous attempts
      console.log('Cleaning up urlshortener schema if it exists...');
      await client.query('DROP TABLE IF EXISTS urlshortener.urls CASCADE;');
      await client.query('DROP TABLE IF EXISTS urlshortener.users CASCADE;');
      await client.query('DROP SCHEMA IF EXISTS urlshortener CASCADE;');
      
      // Clean up 'tinylink' schema if it exists
      console.log('Cleaning up tinylink schema if it exists...');
      await client.query('DROP TABLE IF EXISTS tinylink.urls CASCADE;');
      await client.query('DROP TABLE IF EXISTS tinylink.users CASCADE;');  
      await client.query('DROP SCHEMA IF EXISTS tinylink CASCADE;');
      
      // Create custom schema if it doesn't exist
      console.log(`Creating schema: ${schemaName}`);
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
      
      console.log('Database cleaned successfully');
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error cleaning database:', error);
  } finally {
    await pool.end();
  }
}

cleanDatabase();