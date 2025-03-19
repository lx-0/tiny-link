import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { nanoid } from "nanoid";
import { storage } from "./storage";
import { insertUserSchema, insertUrlSchema, updateUrlSchema } from "@shared/schema";
import { ZodError } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User routes
  app.post("/api/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      res.status(201).json(user);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid user data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.get("/api/users/me", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // URL routes
  app.post("/api/urls", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let { originalUrl, shortCode, isActive } = req.body;
      
      // Validate the URL format
      if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        originalUrl = `https://${originalUrl}`;
      }

      // Generate short code if not provided
      if (!shortCode) {
        shortCode = nanoid(7); // Generate a 7-character unique code
      } else {
        // Check if short code already exists
        const existingUrl = await storage.getUrlByShortCode(shortCode);
        if (existingUrl) {
          return res.status(400).json({ message: "Short code already in use" });
        }
      }

      const urlData = insertUrlSchema.parse({
        originalUrl,
        shortCode,
        userId: user.id,
        isActive: isActive !== undefined ? isActive : true,
      });

      const url = await storage.createUrl(urlData);
      res.status(201).json(url);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid URL data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating URL" });
    }
  });

  app.get("/api/urls", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const urls = await storage.getUrlsByUserId(user.id);
      res.json(urls);
    } catch (error) {
      res.status(500).json({ message: "Error fetching URLs" });
    }
  });

  app.put("/api/urls/:id", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const urlId = parseInt(req.params.id);
    if (isNaN(urlId)) {
      return res.status(400).json({ message: "Invalid URL ID" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const url = await storage.getUrl(urlId);
      if (!url) {
        return res.status(404).json({ message: "URL not found" });
      }

      if (url.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to update this URL" });
      }

      let { originalUrl, shortCode, isActive } = req.body;
      
      // Validate the URL format
      if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
        originalUrl = `https://${originalUrl}`;
      }

      // Check if short code is being changed and is already in use
      if (shortCode !== url.shortCode) {
        const existingUrl = await storage.getUrlByShortCode(shortCode);
        if (existingUrl && existingUrl.id !== urlId) {
          return res.status(400).json({ message: "Short code already in use" });
        }
      }

      const updateData = updateUrlSchema.parse({
        originalUrl,
        shortCode,
        isActive,
      });

      const updatedUrl = await storage.updateUrl(urlId, updateData);
      res.json(updatedUrl);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ message: "Invalid URL data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating URL" });
    }
  });

  app.delete("/api/urls/:id", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const urlId = parseInt(req.params.id);
    if (isNaN(urlId)) {
      return res.status(400).json({ message: "Invalid URL ID" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const url = await storage.getUrl(urlId);
      if (!url) {
        return res.status(404).json({ message: "URL not found" });
      }

      if (url.userId !== user.id) {
        return res.status(403).json({ message: "Not authorized to delete this URL" });
      }

      const success = await storage.deleteUrl(urlId);
      if (success) {
        res.status(204).end();
      } else {
        res.status(500).json({ message: "Error deleting URL" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting URL" });
    }
  });

  app.get("/api/stats", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const totalUrls = await storage.getTotalUrlCount(user.id);
      const totalClicks = await storage.getTotalClickCount(user.id);
      const averageCTR = await storage.getAverageClickRate(user.id);

      res.json({
        totalUrls,
        totalClicks,
        averageCTR
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // API endpoint for redirect (used by React components)
  app.get("/api/urls/redirect/:shortCode", async (req, res) => {
    const { shortCode } = req.params;
    
    try {
      const url = await storage.getUrlByShortCode(shortCode);
      
      if (!url || !url.isActive) {
        return res.status(404).json({ message: "URL not found or inactive" });
      }
      
      // Increment click count
      await storage.incrementUrlClicks(url.id);
      
      // Return the original URL for client-side redirection
      res.json({ originalUrl: url.originalUrl });
    } catch (error) {
      res.status(500).json({ message: "Error processing redirect" });
    }
  });
  
  // Server-side redirect handler (fallback)
  // Note: This needs to be after all API routes to avoid conflicts
  app.get("/:shortCode", async (req, res) => {
    const { shortCode } = req.params;
    
    // Skip known application routes - allow the client router to handle these
    if (shortCode === 'app' || 
        shortCode === 'login' || 
        shortCode === 'register' || 
        shortCode === 'not-found' || 
        shortCode.startsWith('api') || 
        shortCode.startsWith('r')) {
      return res.status(404).json({ message: "Not found" });
    }
    
    try {
      const url = await storage.getUrlByShortCode(shortCode);
      
      if (!url || !url.isActive) {
        return res.redirect(`/not-found?code=${shortCode}`);
      }
      
      // Increment click count
      await storage.incrementUrlClicks(url.id);
      
      // Redirect to the original URL
      res.redirect(url.originalUrl);
    } catch (error) {
      res.status(500).json({ message: "Error processing redirect" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
