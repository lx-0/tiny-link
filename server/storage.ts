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

// Create a test user and URL in the database if needed
async function setupInitialData() {
  try {
    // Get schema name from environment variable or default to 'urlshortener'
    const schemaName = process.env.DB_SCHEMA || 'urlshortener';
    console.log(`Setting up initial data in schema "${schemaName}"...`);
    
    // Before doing anything, try to create the schema if it doesn't exist
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS ${sql.raw(schemaName)}`);
    
    // Check if testuser exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userId, 'e1d08825-392d-4e15-a0fb-981eb87b8798'));
    
    let testUserId: number;
    
    if (existingUser.length === 0) {
      // Create test user
      const testUser: InsertUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'supabase-managed',
        userId: 'e1d08825-392d-4e15-a0fb-981eb87b8798'
      };
      
      const [insertedUser] = await db.insert(users).values(testUser).returning();
      console.log(`DEBUG: Created test user in "${schemaName}" schema`, insertedUser);
      testUserId = insertedUser.id;
    } else {
      testUserId = existingUser[0].id;
      console.log(`DEBUG: Using existing test user from "${schemaName}" schema`, existingUser[0]);
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
      
      const [insertedUrl] = await db.insert(urls).values(testUrl).returning();
      
      // Add initial clicks
      if (insertedUrl) {
        await db
          .update(urls)
          .set({ clicks: 5 })
          .where(eq(urls.id, insertedUrl.id));
          
        const [updatedUrl] = await db
          .select()
          .from(urls)
          .where(eq(urls.id, insertedUrl.id));
          
        console.log(`DEBUG: Created test URL in "${schemaName}" schema`, updatedUrl);
      }
    } else {
      console.log(`DEBUG: Using existing test URL from "${schemaName}" schema`, existingUrl[0]);
    }
  } catch (error) {
    console.error('Error setting up initial data:', error);
  }
}

// Initialize the database storage
const dbStorage = new DatabaseStorage();

// Setup initial data and export the storage
setupInitialData()
  .then(() => console.log('Initial data setup complete'))
  .catch(err => console.error('Error during initial data setup:', err));

export const storage = dbStorage;
