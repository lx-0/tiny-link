import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Get schema from environment variable or default to 'urlshortener'
const schemaName = process.env.DB_SCHEMA || 'urlshortener';

export const users = pgTable(`${schemaName}.users`, {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull(),
  userId: text("user_id").notNull(), // supabase user ID
});

export const urls = pgTable(`${schemaName}.urls`, {
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
export const insertUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
  shortCode: true,
  userId: true,
  isActive: true,
});

export const updateUrlSchema = createInsertSchema(urls).pick({
  originalUrl: true,
  shortCode: true,
  isActive: true,
});

export type InsertUrl = z.infer<typeof insertUrlSchema>;
export type UpdateUrl = z.infer<typeof updateUrlSchema>;
export type Url = typeof urls.$inferSelect;
