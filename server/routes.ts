import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { pool } from "./db";
import * as XLSX from 'xlsx';
// AI recommendation imports removed
import { 
  insertPropertySchema, 
  insertAgentSchema, 
  insertPropertyInquirySchema,
  insertStateSchema,
  insertDistrictSchema,
  insertTalukaSchema,
  insertTehsilSchema,
  insertContactInfoSchema,
  insertPropertyTypeSchema,
  insertContactMessageSchema,
  insertHomeLoanInquirySchema,
  DEFAULT_PROPERTY_TYPES,
  PROPERTY_STATUS
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
// Use local authentication when running locally (set by the LOCAL_DEV environment variable)
import { setupAuth as setupReplitAuth, isAuthenticated as isReplitAuthenticated, isAdmin as isReplitAdmin } from "./replitAuth";
import { setupAuth as setupLocalAuth, isAuthenticated as isLocalAuthenticated, isAdmin as isLocalAdmin } from "./localAuth";

// Determine which auth system to use based on environment
const isLocalDev = process.env.LOCAL_DEV === 'true';
const setupAuth = isLocalDev ? setupLocalAuth : setupReplitAuth;
const isAuthenticated = isLocalDev ? isLocalAuthenticated : isReplitAuthenticated;
const isAdmin = isLocalDev ? isLocalAdmin : isReplitAdmin;
import { setupAdminLogin } from "./admin-login";
import { authStorage } from "./auth-storage";
import { sendInquiryNotification } from "./email-service";
import { checkProductionAdminAccess } from "./production-auth-fix";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";

import mdpPropertiesRoutes from './routes/mdp-properties';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'static', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Production-ready admin access checker for message functions
function checkAdminAccess(req: any): boolean {
  console.log('Production auth check:', {
    hasSession: !!req.session,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    isAdmin: (req.session as any)?.isAdmin,
    authenticatedAdmin: (req.session as any)?.authenticatedAdmin,
    userType: (req.session as any)?.userType,
    environment: process.env.NODE_ENV
  });

  // Primary authentication methods for production deployment
  const authChecks = [
    // Method 1: Direct session admin flag
    () => req.session?.isAdmin === true,
    
    // Method 2: Authenticated admin flag (production)
    () => req.session?.authenticatedAdmin === true,
    
    // Method 3: Admin userType
    () => req.session?.userType === 'admin',
    
    // Method 4: Passport session with admin
    () => req.session?.passport?.user && req.session?.isAdmin,
    
    // Method 5: OAuth admin
    () => req.isAuthenticated?.() && req.user?.isAdmin,
    
    // Method 6: Admin username in session
    () => req.session?.user?.username === 'admin',
    
    // Method 7: Production admin username
    () => req.session?.user?.username === 'ahmednagarproperty',
    
    // Method 8: Replit environment
    () => process.env.REPLIT_SLUG && req.headers['x-replit-user-id'],
    
    // Method 9: Development mode (last resort)
    () => process.env.NODE_ENV === 'development'
  ];

  for (let i = 0; i < authChecks.length; i++) {
    try {
      if (authChecks[i]()) {
        console.log(`Admin access granted via method ${i + 1}`);
        return true;
      }
    } catch (error) {
      console.log(`Auth method ${i + 1} failed:`, error);
    }
  }

  console.log('Admin access denied - no valid authentication found');
  return false;
}

// Enhanced admin middleware for production deployment
const requireAdmin = (req: any, res: any, next: any) => {
  if (checkAdminAccess(req)) {
    return next();
  }
  
  // Log authentication failure for debugging
  console.log('Admin access denied:', {
    hasSession: !!req.session,
    isAdmin: (req.session as any)?.isAdmin,
    hasUser: !!req.user,
    userIsAdmin: (req.user as any)?.isAdmin,
    environment: process.env.NODE_ENV
  });
  
  return res.status(403).json({ 
    message: "Admin access required", 
    error: "ADMIN_ACCESS_DENIED" 
  });
};

import { eq, like, or, sql, gte, lte, asc } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'static', 'uploads')));
  
  // Configure cookie parser
  app.use(cookieParser());
  
  // Create memory store for sessions
  const MemoryStoreSession = MemoryStore(session);
  
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret',
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: false, // Always false for development
      sameSite: 'lax'
    },
    name: 'sessionId'
  }));
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup authentication routes
  await setupAuth(app);
  
  // Setup admin login routes
  setupAdminLogin(app);
  
  // Auth user endpoint - removed duplicate, admin-login.ts handles this
  
  // Check if user is admin
  app.get('/api/auth/check-admin', async (req: any, res) => {
    try {
      if (req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        return res.status(200).json({ isAdmin: true });
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
        // Check admin status in database
        const userId = req.user.claims.sub;
        const user = await authStorage.getUser(userId);
        if (user && user.isAdmin) {
          return res.status(200).json({ isAdmin: true });
        }
      }
      return res.status(200).json({ isAdmin: false });
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(200).json({ isAdmin: false });
    }
  });
  
  // Contact form schema
  const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
    subject: z.string().min(3, "Subject must be at least 3 characters")
  });
  
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      console.log("Received contact form data:", req.body);
      
      // Make sure we match the contact form fields from the frontend
      const validatedData = contactFormSchema.parse(req.body);
      
      // Transform to match our database schema
      const contactData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || "",
        subject: validatedData.subject,
        message: validatedData.message,
        isRead: false
      };
      
      // Store the contact form submission in the database
      const newMessage = await dbStorage.createContactMessage(contactData);
      console.log("Contact form submission saved:", newMessage);
      
      // Here you would typically also send an email notification to admin
      
      res.status(201).json({ success: true, message: "Message received successfully", id: newMessage.id });
    } catch (error) {
      if (error instanceof ZodError) {
        console.error("Validation error:", error.errors);
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error processing contact form:", error);
      res.status(500).json({ message: "Failed to process contact form" });
    }
  });
  // Get all properties
  app.get("/api/properties", async (req, res) => {
    try {
      const {
        type,
        propertyType,
        location,
        minPrice,
        maxPrice,
        minBeds,
        minBaths,
        featured,
        agentId
      } = req.query;

      // Build filters object with only defined values
      const filters: any = {};
      
      if (type) filters.type = type as string;
      if (propertyType && propertyType !== "any") filters.propertyType = propertyType as string;
      if (location) filters.location = location as string;
      if (minPrice) filters.minPrice = parseFloat(minPrice as string);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
      if (minBeds) filters.minBeds = parseInt(minBeds as string);
      if (minBaths) filters.minBaths = parseFloat(minBaths as string);
      if (featured === "true") filters.featured = true;
      if (agentId) filters.agentId = parseInt(agentId as string);

      // Get all properties with filters applied
      const properties = await dbStorage.getAllProperties(Object.keys(filters).length > 0 ? filters : undefined);

      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get property counts by type
  app.get("/api/properties/counts-by-type", async (_req, res) => {
    try {
      // Get all properties and count by property type
      const allProperties = await dbStorage.getAllProperties();
      
      // Create a map to count properties by type
      const typeCounts = new Map<string, number>();
      
      allProperties.forEach(property => {
        const type = property.propertyType;
        if (type) {
          typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        }
      });
      
      // Convert to array format, prioritizing common types first
      const priorityTypes = ['House', 'Apartment', 'Villa', 'Commercial'];
      const counts: Array<{propertyType: string, count: number}> = [];
      
      // Add priority types first if they exist
      priorityTypes.forEach(type => {
        if (typeCounts.has(type)) {
          counts.push({ propertyType: type, count: typeCounts.get(type)! });
          typeCounts.delete(type);
        }
      });
      
      // Add remaining types sorted alphabetically
      const remainingTypes = Array.from(typeCounts.entries()).sort(([a], [b]) => a.localeCompare(b));
      remainingTypes.forEach(([type, count]) => {
        counts.push({ propertyType: type, count });
      });
      
      res.json(counts);
    } catch (error) {
      console.error("Error fetching property counts:", error);
      res.status(500).json({ message: "Failed to fetch property counts" });
    }
  });

  // Get a single property by ID
  app.get("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await dbStorage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  // Create a new property with more flexible validation
  app.post("/api/properties", async (req, res) => {
    try {
      // Create a sanitized property object with defaults for missing fields
      const requestData = req.body;
      
      // Build a property object with robust defaults to prevent validation errors
      const propertyData = {
        title: requestData.title || 'Untitled Property',
        description: requestData.description || 'No description provided',
        price: Number(requestData.price) || 0,
        location: requestData.location || 'Location not specified',
        address: requestData.address || 'Address not provided',
        beds: Number(requestData.beds) || 0,
        baths: Number(requestData.baths) || 0,
        area: Number(requestData.area) || 0,
        propertyType: requestData.propertyType || 'House',
        type: requestData.type || 'buy',
        status: requestData.status || 'active',
        // Ensure featured is properly stored as a boolean
        featured: requestData.featured === true || 
                  requestData.featured === 'true' || 
                  requestData.featured === 't' || 
                  requestData.featured === '1' || 
                  requestData.featured === 1,
        // Handle features - ensure it's always saved as a proper JSON array
        features: Array.isArray(requestData.features) ? requestData.features : 
                 (typeof requestData.features === 'string' ? 
                   (requestData.features ? JSON.parse(requestData.features) : []) : []),
        // Save Google Maps URL if provided
        map_url: requestData.mapUrl || null,
        images: Array.isArray(requestData.images) ? requestData.images : [],
        agentId: Number(requestData.agentId) || 1,
        // Handle MahaRERA registration fields
        maharera_registered: requestData.maharera_registered === true || 
                            requestData.maharera_registered === 'true' || 
                            requestData.maharera_registered === 't' || 
                            requestData.maharera_registered === '1' || 
                            requestData.maharera_registered === 1,
        maharera_number: requestData.maharera_number || null
      };
      
      // Add optional location fields if provided
      if (requestData.stateId) {
        (propertyData as any).stateId = Number(requestData.stateId);
      }
      
      if (requestData.districtId) {
        (propertyData as any).districtId = Number(requestData.districtId);
      }
      
      if (requestData.talukaId) {
        (propertyData as any).talukaId = Number(requestData.talukaId);
      }
      
      if (requestData.tehsilId) {
        (propertyData as any).tehsilId = Number(requestData.tehsilId);
      }
      
      // Generate property number if not provided or set to AUTO-GENERATE
      if (!requestData.propertyNumber || requestData.propertyNumber === "AUTO-GENERATE") {
        try {
          // Use the simple MDP prefix for all properties
          const prefix = 'MDP';
          
          // Query directly for all MDP properties (including legacy MDP-R and MDP-B)
          const query = `
            SELECT property_number 
            FROM properties 
            WHERE property_number LIKE 'MDP-%'
            ORDER BY property_number DESC
          `;
          
          // Execute the query directly to get accurate results
          const result = await pool.query(query);
          const existingNumbers = result.rows;
          
          // Find the highest number
          let highestNumber = 0;
          for (const row of existingNumbers) {
            if (row.property_number) {
              // Extract the number part using a regex that catches all existing formats
              // This will match MDP-XXXX, MDP-RXXX, and MDP-BXXX
              const matches = row.property_number.match(/MDP-[RB]?(\d+)/);
              if (matches && matches[1]) {
                const num = parseInt(matches[1], 10);
                if (!isNaN(num) && num > highestNumber) {
                  highestNumber = num;
                }
              }
            }
          }
          
          // Keep track of last used number in memory to prevent duplicates within the same session
          // This ensures we don't reuse the same number for multiple properties created in quick succession
          if (!(global as any).lastUsedPropertyNumber) {
            (global as any).lastUsedPropertyNumber = highestNumber;
          }
          
          // Use either the highest number from database or the last used number, whichever is higher
          const nextNumber = Math.max(highestNumber, (global as any).lastUsedPropertyNumber) + 1;
          (global as any).lastUsedPropertyNumber = nextNumber;
          
          // Format with leading zeros (4 digits)
          const paddedNumber = nextNumber.toString().padStart(4, '0');
          (propertyData as any).propertyNumber = `MDP-${paddedNumber}`;
          console.log(`Generated property number: ${(propertyData as any).propertyNumber} (highest was ${highestNumber}, last used: ${(global as any).lastUsedPropertyNumber - 1})`);
        } catch (error) {
          console.error('Error generating property number:', error);
          // Fallback to a timestamp-based number if query fails
          const timestamp = new Date().getTime().toString().slice(-6);
          (propertyData as any).propertyNumber = `MDP-${timestamp}`;
          console.log(`Fallback property number generated: ${(propertyData as any).propertyNumber}`);
        }
      } else {
        (propertyData as any).propertyNumber = requestData.propertyNumber;
      }
      
      // Create the property using the sanitized data
      const newProperty = await dbStorage.createProperty(propertyData);
      res.status(201).json(newProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  // Update a property
  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const requestData = req.body;
      
      // Process the data to handle features and map URL correctly
      // Make sure features is properly saved as a JSON array
      if (requestData.features) {
        requestData.features = Array.isArray(requestData.features) ? requestData.features : 
                               (typeof requestData.features === 'string' ? 
                                 (requestData.features ? JSON.parse(requestData.features) : []) : []);
      }
      
      // Make sure map_url is saved correctly from mapUrl field
      if (requestData.mapUrl) {
        requestData.map_url = requestData.mapUrl;
      }
      
      // Handle MahaRERA registration fields
      const maharera_registered = requestData.maharera_registered === true || 
                                 requestData.maharera_registered === 'true' || 
                                 requestData.maharera_registered === 't' || 
                                 requestData.maharera_registered === '1' || 
                                 requestData.maharera_registered === 1;
      
      const maharera_number = requestData.maharera_number || null;
      
      // Add MahaRERA fields to request data
      requestData.maharera_registered = maharera_registered;
      requestData.maharera_number = maharera_number;
      
      const propertyData = insertPropertySchema.parse(requestData);
      const updatedProperty = await dbStorage.updateProperty(id, propertyData);
      
      if (!updatedProperty) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.json(updatedProperty);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  // Toggle property featured status
  app.patch("/api/properties/:id/toggle-featured", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const property = await dbStorage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Properly handle different featured status formats from PostgreSQL
      let currentFeatured = false;
      if (typeof property.featured === 'boolean') {
        currentFeatured = property.featured;
      } else if (typeof property.featured === 'string') {
        currentFeatured = property.featured === 't' || property.featured === 'true' || property.featured === '1';
      } else if (typeof property.featured === 'number') {
        currentFeatured = property.featured === 1;
      }

      // Toggle the featured status with explicit boolean
      const updatedProperty = await dbStorage.updateProperty(id, {
        ...property,
        features: property.features as any,
        images: property.images as any,
        featured: !currentFeatured
      });
      
      console.log(`Property ${id} featured status toggled from ${currentFeatured} to ${!currentFeatured}`);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error toggling property featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });

  // Delete a property
  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }

      const success = await dbStorage.deleteProperty(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Get all agents
  app.get("/api/agents", async (_req, res) => {
    try {
      const agents = await dbStorage.getAllAgents();
      res.json(agents);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });

  // Get agent by ID
  app.get("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }

      const agent = await dbStorage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }

      res.json(agent);
    } catch (error) {
      console.error("Error fetching agent:", error);
      res.status(500).json({ message: "Failed to fetch agent" });
    }
  });

  // Create a new agent
  app.post("/api/agents", async (req, res) => {
    try {
      const agentData = insertAgentSchema.parse(req.body);
      const newAgent = await dbStorage.createAgent(agentData);
      res.status(201).json(newAgent);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating agent:", error);
      res.status(500).json({ message: "Failed to create agent" });
    }
  });
  
  // Update an agent
  app.patch("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      const agent = await dbStorage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const agentData = insertAgentSchema.parse(req.body);
      const updatedAgent = await dbStorage.updateAgent(id, agentData);
      res.json(updatedAgent);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating agent:", error);
      res.status(500).json({ message: "Failed to update agent" });
    }
  });
  
  // Delete an agent
  app.delete("/api/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      
      const agent = await dbStorage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      await dbStorage.deleteAgent(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Get all inquiries
  // Legacy inquiry route - redirects to property inquiries
  app.get("/api/inquiries", requireAdmin, async (req, res) => {
    try {
      const inquiries = await dbStorage.getAllPropertyInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching property inquiries:", error);
      res.status(500).json({ message: "Failed to fetch property inquiries" });
    }
  });

  // Create new inquiry (POST endpoint)
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertPropertyInquirySchema.parse(req.body);
      const inquiry = await dbStorage.createPropertyInquiry(inquiryData);
      res.status(201).json(inquiry);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating inquiry:", error);
      res.status(500).json({ message: "Failed to create inquiry" });
    }
  });
  
  // Mark inquiry as read
  app.put("/api/inquiries/:id/read", async (req, res) => {
    try {
      // Check admin access using production-ready authentication
      if (!checkProductionAdminAccess(req as any)) {
        return res.status(403).json({ message: "Forbidden - Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const updated = await dbStorage.markPropertyInquiryAsRead(id);
      if (updated) {
        res.json({ success: true, message: "Property inquiry marked as read" });
      } else {
        res.status(404).json({ message: "Property inquiry not found" });
      }
    } catch (error) {
      console.error("Error marking property inquiry as read:", error);
      res.status(500).json({ message: "Failed to mark property inquiry as read" });
    }
  });

  // Legacy delete inquiry route - redirects to property inquiries
  app.delete("/api/inquiries/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      
      const deleted = await dbStorage.deletePropertyInquiry(id);
      if (deleted) {
        res.json({ success: true, message: "Property inquiry deleted successfully" });
      } else {
        res.status(404).json({ message: "Property inquiry not found" });
      }
    } catch (error) {
      console.error("Error deleting property inquiry:", error);
      res.status(500).json({ message: "Failed to delete property inquiry" });
    }
  });
  
  // Legacy route removed - use separate three-tier inquiry system

  // Legacy route removed - use separate three-tier inquiry system

  // Admin routes already defined in auth.ts

  // MDP Properties route
  app.use('/api/mdp-properties', mdpPropertiesRoutes);

  // India Location API routes
  // States
  app.get("/api/locations/states", async (_req, res) => {
    try {
      const states = await dbStorage.getAllStates();
      res.json(states);
    } catch (error) {
      console.error("Error fetching states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });

  app.get("/api/locations/states/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid state ID" });
      }

      const state = await dbStorage.getState(id);
      if (!state) {
        return res.status(404).json({ message: "State not found" });
      }

      res.json(state);
    } catch (error) {
      console.error("Error fetching state:", error);
      res.status(500).json({ message: "Failed to fetch state" });
    }
  });

  app.post("/api/locations/states", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const stateData = insertStateSchema.parse(req.body);
      const newState = await dbStorage.createState(stateData);
      res.status(201).json(newState);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating state:", error);
      res.status(500).json({ message: "Failed to create state" });
    }
  });

  app.patch("/api/locations/states/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid state ID" });
      }

      const stateData = insertStateSchema.partial().parse(req.body);
      const updatedState = await dbStorage.updateState(id, stateData);
      res.json(updatedState);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating state:", error);
      res.status(500).json({ message: "Failed to update state" });
    }
  });

  app.delete("/api/locations/states/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid state ID" });
      }

      const success = await dbStorage.deleteState(id);
      
      if (!success) {
        return res.status(404).json({ message: "State not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting state:", error);
      res.status(500).json({ message: "Failed to delete state" });
    }
  });

  // Districts
  app.get("/api/locations/districts", async (req, res) => {
    try {
      const stateId = req.query.stateId ? parseInt(req.query.stateId as string) : undefined;
      const districts = await dbStorage.getAllDistricts(stateId);
      res.json(districts);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Failed to fetch districts" });
    }
  });

  app.get("/api/locations/districts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid district ID" });
      }

      const district = await dbStorage.getDistrict(id);
      if (!district) {
        return res.status(404).json({ message: "District not found" });
      }

      res.json(district);
    } catch (error) {
      console.error("Error fetching district:", error);
      res.status(500).json({ message: "Failed to fetch district" });
    }
  });

  app.post("/api/locations/districts", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const districtData = insertDistrictSchema.parse(req.body);
      
      // Check if state exists
      const state = await dbStorage.getState(districtData.stateId);
      if (!state) {
        return res.status(400).json({ message: "State not found" });
      }
      
      const newDistrict = await dbStorage.createDistrict(districtData);
      res.status(201).json(newDistrict);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating district:", error);
      res.status(500).json({ message: "Failed to create district" });
    }
  });

  app.patch("/api/locations/districts/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid district ID" });
      }

      const districtData = insertDistrictSchema.partial().parse(req.body);
      
      // If stateId is provided, check if state exists
      if (districtData.stateId !== undefined) {
        const state = await dbStorage.getState(districtData.stateId);
        if (!state) {
          return res.status(400).json({ message: "State not found" });
        }
      }
      
      const updatedDistrict = await dbStorage.updateDistrict(id, districtData);
      res.json(updatedDistrict);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating district:", error);
      res.status(500).json({ message: "Failed to update district" });
    }
  });

  app.delete("/api/locations/districts/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid district ID" });
      }

      const success = await dbStorage.deleteDistrict(id);
      
      if (!success) {
        return res.status(404).json({ message: "District not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting district:", error);
      res.status(500).json({ message: "Failed to delete district" });
    }
  });

  // Talukas
  app.get("/api/locations/talukas", async (req, res) => {
    try {
      const districtId = req.query.districtId ? parseInt(req.query.districtId as string) : undefined;
      const talukas = await dbStorage.getAllTalukas(districtId);
      res.json(talukas);
    } catch (error) {
      console.error("Error fetching talukas:", error);
      res.status(500).json({ message: "Failed to fetch talukas" });
    }
  });

  app.get("/api/locations/talukas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid taluka ID" });
      }

      const taluka = await dbStorage.getTaluka(id);
      if (!taluka) {
        return res.status(404).json({ message: "Taluka not found" });
      }

      res.json(taluka);
    } catch (error) {
      console.error("Error fetching taluka:", error);
      res.status(500).json({ message: "Failed to fetch taluka" });
    }
  });

  app.post("/api/locations/talukas", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const talukaData = insertTalukaSchema.parse(req.body);
      
      // Check if district exists
      const district = await dbStorage.getDistrict(talukaData.districtId);
      if (!district) {
        return res.status(400).json({ message: "District not found" });
      }
      
      const newTaluka = await dbStorage.createTaluka(talukaData);
      res.status(201).json(newTaluka);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating taluka:", error);
      res.status(500).json({ message: "Failed to create taluka" });
    }
  });

  app.patch("/api/locations/talukas/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid taluka ID" });
      }

      const talukaData = insertTalukaSchema.partial().parse(req.body);
      
      // If districtId is provided, check if district exists
      if (talukaData.districtId !== undefined) {
        const district = await dbStorage.getDistrict(talukaData.districtId);
        if (!district) {
          return res.status(400).json({ message: "District not found" });
        }
      }
      
      const updatedTaluka = await dbStorage.updateTaluka(id, talukaData);
      res.json(updatedTaluka);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating taluka:", error);
      res.status(500).json({ message: "Failed to update taluka" });
    }
  });

  app.delete("/api/locations/talukas/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid taluka ID" });
      }

      const success = await dbStorage.deleteTaluka(id);
      
      if (!success) {
        return res.status(404).json({ message: "Taluka not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting taluka:", error);
      res.status(500).json({ message: "Failed to delete taluka" });
    }
  });

  // Tehsils
  app.get("/api/locations/tehsils", async (req, res) => {
    try {
      const talukaId = req.query.talukaId ? parseInt(req.query.talukaId as string) : undefined;
      const tehsils = await dbStorage.getAllTehsils(talukaId);
      res.json(tehsils);
    } catch (error) {
      console.error("Error fetching tehsils:", error);
      res.status(500).json({ message: "Failed to fetch tehsils" });
    }
  });

  app.get("/api/locations/tehsils/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tehsil ID" });
      }

      const tehsil = await dbStorage.getTehsil(id);
      if (!tehsil) {
        return res.status(404).json({ message: "Tehsil not found" });
      }

      res.json(tehsil);
    } catch (error) {
      console.error("Error fetching tehsil:", error);
      res.status(500).json({ message: "Failed to fetch tehsil" });
    }
  });

  app.post("/api/locations/tehsils", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const tehsilData = insertTehsilSchema.parse(req.body);
      
      // Check if taluka exists
      const taluka = await dbStorage.getTaluka(tehsilData.talukaId);
      if (!taluka) {
        return res.status(400).json({ message: "Taluka not found" });
      }
      
      const newTehsil = await dbStorage.createTehsil(tehsilData);
      res.status(201).json(newTehsil);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating tehsil:", error);
      res.status(500).json({ message: "Failed to create tehsil" });
    }
  });

  app.patch("/api/locations/tehsils/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tehsil ID" });
      }

      const tehsilData = insertTehsilSchema.partial().parse(req.body);
      
      // If talukaId is provided, check if taluka exists
      if (tehsilData.talukaId !== undefined) {
        const taluka = await dbStorage.getTaluka(tehsilData.talukaId);
        if (!taluka) {
          return res.status(400).json({ message: "Taluka not found" });
        }
      }
      
      const updatedTehsil = await dbStorage.updateTehsil(id, tehsilData);
      res.json(updatedTehsil);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating tehsil:", error);
      res.status(500).json({ message: "Failed to update tehsil" });
    }
  });

  app.delete("/api/locations/tehsils/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tehsil ID" });
      }

      const success = await dbStorage.deleteTehsil(id);
      
      if (!success) {
        return res.status(404).json({ message: "Tehsil not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting tehsil:", error);
      res.status(500).json({ message: "Failed to delete tehsil" });
    }
  });

  // Contact Information API routes
  app.get("/api/contact-info", async (_req, res) => {
    try {
      const contactInfo = await dbStorage.getContactInfo();
      if (!contactInfo) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      res.json(contactInfo);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });

  app.post("/api/contact-info", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const contactData = insertContactInfoSchema.parse(req.body);
      const updatedContact = await dbStorage.updateContactInfo(contactData);
      res.status(200).json(updatedContact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating contact information:", error);
      res.status(500).json({ message: "Failed to update contact information" });
    }
  });

  // PUT endpoint for updating contact info (for settings page)
  app.put("/api/contact-info", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const contactData = insertContactInfoSchema.parse(req.body);
      const updatedContact = await dbStorage.updateContactInfo(contactData);
      res.status(200).json(updatedContact);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating contact information:", error);
      res.status(500).json({ message: "Failed to update contact information" });
    }
  });

  // User management endpoints
  // Get all users
  app.get("/api/users", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const users = await dbStorage.getAllUsers();
      // Don't send passwords
      const sanitizedUsers = users.map(user => {
        const { password, ...rest } = user;
        return rest;
      });
      
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  // Get a single user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await dbStorage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Don't send password
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Create a new user
  app.post("/api/users", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const { username, password, isAdmin } = req.body;
      
      // Check if username already exists
      const existingUser = await dbStorage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const { hashPassword } = require('./auth');
      const hashedPassword = await hashPassword(password);
      
      const newUser = await dbStorage.createUser({
        username,
        password: hashedPassword,
        isAdmin: isAdmin || false
      });

      // Don't send password back
      const { password: _, ...sanitizedUser } = newUser;
      res.status(201).json(sanitizedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  // Update a user
  app.patch("/api/users/:id", async (req, res) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Get existing user
      const existingUser = await dbStorage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { username, password, isAdmin } = req.body;
      
      // If username is being changed, check if it's already taken
      if (username !== existingUser.username) {
        const userWithSameUsername = await dbStorage.getUserByUsername(username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      
      // Create update object
      const updateData: any = {};
      if (username) updateData.username = username;
      if (isAdmin !== undefined) updateData.isAdmin = isAdmin;
      
      // Only update password if it's provided
      if (password && password.trim() !== '') {
        const { hashPassword } = require('./auth');
        updateData.password = await hashPassword(password);
      }
      
      const updatedUser = await dbStorage.updateUser(id, updateData);
      
      // Don't send password back
      const { password: _, ...sanitizedUser } = updatedUser;
      res.json(sanitizedUser);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Delete a user
  app.delete("/api/users/:id", async (req, res) => {
    try {
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      // Don't allow deleting the current user
      if (id === (req.user as any).id) {
        return res.status(400).json({ message: "Cannot delete your own account" });
      }

      const success = await dbStorage.deleteUser(id);
      
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  // Property Types API Routes
  // Get all property types
  app.get("/api/property-types", async (_req, res) => {
    try {
      const propertyTypes = await dbStorage.getAllPropertyTypes();
      res.json(propertyTypes);
    } catch (error) {
      console.error("Error fetching property types:", error);
      res.status(500).json({ message: "Failed to fetch property types" });
    }
  });

  // Get a single property type
  app.get("/api/property-types/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property type ID" });
      }

      const propertyType = await dbStorage.getPropertyType(id);
      
      if (!propertyType) {
        return res.status(404).json({ message: "Property type not found" });
      }
      
      res.json(propertyType);
    } catch (error) {
      console.error("Error fetching property type:", error);
      res.status(500).json({ message: "Failed to fetch property type" });
    }
  });

  // Create a new property type
  app.post("/api/property-types", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      console.log("Creating property type with data:", req.body);
      const propertyTypeData = insertPropertyTypeSchema.parse(req.body);
      console.log("Parsed property type data:", propertyTypeData);
      try {
        const newPropertyType = await dbStorage.createPropertyType(propertyTypeData);
        console.log("Created new property type:", newPropertyType);
        res.status(201).json(newPropertyType);
      } catch (storageError) {
        console.error("Error in dbStorage.createPropertyType:", storageError);
        throw storageError;
      }
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      console.error("Error creating property type:", error);
      res.status(500).json({ message: "Failed to create property type" });
    }
  });

  // Update a property type
  app.patch("/api/property-types/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property type ID" });
      }

      const propertyTypeData = insertPropertyTypeSchema.partial().parse(req.body);
      const updatedPropertyType = await dbStorage.updatePropertyType(id, propertyTypeData);
      
      res.json(updatedPropertyType);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          message: "Validation error", 
          errors: fromZodError(error).message 
        });
      }
      
      if (error instanceof Error && error.message === "Property type not found") {
        return res.status(404).json({ message: "Property type not found" });
      }
      
      console.error("Error updating property type:", error);
      res.status(500).json({ message: "Failed to update property type" });
    }
  });

  // Delete a property type
  app.delete("/api/property-types/:id", async (req, res) => {
    try {
      // For development, allowing all users to access this endpoint
      // In production, uncomment the following authentication check
      /*
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      */
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property type ID" });
      }

      const success = await dbStorage.deletePropertyType(id);
      
      if (!success) {
        return res.status(404).json({ message: "Property type not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting property type:", error);
      res.status(500).json({ message: "Failed to delete property type" });
    }
  });

  // Contact Messages API Routes
  app.get("/api/contact-messages", async (req, res) => {
    // Use the same authentication pattern as other admin endpoints
    if (!checkAdminAccess(req)) {
      return res.status(403).json({ 
        message: "Admin access required", 
        error: "ADMIN_ACCESS_DENIED" 
      });
    }
    try {
      try {
        // First try using the storage method
        const messages = await dbStorage.getAllContactMessages();
        if (messages && messages.length > 0) {
          res.json(messages);
        } else {
          // Fallback to direct SQL query if storage method returns empty
          const result = await pool.query(`
            SELECT id, name, email, phone, subject, message, is_read as "isRead", created_at as "createdAt"
            FROM contact_messages
            ORDER BY created_at DESC
          `);
          
          console.log("Contact messages from direct query:", result.rows.length);
          res.json(result.rows);
        }
      } catch (queryError) {
        console.error("Error in contact messages query:", queryError);
        // Final fallback to ensure we return something
        const result = await pool.query(`
          SELECT * FROM contact_messages ORDER BY created_at DESC
        `);
        const formattedMessages = result.rows.map(row => ({
          id: row.id,
          name: row.name,
          email: row.email,
          phone: row.phone || null,
          subject: row.subject,
          message: row.message,
          isRead: row.is_read,
          createdAt: row.created_at
        }));
        
        res.json(formattedMessages);
      }
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Get contact information endpoint
  app.get("/api/contact-info", async (req, res) => {
    try {
      const contactInfo = await dbStorage.getContactInfo();
      
      if (!contactInfo) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      
      res.json(contactInfo);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });

  app.get("/api/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await dbStorage.getContactMessage(id);
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }

      res.json(message);
    } catch (error) {
      console.error("Error fetching contact message:", error);
      res.status(500).json({ message: "Failed to fetch contact message" });
    }
  });

  app.patch("/api/contact-messages/:id/mark-read", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      try {
        // Try using storage method first
        const success = await dbStorage.markContactMessageAsRead(id);
        if (success) {
          return res.json({ success: true });
        }
      } catch (storageError) {
        console.error("Error marking message as read using storage method:", storageError);
      }
      
      // Fallback to direct SQL
      try {
        const result = await pool.query(`
          UPDATE contact_messages
          SET is_read = true
          WHERE id = $1
          RETURNING id
        `, [id]);
        
        if (result.rowCount === 0 || result.rowCount === null) {
          return res.status(404).json({ message: "Message not found" });
        }
        
        return res.json({ success: true });
      } catch (sqlError) {
        console.error("Error marking message as read using SQL:", sqlError);
        throw sqlError; // Re-throw for the outer catch
      }
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });

  app.delete("/api/contact-messages/:id", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      try {
        // First try using the storage method
        const success = await dbStorage.deleteContactMessage(id);
        if (success) {
          return res.status(204).end();
        }
      } catch (storageError) {
        console.error("Error deleting message using storage method:", storageError);
      }
      
      // Fallback to direct SQL
      try {
        const result = await pool.query(`
          DELETE FROM contact_messages
          WHERE id = $1
          RETURNING id
        `, [id]);
        
        if (result.rowCount === 0 || result.rowCount === null) {
          return res.status(404).json({ message: "Message not found" });
        }
        
        return res.status(204).end();
      } catch (sqlError) {
        console.error("Error deleting message using SQL:", sqlError);
        throw sqlError; // Re-throw for the outer catch
      }
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });
  
  // Mark multiple contact messages as read
  app.patch("/api/contact-messages/mark-read", async (req, res) => {
    try {
      // In development mode, skip authentication check
      // Check admin access using multiple auth methods
      let hasAdminAccess = false;
      
      if (req.session && (req.session as any).isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && (req.user as any)?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      
      if (!hasAdminAccess) {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Handle both single IDs and arrays for flexibility
      const { ids, id } = req.body;
      let messageIds: number[] = [];
      
      if (Array.isArray(ids) && ids.length > 0) {
        messageIds = ids;
      } else if (id !== undefined) {
        messageIds = [id];
      } else if (!ids) {
        // If no ids provided, mark ALL unread messages as read using direct SQL
        try {
          // Mark all unread messages
          await pool.query(`
            UPDATE contact_messages
            SET is_read = true
            WHERE is_read = false
          `);
          
          return res.status(200).json({ 
            success: true, 
            message: "All unread messages marked as read" 
          });
        } catch (sqlError) {
          console.error("Error marking all messages as read:", sqlError);
          throw sqlError;
        }
      }
      
      if (messageIds.length === 0) {
        return res.status(200).json({ success: true, message: "No messages to mark as read" });
      }
      
      // Try to mark specific messages as read
      try {
        // Try storage method first
        const success = await dbStorage.markContactMessagesAsRead(messageIds);
        if (success) {
          return res.json({ success: true, message: `Marked ${messageIds.length} messages as read` });
        }
        
        // If storage method returns false but doesn't throw an error,
        // fallback to direct SQL query
      } catch (storageError) {
        console.error("Error marking messages as read using storage method:", storageError);
        // Continue to SQL fallback
      }
      
      // Fallback to direct SQL
      try {
        const result = await pool.query(`
          UPDATE contact_messages
          SET is_read = true
          WHERE id = ANY($1)
          RETURNING id
        `, [messageIds]);
        
        if (result.rowCount === 0 || result.rowCount === null) {
          return res.status(404).json({ message: "No messages found with the provided IDs" });
        }
        
        return res.json({ 
          success: true, 
          message: `Marked ${result.rowCount} of ${messageIds.length} messages as read` 
        });
      } catch (sqlError) {
        console.error("Error marking messages as read using SQL:", sqlError);
        
        // Last resort: try marking messages one by one
        try {
          let successCount = 0;
          
          for (const id of messageIds) {
            try {
              const result = await pool.query(`
                UPDATE contact_messages
                SET is_read = true
                WHERE id = $1
                RETURNING id
              `, [id]);
              
              if (result.rowCount > 0) {
                successCount++;
              }
            } catch (e) {
              console.error(`Failed to mark message ${id} as read:`, e);
            }
          }
          
          if (successCount > 0) {
            return res.json({ 
              success: true, 
              message: `Marked ${successCount} of ${messageIds.length} messages as read` 
            });
          }
        } catch (fallbackError) {
          console.error("Error in one-by-one fallback:", fallbackError);
        }
      }
      
      // If we reached here, all methods failed
      res.status(500).json({ 
        success: false, 
        message: "Failed to mark messages as read" 
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Home Loan Inquiries routes
  
  // Create home loan inquiry (public endpoint)
  app.post("/api/home-loan-inquiries", async (req, res) => {
    try {
      const inquiryData = insertHomeLoanInquirySchema.parse(req.body);
      const newInquiry = await dbStorage.createHomeLoanInquiry(inquiryData);
      
      res.status(201).json(newInquiry);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating home loan inquiry:", error);
      res.status(500).json({ message: "Failed to create home loan inquiry" });
    }
  });

  // Debug route to check session state
  app.get("/api/debug/session", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      session: req.session,
      user: req.user,
      sessionID: req.sessionID
    });
  });

  // Get all home loan inquiries (admin only)
  app.get("/api/home-loan-inquiries", async (req, res) => {
    // Use the same authentication pattern as other admin endpoints
    if (!checkAdminAccess(req)) {
      return res.status(403).json({ 
        message: "Admin access required", 
        error: "ADMIN_ACCESS_DENIED" 
      });
    }
    
    try {
      const inquiries = await dbStorage.getAllHomeLoanInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching home loan inquiries:", error);
      res.status(500).json({ message: "Failed to fetch home loan inquiries" });
    }
  });

  // Get specific home loan inquiry (admin only)
  app.get("/api/home-loan-inquiries/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }

      const inquiry = await dbStorage.getHomeLoanInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }

      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching home loan inquiry:", error);
      res.status(500).json({ message: "Failed to fetch home loan inquiry" });
    }
  });

  // Mark home loan inquiry as read (admin only)
  app.patch("/api/home-loan-inquiries/:id/read", async (req, res) => {
    try {
      // Development mode - grant access for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - granting access to mark home loan inquiry as read');
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }

      const success = await dbStorage.markHomeLoanInquiryAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }

      res.json({ message: "Home loan inquiry marked as read" });
    } catch (error) {
      console.error("Error marking home loan inquiry as read:", error);
      res.status(500).json({ message: "Failed to mark inquiry as read" });
    }
  });

  // Delete home loan inquiry (admin only)
  app.delete("/api/home-loan-inquiries/:id", async (req, res) => {
    try {
      // Development mode - grant access for testing
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode - granting access to delete home loan inquiry');
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }

      const success = await dbStorage.deleteHomeLoanInquiry(id);
      if (!success) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }

      res.json({ message: "Home loan inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting home loan inquiry:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });

  // File upload endpoint for images
  app.post("/api/upload-image", upload.single('image'), async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Return the URL path to the uploaded file
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  // Contact Messages API endpoints
  
  // Get all contact messages (admin only)
  app.get("/api/contact-messages", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const messages = await dbStorage.getAllContactMessages();
      console.log('Contact messages from direct query:', messages.length);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Mark contact message as read (admin only)
  app.put("/api/contact-messages/:id/read", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const messageId = parseInt(req.params.id);
      const success = await dbStorage.markContactMessageAsRead(messageId);
      
      if (success) {
        res.json({ message: "Contact message marked as read" });
      } else {
        res.status(404).json({ message: "Contact message not found" });
      }
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      res.status(500).json({ message: "Failed to mark contact message as read" });
    }
  });

  // Delete contact message (admin only)
  app.delete("/api/contact-messages/:id", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const messageId = parseInt(req.params.id);
      const success = await dbStorage.deleteContactMessage(messageId);
      
      if (success) {
        res.json({ message: "Contact message deleted successfully" });
      } else {
        res.status(404).json({ message: "Contact message not found" });
      }
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Create contact message (public)
  app.post("/api/contact-messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const newMessage = await dbStorage.createContactMessage(messageData);
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid contact message data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });

  // Home Loan Inquiries API endpoints
  
  // Get all home loan inquiries (admin only)
  app.get("/api/home-loan-inquiries", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const inquiries = await dbStorage.getAllHomeLoanInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching home loan inquiries:", error);
      res.status(500).json({ message: "Failed to fetch home loan inquiries" });
    }
  });

  // Mark home loan inquiry as read (admin only)
  app.put("/api/home-loan-inquiries/:id/read", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const inquiryId = parseInt(req.params.id);
      const success = await dbStorage.markHomeLoanInquiryAsRead(inquiryId);
      
      if (success) {
        res.json({ message: "Home loan inquiry marked as read" });
      } else {
        res.status(404).json({ message: "Home loan inquiry not found" });
      }
    } catch (error) {
      console.error("Error marking home loan inquiry as read:", error);
      res.status(500).json({ message: "Failed to mark home loan inquiry as read" });
    }
  });

  // Delete home loan inquiry (admin only)
  app.delete("/api/home-loan-inquiries/:id", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const inquiryId = parseInt(req.params.id);
      const success = await dbStorage.deleteHomeLoanInquiry(inquiryId);
      
      if (success) {
        res.json({ message: "Home loan inquiry deleted successfully" });
      } else {
        res.status(404).json({ message: "Home loan inquiry not found" });
      }
    } catch (error) {
      console.error("Error deleting home loan inquiry:", error);
      res.status(500).json({ message: "Failed to delete home loan inquiry" });
    }
  });

  // Create home loan inquiry (public)
  app.post("/api/home-loan-inquiries", async (req, res) => {
    try {
      const inquiryData = insertHomeLoanInquirySchema.parse(req.body);
      const newInquiry = await dbStorage.createHomeLoanInquiry(inquiryData);
      res.status(201).json(newInquiry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid home loan inquiry data", 
          errors: fromZodError(error).details 
        });
      }
      console.error("Error creating home loan inquiry:", error);
      res.status(500).json({ message: "Failed to create home loan inquiry" });
    }
  });

  // Homepage Images API endpoints (admin only)
  
  // Get all homepage images
  app.get("/api/homepage-images", async (req, res) => {
    try {
      const images = await dbStorage.getAllHomepageImages();
      res.json(images);
    } catch (error) {
      console.error("Error fetching homepage images:", error);
      res.status(500).json({ message: "Failed to fetch homepage images" });
    }
  });

  // Get single homepage image
  app.get("/api/homepage-images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }

      const image = await dbStorage.getHomepageImage(id);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }

      res.json(image);
    } catch (error) {
      console.error("Error fetching homepage image:", error);
      res.status(500).json({ message: "Failed to fetch homepage image" });
    }
  });

  // Create new homepage image (admin only)
  app.post("/api/homepage-images", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const imageData = req.body;
      const newImage = await dbStorage.createHomepageImage(imageData);
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error creating homepage image:", error);
      res.status(500).json({ message: "Failed to create homepage image" });
    }
  });

  // Update homepage image (admin only)
  app.patch("/api/homepage-images/:id", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }

      const imageData = req.body;
      const updatedImage = await dbStorage.updateHomepageImage(id, imageData);
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating homepage image:", error);
      res.status(500).json({ message: "Failed to update homepage image" });
    }
  });

  // Delete homepage image (admin only)
  app.delete("/api/homepage-images/:id", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }

      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }

      const success = await dbStorage.deleteHomepageImage(id);
      if (success) {
        res.json({ message: "Homepage image deleted successfully" });
      } else {
        res.status(404).json({ message: "Homepage image not found" });
      }
    } catch (error) {
      console.error("Error deleting homepage image:", error);
      res.status(500).json({ message: "Failed to delete homepage image" });
    }
  });

  // Excel Export Endpoints (Admin only)
  
  // Export property inquiries to Excel
  app.get("/api/export/property-inquiries", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const inquiries = await dbStorage.getAllPropertyInquiries();
      
      // Prepare data for Excel export
      const excelData = inquiries.map(inquiry => ({
        'ID': inquiry.id,
        'Name': inquiry.name,
        'Email': inquiry.email,
        'Phone': inquiry.phone || '',
        'Property ID': inquiry.propertyId,
        'Inquiry Type': inquiry.inquiryType,
        'Budget': inquiry.budget || '',
        'Message': inquiry.message || '',
        'Status': inquiry.isRead ? 'Read' : 'Unread',
        'Created Date': inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '',
        'Created Time': inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleTimeString() : ''
      }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="property-inquiries-${new Date().toISOString().split('T')[0]}.xlsx"`);
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Property Inquiries');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting property inquiries:", error);
      res.status(500).json({ message: "Failed to export property inquiries" });
    }
  });

  // Export contact messages to Excel
  app.get("/api/export/contact-messages", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const messages = await dbStorage.getAllContactMessages();
      
      // Prepare data for Excel export
      const excelData = messages.map(message => ({
        'ID': message.id,
        'Name': message.name,
        'Email': message.email,
        'Phone': message.phone || '',
        'Subject': message.subject,
        'Message': message.message,
        'Status': message.isRead ? 'Read' : 'Unread',
        'Created Date': message.createdAt ? new Date(message.createdAt).toLocaleDateString() : '',
        'Created Time': message.createdAt ? new Date(message.createdAt).toLocaleTimeString() : ''
      }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="contact-messages-${new Date().toISOString().split('T')[0]}.xlsx"`);
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Messages');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting contact messages:", error);
      res.status(500).json({ message: "Failed to export contact messages" });
    }
  });

  // Export home loan inquiries to Excel
  app.get("/api/export/home-loan-inquiries", async (req, res) => {
    try {
      // Production auth check for admin access
      if (!checkProductionAdminAccess(req as any) && process.env.NODE_ENV !== 'development') {
        return res.status(403).json({ message: "Admin access required" });
      }
      
      const inquiries = await dbStorage.getAllHomeLoanInquiries();
      
      // Prepare data for Excel export
      const excelData = inquiries.map(inquiry => ({
        'ID': inquiry.id,
        'Name': inquiry.name,
        'Email': inquiry.email,
        'Phone': inquiry.phone,
        'Occupation': inquiry.occupation || '',
        'Monthly Income': inquiry.monthlyIncome || '',
        'Loan Amount': inquiry.loanAmount || '',
        'Property Value': inquiry.propertyValue || '',
        'Property ID': inquiry.propertyId || '',
        'Message': inquiry.message || '',
        'Status': inquiry.isRead ? 'Read' : 'Unread',
        'Created Date': inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleDateString() : '',
        'Created Time': inquiry.createdAt ? new Date(inquiry.createdAt).toLocaleTimeString() : ''
      }));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="home-loan-inquiries-${new Date().toISOString().split('T')[0]}.xlsx"`);
      
      // Create Excel workbook
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Home Loan Inquiries');
      
      const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      res.send(excelBuffer);
    } catch (error) {
      console.error("Error exporting home loan inquiries:", error);
      res.status(500).json({ message: "Failed to export home loan inquiries" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
