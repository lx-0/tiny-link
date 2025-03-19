import { db } from './server/db';
import { users, urls } from './shared/schema';

async function setupDatabase() {
  console.log('Creating database schema...');
  try {
    // Create tables using drizzle schema
    const queries = [
      db.schema.createTable(users),
      db.schema.createTable(urls)
    ];
    
    for (const query of queries) {
      await db.execute(query);
    }
    
    console.log('Database schema created successfully');
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
}

setupDatabase()
  .then(() => {
    console.log('Database setup completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database setup failed:', error);
    process.exit(1);
  });