// Database initialization script using drizzle-kit
import { exec } from 'child_process';

// Start the migration process
console.log('Initializing database tables...');
console.log('Running drizzle-kit push...');

// Check if SUPABASE_DATABASE_URL is set
if (!process.env.SUPABASE_DATABASE_URL) {
  console.error('SUPABASE_DATABASE_URL is not set. Please check your environment variables.');
  process.exit(1);
}

// Execute the drizzle-kit push command with the correct database URL and schema
exec('DATABASE_URL="$SUPABASE_DATABASE_URL" npx drizzle-kit push', (error, stdout, stderr) => {
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