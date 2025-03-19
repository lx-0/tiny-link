// Database initialization script using drizzle-kit
import { exec } from 'child_process';

// Start the migration process
console.log('Initializing database tables...');
console.log('Running drizzle-kit push...');

// Make sure DATABASE_URL is set to SUPABASE_DATABASE_URL
if (process.env.SUPABASE_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
  console.log('Set DATABASE_URL to SUPABASE_DATABASE_URL');
} else {
  console.error('SUPABASE_DATABASE_URL is not set. Please check your environment variables.');
  process.exit(1);
}

// Execute the drizzle-kit push command to create database tables
exec('npx drizzle-kit push', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during database initialization: ${error.message}`);
    return;
  }
  
  if (stderr) {
    console.warn(`Warning: ${stderr}`);
  }
  
  console.log(`Database initialization output: ${stdout}`);
  console.log('Database tables have been created successfully!');
});