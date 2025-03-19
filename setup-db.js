// Database initialization script
import pkg from "pg";
const { Pool } = pkg;

// Get schema name from environment variable
const schemaName = process.env.DB_SCHEMA || "tinylink";
console.log(`Setting up schema: ${schemaName}`);

// Create the database connection
const pool = new Pool({
  connectionString: process.env.SUPABASE_DATABASE_URL,
});

async function setupSchema() {
  const client = await pool.connect();
  try {
    // Check if we have permissions to create schema
    console.log("Checking database connection and permissions...");
    try {
      const result = await client.query("SELECT current_user, current_database();");
      console.log(`Connected as user: ${result.rows[0].current_user}`);
      console.log(`Connected to database: ${result.rows[0].current_database}`);
    } catch (err) {
      console.error("Error checking connection:", err);
    }

    // Try to check for existing schemas
    try {
      const schemas = await client.query("SELECT schema_name FROM information_schema.schemata;");
      console.log("Available schemas:", schemas.rows.map(row => row.schema_name));
    } catch (err) {
      console.error("Error listing schemas:", err);
    }

    // Create schema if it doesn't exist
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${schemaName};`);
      console.log(`Schema "${schemaName}" created or already exists.`);
    } catch (err) {
      console.error(`Error creating schema ${schemaName}:`, err);
      console.log("Attempting to create in public schema instead...");
    }

    // Check if we successfully created the schema
    try {
      const schemas = await client.query("SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;", [schemaName]);
      if (schemas.rows.length === 0) {
        console.log(`Warning: Schema ${schemaName} not found after attempted creation.`);
        console.log(`Will attempt to use public schema instead.`);
      }
    } catch (err) {
      console.error("Error checking for schema:", err);
    }

    // Create users table - try with schema, fallback to public if needed
    try {
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
    } catch (err) {
      console.error(`Error creating table ${schemaName}.users:`, err);
      console.log("Attempting to create users table in public schema...");
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            email TEXT NOT NULL,
            user_id TEXT NOT NULL
          );
        `);
        console.log("Table 'public.users' created or already exists.");
      } catch (err2) {
        console.error("Error creating table in public schema:", err2);
      }
    }

    // Create urls table - try with schema, fallback to public if needed
    try {
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
    } catch (err) {
      console.error(`Error creating table ${schemaName}.urls:`, err);
      console.log("Attempting to create urls table in public schema...");
      try {
        await client.query(`
          CREATE TABLE IF NOT EXISTS public.urls (
            id SERIAL PRIMARY KEY,
            original_url TEXT NOT NULL,
            short_code TEXT NOT NULL UNIQUE,
            user_id INTEGER NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            clicks INTEGER NOT NULL DEFAULT 0
          );
        `);
        console.log("Table 'public.urls' created or already exists.");
      } catch (err2) {
        console.error("Error creating table in public schema:", err2);
      }
    }

    console.log("Database setup completed!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    client.release();
    await pool.end();
  }
}

setupSchema();
