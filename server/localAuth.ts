import type { Express, RequestHandler } from "express";

// This is a simplified authentication system for local development only
export function getSession() {
  return null;
}

export async function setupAuth(app: Express) {
  console.log("Using local authentication system for development");
  
  // Setup a basic login endpoint for local development
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    
    // For local development, accept a simple admin login
    if (username === "admin" && password === "password") {
      // Set a simple session
      if (req.session) {
        req.session.isAuthenticated = true;
        req.session.isAdmin = true;
        req.session.user = {
          id: "local-admin",
          username: "admin",
          fullName: "Local Admin",
          email: "admin@example.com",
          isAdmin: true
        };
      }
      
      return res.status(200).json({ 
        success: true, 
        message: "Logged in successfully",
        user: {
          id: "local-admin",
          username: "admin",
          isAdmin: true
        }
      });
    }
    
    return res.status(401).json({ 
      success: false, 
      message: "Invalid credentials" 
    });
  });
  
  app.post("/api/logout", (req, res) => {
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).json({ success: false, message: "Failed to logout" });
        }
        
        return res.status(200).json({ success: true, message: "Logged out successfully" });
      });
    } else {
      return res.status(200).json({ success: true, message: "No active session" });
    }
  });
}

// Middleware to check if the user is authenticated
export const isAuthenticated: RequestHandler = (req, res, next) => {
  // For local development, check if the session has isAuthenticated flag
  if (req.session && req.session.isAuthenticated) {
    // Add the user object to the request
    req.user = {
      claims: {
        sub: "local-admin"
      },
      dbUser: req.session.user
    };
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};

// Middleware to check if the user is an admin
export const isAdmin: RequestHandler = (req, res, next) => {
  // For local development, check if the session has isAdmin flag
  if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
    return next();
  }
  
  return res.status(403).json({ message: "Forbidden" });
};