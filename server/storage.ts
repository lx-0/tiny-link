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

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserBySupabaseId(userId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Map<number, User>; // Added for debugging
  
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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private urls: Map<number, Url>;
  private userIdCounter: number;
  private urlIdCounter: number;

  constructor() {
    this.users = new Map();
    this.urls = new Map();
    this.userIdCounter = 1;
    this.urlIdCounter = 1;
    
    // Create a test user for debugging
    const testUser: User = {
      id: this.userIdCounter++,
      username: 'testuser',
      email: 'test@example.com',
      password: 'supabase-managed',
      userId: 'e1d08825-392d-4e15-a0fb-981eb87b8798' // Match the logged Supabase user ID for testing
    };
    this.users.set(testUser.id, testUser);
    
    // Create a test URL for this user
    const testUrl: Url = {
      id: this.urlIdCounter++,
      userId: testUser.id,
      originalUrl: 'https://example.com',
      shortCode: 'test123',
      isActive: true,
      createdAt: new Date(),
      clicks: 5
    };
    this.urls.set(testUrl.id, testUrl);
    
    console.log('DEBUG: Created test user', testUser);
    console.log('DEBUG: Created test URL', testUrl);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserBySupabaseId(userId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.userId === userId,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  
  // Helper method for debugging
  getAllUsers(): Map<number, User> {
    return this.users;
  }

  async getUrl(id: number): Promise<Url | undefined> {
    return this.urls.get(id);
  }

  async getUrlByShortCode(shortCode: string): Promise<Url | undefined> {
    return Array.from(this.urls.values()).find(
      (url) => url.shortCode === shortCode,
    );
  }

  async getUrlsByUserId(userId: number): Promise<Url[]> {
    return Array.from(this.urls.values()).filter(
      (url) => url.userId === userId,
    );
  }

  async createUrl(insertUrl: InsertUrl): Promise<Url> {
    const id = this.urlIdCounter++;
    const now = new Date();
    const url: Url = { 
      ...insertUrl, 
      id, 
      createdAt: now, 
      clicks: 0 
    };
    this.urls.set(id, url);
    return url;
  }

  async updateUrl(id: number, updateData: UpdateUrl): Promise<Url | undefined> {
    const existingUrl = this.urls.get(id);
    if (!existingUrl) {
      return undefined;
    }

    const updatedUrl: Url = {
      ...existingUrl,
      ...updateData,
    };

    this.urls.set(id, updatedUrl);
    return updatedUrl;
  }

  async deleteUrl(id: number): Promise<boolean> {
    return this.urls.delete(id);
  }

  async incrementUrlClicks(id: number): Promise<Url | undefined> {
    const url = this.urls.get(id);
    if (!url) {
      return undefined;
    }

    const updatedUrl: Url = {
      ...url,
      clicks: url.clicks + 1,
    };

    this.urls.set(id, updatedUrl);
    return updatedUrl;
  }

  async getTotalUrlCount(userId: number): Promise<number> {
    return Array.from(this.urls.values()).filter(
      (url) => url.userId === userId
    ).length;
  }

  async getTotalClickCount(userId: number): Promise<number> {
    return Array.from(this.urls.values())
      .filter((url) => url.userId === userId)
      .reduce((total, url) => total + url.clicks, 0);
  }

  async getAverageClickRate(userId: number): Promise<number> {
    const userUrls = Array.from(this.urls.values()).filter(
      (url) => url.userId === userId
    );
    
    if (userUrls.length === 0) {
      return 0;
    }
    
    const totalClicks = userUrls.reduce((total, url) => total + url.clicks, 0);
    return totalClicks / userUrls.length;
  }
}

export const storage = new MemStorage();
