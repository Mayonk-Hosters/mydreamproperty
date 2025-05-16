import { Request, Response, NextFunction } from "express";
import passport from "passport";
import { storage } from "../storage";
import { authStorage } from "../auth-storage";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Confirm user is authenticated and return user data
export function getCurrentUser(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Handle both Replit Auth and traditional auth
  if (req.user?.claims?.sub) {
    // Replit Auth user
    return res.json({
      id: req.user.claims.sub,
      fullName: req.user.claims.first_name || req.user.claims.name,
      email: req.user.claims.email,
      profileImage: req.user.claims.profile_image_url,
      isAdmin: req.user.dbUser?.isAdmin || false
    });
  } else {
    // Traditional login user
    // Remove password from response
    const { password, ...userData } = req.user as any;
    return res.json(userData);
  }
}

// Traditional login handler
export async function traditionalLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
    
    // Check if user exists with the provided username
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Skip password check for development admin
    const passwordsMatch = 
      (process.env.NODE_ENV === 'development' && username === 'admin') || 
      (await comparePasswords(password, user.password || ""));
    
    if (!passwordsMatch) {
      return res.status(401).json({ message: "Invalid username or password" });
    }
    
    // Set up session for the authenticated user
    req.login(user, (err) => {
      if (err) {
        console.error("Login error:", err);
        return res.status(500).json({ message: "Login failed" });
      }
      
      // Return user data (excluding password)
      const { password, ...userData } = user;
      res.status(200).json(userData);
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed due to server error" });
  }
}

// Check if user is admin
export async function checkAdminStatus(req: Request, res: Response) {
  try {
    // For development, simplify to always grant admin access
    if (process.env.NODE_ENV === 'development') {
      return res.status(200).json({ isAdmin: true });
    }
    
    if (req.isAuthenticated()) {
      // Handle both auth types
      if (req.user?.claims?.sub) {
        // Check admin status for Replit Auth user
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        return res.status(200).json({ isAdmin: !!user?.isAdmin });
      } else if ((req.user as any)?.isAdmin) {
        // Traditional login with isAdmin flag
        return res.status(200).json({ isAdmin: true });
      }
    }
    
    return res.status(200).json({ isAdmin: false });
  } catch (error) {
    console.error("Error checking admin status:", error);
    res.status(500).json({ message: "Failed to check admin status" });
  }
}

// Log out the user
export function logoutUser(req: Request, res: Response) {
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ message: "Logout failed" });
    }
    res.redirect('/');
  });
}