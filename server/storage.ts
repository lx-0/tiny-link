import { nanoid } from "nanoid";
import { 
  users, 
  urls, 
  type User, 
  type InsertUser, 
  type Url, 
  type InsertUrl,
  type UpdateUrl 
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, count, sum, avg } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySupabaseId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>; // Changed from Map to array for DB compatibility
  
  getUrl(id: number): Promise<Url | undefined>;
  getUrlByShortCode(shortCode: string): Promise<Url | undefined>;
  getUrlsByUserId(userId: number): Promise<Url[]>;
  createUrl(url: InsertUrl): Promise<Url>;
  updateUrl(id: number, url: UpdateUrl): Promise<Url | undefined>;
  deleteUrl(id: number): Promise<boolean>;
  incrementUrlClicks(id: number): Promise<Url | undefined>;
  
  // Stats related methods
  getTotalUrlCount(userId: number): Promise<number>;
  getTotalClickCount(userId: number): Promise<number>;
  getAverageClickRate(userId: number): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUserBySupabaseId(userId: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.userId, userId));
    return results.length > 0 ? results[0] : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }
  
  // Helper method for debugging - returns all users
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUrl(id: number): Promise<Url | undefined> {
    const results = await db.select().from(urls).where(eq(urls.id, id));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    const results = await db.select().from(urls).where(eq(urls.shortCode, shortCode));
    return results.length > 0 ? results[0] : undefined;
  }

  async getUrlsByUserId(userId: number): Promise<Url[]> {
    return await db.select().from(urls).where(eq(urls.userId, userId));
  }

  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    const result = await db.insert(urls).values(insertUrl).returning();
    return result[0];
  }

  async updateUrl(id: number, updateData: UpdateUrl): Promise<Url | undefined> {
    const result = await db
      .update(urls)
      .set(updateData)
      .where(eq(urls.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : undefined;
  }

  async deleteUrl(id: number): Promise<boolean> {
    const result = await db
      .delete(urls)
      .where(eq(urls.id, id))
      .returning({ id: urls.id });
      
    return result.length > 0;
  }

  async incrementUrlClicks(id: number): Promise<Url | undefined> {
    const result = await db
      .update(urls)
      .set({ clicks: sql`${urls.clicks} + 1` })
      .where(eq(urls.id, id))
      .returning();
      
    return result.length > 0 ? result[0] : undefined;
  }

  async getTotalUrlCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(urls)
      .where(eq(urls.userId, userId));
      
    return result[0]?.count || 0;
  }

  async getTotalClickCount(userId: number): Promise<number> {
    const result = await db
      .select({ totalClicks: sum(urls.clicks) })
      .from(urls)
      .where(eq(urls.userId, userId));
      
    // Ensure we return a number, not a string
    return result[0]?.totalClicks ? Number(result[0].totalClicks) : 0;
  }

  async getAverageClickRate(userId: number): Promise<number> {
    const result = await db
      .select({ averageClicks: avg(urls.clicks) })
      .from(urls)
      .where(eq(urls.userId, userId));
      
    // Ensure we return a number, not a string
    return result[0]?.averageClicks ? Number(result[0].averageClicks) : 0;
  }
}

/**
 * Utility function to add delay for retry mechanisms
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Setup initial test data with retry mechanism
 */
async function setupInitialData(maxRetries = 3, retryDelay = 2000) {
  let retries = 0;
  let lastError: any = null;

  // Get schema name from environment variable or default to 'tinylink'
  const schemaName = process.env.DB_SCHEMA || 'tinylink';
  
  while (retries < maxRetries) {
    try {
      console.log(`Setting up initial data in schema "${schemaName}"... (Attempt ${retries + 1}/${maxRetries})`);
      
      // Verify schema exists by checking database connection
      // This also ensures the schema is created via the pool.on('connect') handler
      await db.execute(sql`SELECT 1`);
      console.log(`Database connection successful, schema "${schemaName}" should be available`);
      
      // Check if testuser exists with proper error handling
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.userId, 'e1d08825-392d-4e15-a0fb-981eb87b8798'));
      
      console.log(`Checked for existing test user, found ${existingUser.length} results`);
      
      let testUserId: number;
      
      if (existingUser.length === 0) {
        // Create test user
        const testUser: InsertUser = {
          username: 'testuser',
          email: 'test@example.com',
          password: 'supabase-managed',
          userId: 'e1d08825-392d-4e15-a0fb-981eb87b8798'
        };
        
        const insertResult = await db.insert(users).values(testUser).returning();
        
        if (!insertResult || insertResult.length === 0) {
          throw new Error('Failed to insert test user: Empty result returned');
        }
        
        testUserId = insertResult[0].id;
        console.log(`Created test user in "${schemaName}" schema with ID ${testUserId}`);
      } else {
        testUserId = existingUser[0].id;
        console.log(`Using existing test user from "${schemaName}" schema with ID ${testUserId}`);
      }
      
      // Check if test URL exists
      const existingUrl = await db
        .select()
        .from(urls)
        .where(eq(urls.shortCode, 'test123'));
        
      if (existingUrl.length === 0) {
        // Create test URL
        const testUrl: InsertUrl = {
          userId: testUserId,
          originalUrl: 'https://example.com',
          shortCode: 'test123',
          isActive: true
        };
        
        const insertedUrlResult = await db.insert(urls).values(testUrl).returning();
        
        if (!insertedUrlResult || insertedUrlResult.length === 0) {
          throw new Error('Failed to insert test URL: Empty result returned');
        }
        
        const insertedUrl = insertedUrlResult[0];
        
        // Add initial clicks
        await db
          .update(urls)
          .set({ clicks: 5 })
          .where(eq(urls.id, insertedUrl.id));
          
        const updatedUrlResult = await db
          .select()
          .from(urls)
          .where(eq(urls.id, insertedUrl.id));
          
        console.log(`Created test URL in "${schemaName}" schema`, updatedUrlResult[0] || 'No updated URL found');
      } else {
        console.log(`Using existing test URL from "${schemaName}" schema`, existingUrl[0]);
      }
      
      // If we get here, everything succeeded
      console.log(`Initial data setup completed successfully in schema "${schemaName}"`);
      return;
      
    } catch (error: any) {
      lastError = error;
      console.error(`Error setting up initial data (attempt ${retries + 1}/${maxRetries}):`, error.message || error);
      
      // Only retry if we haven't hit max retries yet
      if (retries < maxRetries - 1) {
        console.log(`Retrying in ${retryDelay}ms...`);
        await sleep(retryDelay);
        retries++;
      } else {
        console.error(`Failed to set up initial data after ${maxRetries} attempts`);
      }
    }
  }
  
  // If we exhausted all retries, throw the last error to be caught by the caller
  if (lastError) {
    throw lastError;
  }
}

// Initialize the database storage
const dbStorage = new DatabaseStorage();

// Setup initial data and export the storage
setupInitialData()
  .then(() => console.log('Initial data setup complete'))
  .catch(err => console.error('Error during initial data setup:', err));

export const storage = dbStorage;
