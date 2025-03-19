// Script to clean up incorrectly created tables from public schema
import { pool } from './server/db.js';

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
      
      // Create custom schema if it doesn't exist
      console.log('Creating custom schema...');
      await client.query('CREATE SCHEMA IF NOT EXISTS custom;');
      
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