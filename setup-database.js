// Script to push the schema to the Supabase database
import { exec } from 'child_process';

// Set DATABASE_URL to SUPABASE_DATABASE_URL for drizzle-kit
process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;

console.log('Setting DATABASE_URL to SUPABASE_DATABASE_URL for schema push');
console.log('Running drizzle-kit push to create tables...');

// Run the drizzle-kit push command
exec('npx drizzle-kit push', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  console.log('Schema push completed successfully.');
});