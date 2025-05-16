import { Express, Request, Response } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User } from "@shared/schema";

const scryptAsync = promisify(scrypt);

export async function comparePasswords(supplied: string, stored: string) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}

export function setupAdminLogin(app: Express) {
  // Admin login endpoint - Simple version for development
  app.post("/api/traditional-login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Allow admin access with any password in development mode
      if (process.env.NODE_ENV === 'development' && username === 'admin') {
        // Create an admin user for the session
        const adminUser: Partial<User> = {
          id: "admin-dev",
          username: "admin",
          fullName: "Admin User",
          email: "admin@example.com",
          isAdmin: true,
          profileImage: null
        };
        
        // Set up the admin session
        req.login(adminUser, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ message: "Login failed" });
          }
          
          // Return admin user data
          res.status(200).json(adminUser);
        });
        return;
      }

      // Attempt database login for production
      const user = await storage.getUserByUsername(username);
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      const passwordsMatch = await comparePasswords(password, user.password || "");
      
      if (!passwordsMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Login successful
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        
        // Return user data (excluding password)
        const { password, ...userData } = user;
        res.status(200).json(userData);
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Current user endpoint
  app.get("/api/auth/user", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Return the authenticated user
    res.json(req.user);
  });

  // Check if user is admin
  app.get("/api/auth/check-admin", (req: Request, res: Response) => {
    // In development mode for testing
    if (process.env.NODE_ENV === 'development' && req.isAuthenticated()) {
      if (req.user && (req.user as any).username === 'admin') {
        return res.json({ isAdmin: true });
      }
    }
    
    // Check if authenticated user is an admin
    if (req.isAuthenticated() && (req.user as any)?.isAdmin) {
      return res.json({ isAdmin: true });
    }
    
    // Not admin
    res.json({ isAdmin: false });
  });
}