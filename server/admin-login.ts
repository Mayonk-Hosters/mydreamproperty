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
  // Set up serialization/deserialization for Passport
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });
  // Admin login endpoint - Simple version for development
  app.post("/api/traditional-login", async (req: Request, res: Response) => {
    try {
      const { username, password, userType } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Handle admin authentication for both development and production
      if (userType === 'admin' || (!userType && username === 'admin')) {
        // Check for standard admin credentials
        if ((username === 'admin' && password === 'admin123') || 
            (username === 'Smileplz004' && password === '9923000500@rahul') || 
            (username === 'ahmednagarproperty' && password === '9923000500@rahul')) {
          
          const adminUser = {
            id: username === 'admin' ? 1 : "admin-dev",
            username: username,
            fullName: "Admin User",
            email: username === 'admin' ? null : "admin@example.com",
            isAdmin: true,
            role: "admin",
            profileImage: null,
            createdAt: new Date().toISOString()
          };
          
          // Set session properties for both development and production
          (req.session as any).isAdmin = true;
          (req.session as any).userType = "admin";
          (req.session as any).user = adminUser;
          
          // Also set passport session for compatibility
          if (!(req.session as any).passport) {
            (req.session as any).passport = {};
          }
          (req.session as any).passport.user = adminUser.id;
          
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            console.log("Admin session saved successfully:", {
              isAdmin: (req.session as any).isAdmin,
              userType: (req.session as any).userType,
              sessionID: req.sessionID,
              environment: process.env.NODE_ENV
            });
            res.status(200).json(adminUser);
          });
          return;
        }
        
        // If admin credentials don't match, return error
        return res.status(401).json({ message: "Invalid admin credentials" });
      }

      // For other user types or database lookups, check the database
      try {
        const user = await storage.getUserByUsername(username);
        
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Verify password
        const passwordsMatch = await comparePasswords(password, user.password || "");
        
        if (!passwordsMatch) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Login successful - set session properties
        (req.session as any).isAdmin = !!user.isAdmin;
        (req.session as any).userType = user.isAdmin ? "admin" : "user";
        (req.session as any).user = user;
        
        // Set passport session for compatibility
        if (!(req.session as any).passport) {
          (req.session as any).passport = {};
        }
        (req.session as any).passport.user = user.id;
        
        // Save the session and respond
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Session save failed" });
          }
          
          console.log("Database user login session established:", {
            isAdmin: (req.session as any).isAdmin,
            userType: (req.session as any).userType,
            sessionID: req.sessionID,
            passportUser: (req.session as any).passport?.user
          });
          
          // Return user data (excluding password)
          const { password: _, ...userData } = user;
          res.status(200).json(userData);
        });
      } catch (error) {
        console.error("Database login error:", error);
        return res.status(500).json({ message: "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Current user endpoint
  app.get("/api/auth/user", (req: Request, res: Response) => {
    console.log("Auth user check - Session state:", {
      sessionID: req.sessionID,
      sessionExists: !!req.session,
      sessionIsAdmin: (req.session as any)?.isAdmin,
      sessionUserType: (req.session as any)?.userType,
      sessionUser: (req.session as any)?.user,
      cookies: req.headers.cookie,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user
    });

    // Check session-based authentication first (for traditional login)
    if (req.session && (req.session as any).isAdmin && (req.session as any).user) {
      console.log("Session auth successful, returning user:", (req.session as any).user);
      return res.json((req.session as any).user);
    }
    
    // Check passport-based authentication (for OAuth login)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log("Passport auth successful, returning user:", req.user);
      return res.json(req.user);
    }
    
    console.log("No valid authentication found");
    return res.status(401).json({ message: "Unauthorized" });
  });

  // Check if user is admin
  app.get("/api/auth/check-admin", (req: Request, res: Response) => {
    console.log("Check admin endpoint - Session state:", {
      hasSession: !!req.session,
      sessionIsAdmin: (req.session as any)?.isAdmin,
      sessionUserType: (req.session as any)?.userType,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user
    });

    // Check session-based admin access first (traditional login)
    if (req.session && (req.session as any).isAdmin) {
      console.log("Admin access granted via session");
      return res.json({ isAdmin: true });
    }
    
    // Check OAuth-based admin access
    if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.isAdmin) {
      console.log("Admin access granted via OAuth");
      return res.json({ isAdmin: true });
    }
    
    // Development mode fallback
    if (process.env.NODE_ENV === 'development' && req.isAuthenticated()) {
      if (req.user && (req.user as any).username === 'Smileplz004') {
        return res.json({ isAdmin: true });
      }
    }
    
    console.log("Admin access denied");
    res.json({ isAdmin: false });
  });
}