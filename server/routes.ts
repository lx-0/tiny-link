import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { nanoid } from "nanoid";
import * as QRCode from "qrcode";
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
    let { originalUrl, shortCode, isActive } = req.body;
    let userId = -1; // Default user ID for anonymous users
    
    // Validate the URL format
    if (!originalUrl.startsWith('http://') && !originalUrl.startsWith('https://')) {
      originalUrl = `https://${originalUrl}`;
    }
    
    // Authentication check
    const supabaseId = req.headers["x-user-id"] as string;
    
    if (supabaseId) {
      try {
        const user = await storage.getUserBySupabaseId(supabaseId);
        if (user) {
          userId = user.id;
        }
      } catch (error) {
        console.error("Error finding user:", error);
      }
    }
    
    try {
      // Custom shortcodes require authentication
      if (shortCode && userId === -1) {
        return res.status(401).json({ message: "Custom shortcodes require authentication" });
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
        userId: userId,
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
    console.log('DEBUG: GET /api/urls - Auth header:', supabaseId);
    
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await storage.getUserBySupabaseId(supabaseId);
      console.log('DEBUG: GET /api/urls - User lookup result:', user ? 'Found user' : 'No user found');
      
      if (!user) {
        // For debugging, list all available users
        const allUsers = await storage.getAllUsers();
        console.log('DEBUG: Available users:', allUsers.map(u => ({ 
          id: u.id, 
          userId: u.userId, 
          username: u.username 
        })));
        
        return res.status(404).json({ message: "User not found" });
      }

      const urls = await storage.getUrlsByUserId(user.id);
      console.log('DEBUG: GET /api/urls - Found URLs:', urls.length);
      res.json(urls);
    } catch (error) {
      console.error('DEBUG: GET /api/urls - Error:', error);
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
  
  // Public endpoint to get URL by short code (used for redirects)
  app.get("/api/urls/by-code/:shortCode", async (req, res) => {
    const { shortCode } = req.params;
    
    try {
      const url = await storage.getUrlByShortCode(shortCode);
      
      if (!url) {
        return res.status(404).json({ message: "URL not found" });
      }
      
      if (!url.isActive) {
        return res.status(403).json({ message: "This link has been deactivated" });
      }
      
      // Increment click count asynchronously - don't wait for it to complete
      storage.incrementUrlClicks(url.id).catch(err => {
        console.error('Error incrementing click count:', err);
      });
      
      // Return the URL data
      res.json(url);
    } catch (error) {
      console.error('Error fetching URL by short code:', error);
      res.status(500).json({ message: "Server error" });
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
  
  // QR Code generation endpoint
  app.get("/api/urls/:id/qrcode", async (req, res) => {
    const supabaseId = req.headers["x-user-id"] as string;
    if (!supabaseId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const urlId = parseInt(req.params.id);
    if (isNaN(urlId)) {
      return res.status(400).json({ message: "Invalid URL ID" });
    }

    const format = req.query.format as string || 'svg';
    const size = parseInt(req.query.size as string) || 200;

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
        return res.status(403).json({ message: "Not authorized to access this URL" });
      }

      // Get the base URL from request or use a default
      const baseUrl = req.headers.host ? 
        `${req.protocol}://${req.headers.host}` : 
        'http://localhost:5000';
      
      // The short URL to encode in the QR code - directly from root 
      const shortUrl = `${baseUrl}/${url.shortCode}`;

      // Generate QR code based on requested format
      if (format === 'svg') {
        const qrCodeSvg = await QRCode.toString(shortUrl, {
          type: 'svg',
          margin: 2,
          width: size,
          color: {
            dark: '#000',
            light: '#fff'
          }
        });
        
        res.header('Content-Type', 'image/svg+xml');
        res.send(qrCodeSvg);
      } 
      else if (format === 'png') {
        const qrCodeBuffer = await QRCode.toBuffer(shortUrl, {
          type: 'png',
          margin: 2, 
          width: size,
          color: {
            dark: '#000',
            light: '#fff'
          }
        });
        
        res.header('Content-Type', 'image/png');
        res.send(qrCodeBuffer);
      } 
      else if (format === 'data-url') {
        const qrCodeDataUrl = await QRCode.toDataURL(shortUrl, {
          margin: 2,
          width: size,
          color: {
            dark: '#000',
            light: '#fff'
          }
        });
        
        res.json({ dataUrl: qrCodeDataUrl });
      } 
      else {
        res.status(400).json({ message: "Invalid format. Supported formats: svg, png, data-url" });
      }
    } catch (error) {
      console.error('QR Code generation error:', error);
      res.status(500).json({ message: "Error generating QR code" });
    }
  });

  // This shortcode handler should be the LAST route registered before giving control to Vite
  // It will handle root-level shortcode URLs but allow all API and asset routes to work
  app.get('/:shortCode', async (req, res, next) => {
    const { shortCode } = req.params;
    
    // Skip specific paths that should be handled by other routes or Vite
    if (shortCode === 'app' || 
        shortCode === 'api' || 
        shortCode === 'assets' ||
        shortCode === 'not-found' ||
        shortCode === 'src' ||
        shortCode === 'node_modules' ||
        // Skip app-related routes when they appear at root level
        shortCode === 'login' ||
        shortCode === 'register' ||
        shortCode === 'dashboard' ||
        shortCode === 'about' ||
        shortCode === 'terms' ||
        shortCode === 'privacy' ||
        shortCode.startsWith('@') || // Skip Vite internal paths like @react-refresh
        shortCode.includes('.')) {
      return next();
    }

    console.log(`Handling shortcode redirect for: ${shortCode}`);
    
    try {
      const url = await storage.getUrlByShortCode(shortCode);
      
      if (!url || !url.isActive) {
        return res.redirect(`/not-found?code=${shortCode}`);
      }
      
      // Increment click count
      await storage.incrementUrlClicks(url.id);
      
      // Redirect to the original URL
      return res.redirect(url.originalUrl);
    } catch (error) {
      console.error('Error processing shortcode redirect:', error);
      return next(); // Let other handlers deal with this path
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
