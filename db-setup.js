// Database setup script using Drizzle ORM directly
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';

async function setupDatabase() {
  try {
    if (!process.env.SUPABASE_DATABASE_URL) {
      console.error('SUPABASE_DATABASE_URL is not set. Please check your environment variables.');
      process.exit(1);
    }
    
    console.log('Connecting to database...');
    const pool = new pg.Pool({ connectionString: process.env.SUPABASE_DATABASE_URL });
    const db = drizzle(pool);
    
    console.log('Creating tables...');
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "user_id" TEXT NOT NULL
      )
    `);
    
    // Create urls table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "urls" (
        "id" SERIAL PRIMARY KEY,
        "original_url" TEXT NOT NULL,
        "short_code" TEXT NOT NULL UNIQUE,
        "user_id" INTEGER NOT NULL,
        "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "clicks" INTEGER NOT NULL DEFAULT 0
      )
    `);
    
    console.log('Database tables created successfully!');
    
    // Close the connection
    await pool.end();
    console.log('Database connection closed.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase();