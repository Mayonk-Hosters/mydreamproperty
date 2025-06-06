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

      // Development mode - provide test users for each type
      if (process.env.NODE_ENV === 'development') {
        // Admin login in development mode with specific credentials
        if (userType === 'admin' && (username === 'Smileplz004' || username === 'ahmednagarproperty') && password === '9923000500@rahul') {
          const adminUser = {
            id: "admin-dev",
            username: username,
            fullName: "Admin User",
            email: "admin@example.com",
            isAdmin: true,
            role: "admin",
            profileImage: null
          };
          
          // Set session properties directly without passport
          req.session.isAdmin = true;
          req.session.userType = "admin";
          req.session.user = adminUser;
          
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            console.log("Admin session saved successfully:", {
              isAdmin: req.session.isAdmin,
              userType: req.session.userType,
              sessionID: req.sessionID
            });
            res.status(200).json(adminUser);
          });
          return;
        }
        
        // Agent login in development mode
        if (userType === 'agent' && username === 'agent') {
          const agentUser = {
            id: "agent-dev",
            username: "agent",
            fullName: "Agent User",
            email: "agent@example.com",
            isAdmin: false,
            role: "agent",
            profileImage: null
          };
          
          req.login(agentUser, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Login failed" });
            }
            
            req.session.isAdmin = false;
            req.session.userType = "agent";
            
            req.session.save((err) => {
              if (err) console.error("Session save error:", err);
              res.status(200).json(agentUser);
            });
          });
          return;
        }
        
        // Client login in development mode
        if (userType === 'client' && username === 'client') {
          const clientUser = {
            id: "client-dev",
            username: "client",
            fullName: "Client User",
            email: "client@example.com",
            isAdmin: false,
            role: "client",
            profileImage: null
          };
          
          req.login(clientUser, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Login failed" });
            }
            
            req.session.isAdmin = false;
            req.session.userType = "client";
            
            req.session.save((err) => {
              if (err) console.error("Session save error:", err);
              res.status(200).json(clientUser);
            });
          });
          return;
        }
      }

      // Production login - look for users in the database
      let user;
      
      // Determine which storage method to use based on user type
      if (userType === 'admin') {
        user = await storage.getUserByUsername(username);
      } else if (userType === 'agent') {
        // You can implement agent-specific storage methods
        user = await storage.getAgentByUsername(username);
        if (user) {
          user.role = "agent";
        }
      } else if (userType === 'client') {
        // You can implement client-specific storage methods
        user = await storage.getClientByUsername(username);
        if (user) {
          user.role = "client";
        }
      } else {
        // Default to regular user lookup if userType is not specified
        user = await storage.getUserByUsername(username);
      }
      
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Special case for development mode - any password works
      let passwordsMatch = false;
      if (process.env.NODE_ENV === 'development') {
        passwordsMatch = true;
      } else {
        passwordsMatch = await comparePasswords(password, user.password || "");
      }
      
      if (!passwordsMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Login successful
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        
        // Set admin flag in session if user is admin
        req.session.isAdmin = !!user.isAdmin;
        req.session.userType = user.role || (user.isAdmin ? "admin" : "client");
        
        // Save the session
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
          }
          
          // Return user data (excluding password)
          const { password, ...userData } = user;
          res.status(200).json(userData);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Current user endpoint
  app.get("/api/auth/user", (req: Request, res: Response) => {
    console.log("Auth user check - Session state:", {
      sessionIsAdmin: req.session?.isAdmin,
      sessionUserType: req.session?.userType,
      sessionUser: req.session?.user,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user
    });

    // Check session-based authentication first (for traditional login)
    if (req.session && req.session.isAdmin && req.session.user) {
      return res.json(req.session.user);
    }
    
    // Check passport-based authentication (for OAuth login)
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      return res.json(req.user);
    }
    
    return res.status(401).json({ message: "Unauthorized" });
  });

  // Check if user is admin
  app.get("/api/auth/check-admin", (req: Request, res: Response) => {
    // In development mode for testing
    if (process.env.NODE_ENV === 'development' && req.isAuthenticated()) {
      if (req.user && (req.user as any).username === 'Smileplz004') {
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