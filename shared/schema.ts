import { pgSchema, pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Get schema from environment variable or default to 'tinylink'
const schemaName = process.env.DB_SCHEMA || 'tinylink';
console.log(`Using schema: ${schemaName} for database tables`);

// Create a schema reference first
export const tinylinkSchema = pgSchema(schemaName);

// Create custom schema tables with proper schema binding
export const users = tinylinkSchema.table('users', {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  userId: text("user_id").notNull(), // supabase user ID
});

export const urls = tinylinkSchema.table('urls', {
  id: serial("id").primaryKey(),
  originalUrl: text("original_url").notNull(),
  shortCode: text("short_code").notNull().unique(),
  userId: integer("user_id").notNull(), // reference to users.id
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  clicks: integer("clicks").notNull().default(0),
});

// User schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// URL schemas
export const insertUrlSchema = createInsertSchema(urls)
  .pick({
    originalUrl: true,
    shortCode: true,
    userId: true,
    isActive: true,
  })
  .extend({
    // Add validation for shortCode to be at least 5 characters
    shortCode: z.string().min(5, "Shortcode must be at least 5 characters long"),
  });

export const updateUrlSchema = createInsertSchema(urls)
  .pick({
    originalUrl: true,
    shortCode: true,
    isActive: true,
  })
  .extend({
    // Add validation for shortCode to be at least 5 characters
    shortCode: z.string().min(5, "Shortcode must be at least 5 characters long"),
  });

export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type UpdateUrl = z.infer<typeof updateUrlSchema>;
export type Url = typeof urls.$inferSelect;
