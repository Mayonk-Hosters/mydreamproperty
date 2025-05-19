import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { 
  insertPropertySchema, 
  insertAgentSchema, 
  insertInquirySchema,
  insertStateSchema,
  insertDistrictSchema,
  insertTalukaSchema,
  insertTehsilSchema,
  insertContactInfoSchema,
  insertPropertyTypeSchema,
  insertContactMessageSchema,
  DEFAULT_PROPERTY_TYPES,
  PROPERTY_STATUS
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { setupAdminLogin } from "./admin-login";
import { authStorage } from "./auth-storage";
import { sendInquiryNotification } from "./email-service";
import neighborhoodsRoutes from "./routes/neighborhoods";
import cookieParser from "cookie-parser";
import session from "express-session";
import passport from "passport";

import mdpPropertiesRoutes from './routes/mdp-properties';
import { eq, like } from 'drizzle-orm';

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure cookie parser
  app.use(cookieParser());
  
  // Configure session
  app.use(session({
    secret: process.env.SESSION_SECRET || 'local-dev-secret',
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    }
  }));
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Setup authentication routes
  await setupAuth(app);
  
  // Setup admin login routes
  setupAdminLogin(app);
  
  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      // Use auth storage for authentication-related queries
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
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
      const newMessage = await storage.createContactMessage(contactData);
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
        featured
      } = req.query;

      // Get all properties with filters applied
      const properties = await storage.getAllProperties({
        type: type as string,
        propertyType: propertyType as string,
        location: location as string,
        minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
        minBeds: minBeds ? parseInt(minBeds as string) : undefined,
        minBaths: minBaths ? parseFloat(minBaths as string) : undefined,
        featured: featured === "true"
      });

      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  // Get property counts by type
  app.get("/api/properties/counts-by-type", async (_req, res) => {
    try {
      // Always use the default property types for now, until we've fixed all the property type issues
      const counts = await Promise.all(
        DEFAULT_PROPERTY_TYPES.map(async (type) => {
          const count = await storage.countPropertiesByType(type);
          return { propertyType: type, count };
        })
      );
      return res.json(counts);
      
      /* 
      // This code will be uncommented later when property types are fully implemented
      // Use the dynamic property types from database
      const propertyTypes = await storage.getAllPropertyTypes();
      
      if (propertyTypes.length === 0) {
        // Fallback to default property types if none exist in database
        const counts = await Promise.all(
          DEFAULT_PROPERTY_TYPES.map(async (type) => {
            const count = await storage.countPropertiesByType(type);
            return { propertyType: type, count };
          })
        );
        return res.json(counts);
      }
      
      // Use the actual property types from the database
      const counts = await Promise.all(
        propertyTypes.map(async (propertyType) => {
          const count = await storage.countPropertiesByType(propertyType.name);
          return { propertyType: propertyType.name, count };
        })
      );
      
      res.json(counts);
      */
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

      const property = await storage.getProperty(id);
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
        featured: Boolean(requestData.featured),
        images: Array.isArray(requestData.images) ? requestData.images : [],
        agentId: Number(requestData.agentId) || 1
      };
      
      // Add optional location fields if provided
      if (requestData.stateId) {
        propertyData.stateId = Number(requestData.stateId);
      }
      
      if (requestData.districtId) {
        propertyData.districtId = Number(requestData.districtId);
      }
      
      if (requestData.talukaId) {
        propertyData.talukaId = Number(requestData.talukaId);
      }
      
      if (requestData.tehsilId) {
        propertyData.tehsilId = Number(requestData.tehsilId);
      }
      
      // Generate property number if not provided
      if (!requestData.propertyNumber) {
        try {
          // Check property type to determine prefix (MDP-B for buy, MDP-R for rent)
          const prefix = propertyData.type === 'rent' ? 'MDP-R' : 'MDP-B';
          
          // Query directly for properties with this property type and prefix
          const query = `
            SELECT property_number 
            FROM properties 
            WHERE property_number LIKE '${prefix}-%'
            ORDER BY property_number DESC
          `;
          
          // Execute the query directly to get accurate results
          const result = await pool.query(query);
          const existingNumbers = result.rows;
          
          // Find the highest number
          let highestNumber = 0;
          for (const row of existingNumbers) {
            if (row.property_number) {
              // Extract the number part using a regex
              const matches = row.property_number.match(`${prefix}-(\\d+)`);
              if (matches && matches[1]) {
                const num = parseInt(matches[1], 10);
                if (!isNaN(num) && num > highestNumber) {
                  highestNumber = num;
                }
              }
            }
          }
          
          // Generate sequential number with leading zeros (next number after highest found)
          const nextNumber = highestNumber + 1;
          const paddedNumber = nextNumber.toString().padStart(3, '0');
          propertyData.propertyNumber = `${prefix}-${paddedNumber}`;
          console.log(`Generated property number: ${propertyData.propertyNumber} (highest was ${highestNumber})`);
        } catch (error) {
          console.error('Error generating property number:', error);
          // Fallback to a timestamp-based number if query fails
          const timestamp = new Date().getTime().toString().slice(-6);
          const prefix = propertyData.type === 'rent' ? 'MDP-R' : 'MDP-B';
          propertyData.propertyNumber = `${prefix}-${timestamp}`;
          console.log(`Fallback property number generated: ${propertyData.propertyNumber}`);
        }
      } else {
        propertyData.propertyNumber = requestData.propertyNumber;
      }
      
      // Create the property using the sanitized data
      const newProperty = await storage.createProperty(propertyData);
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

      const propertyData = insertPropertySchema.parse(req.body);
      const updatedProperty = await storage.updateProperty(id, propertyData);
      
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

      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      // Toggle the featured status
      const updatedProperty = await storage.updateProperty(id, {
        ...property,
        featured: !property.featured
      });
      
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

      const success = await storage.deleteProperty(id);
      
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
      const agents = await storage.getAllAgents();
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

      const agent = await storage.getAgent(id);
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
      const newAgent = await storage.createAgent(agentData);
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
      
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      const agentData = insertAgentSchema.parse(req.body);
      const updatedAgent = await storage.updateAgent(id, agentData);
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
      
      const agent = await storage.getAgent(id);
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      
      await storage.deleteAgent(id);
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Failed to delete agent" });
    }
  });

  // Get all inquiries
  app.get("/api/inquiries", async (_req, res) => {
    try {
      const inquiries = await storage.getAllInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });
  
  // Mark multiple inquiries as read
  app.patch("/api/inquiries/mark-read", async (req, res) => {
    try {
      // In development mode, skip authentication check
      if (process.env.NODE_ENV !== "development") {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      // Handle both single IDs and arrays for flexibility
      const { ids, id } = req.body;
      let inquiryIds: number[] = [];
      
      if (Array.isArray(ids) && ids.length > 0) {
        inquiryIds = ids;
      } else if (id !== undefined) {
        inquiryIds = [id];
      } else if (!ids) {
        // If no ids provided, mark ALL unread inquiries as read
        const inquiries = await storage.getAllInquiries();
        inquiryIds = inquiries
          .filter(inq => !inq.isRead)
          .map(inq => inq.id);
      }
      
      if (inquiryIds.length === 0) {
        return res.status(200).json({ success: true, message: "No inquiries to mark as read" });
      }
      
      // Mark each inquiry as read
      const results = await Promise.all(inquiryIds.map(async (id: number) => {
        return await storage.markInquiryAsRead(id);
      }));
      
      const successCount = results.filter(success => success).length;
      
      console.log(`Marked ${successCount} of ${inquiryIds.length} inquiries as read`);
      res.status(200).json({ 
        success: true, 
        message: `Marked ${successCount} of ${inquiryIds.length} inquiries as read` 
      });
    } catch (error) {
      console.error("Error marking inquiries as read:", error);
      res.status(500).json({ message: "Failed to mark inquiries as read" });
    }
  });

  // Create a new inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        createdAt: new Date().toISOString()
      });
      
      const newInquiry = await storage.createInquiry(inquiryData);
      
      // If property ID is provided, fetch property title for the email
      let propertyTitle;
      if (inquiryData.propertyId) {
        const property = await storage.getProperty(inquiryData.propertyId);
        if (property) {
          propertyTitle = property.title;
        }
      }
      
      // Send email notification to admin
      try {
        await sendInquiryNotification(newInquiry, propertyTitle);
        console.log(`Email notification sent for inquiry ID: ${newInquiry.id}`);
      } catch (emailError) {
        // Log the error but don't fail the API response
        console.error("Failed to send email notification:", emailError);
      }
      
      res.status(201).json(newInquiry);
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

  // Admin routes already defined in auth.ts

  // MDP Properties route
  app.use('/api/mdp-properties', mdpPropertiesRoutes);

  // India Location API routes
  // States
  app.get("/api/locations/states", async (_req, res) => {
    try {
      const states = await storage.getAllStates();
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

      const state = await storage.getState(id);
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
      const newState = await storage.createState(stateData);
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
      const updatedState = await storage.updateState(id, stateData);
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

      const success = await storage.deleteState(id);
      
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
      const districts = await storage.getAllDistricts(stateId);
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

      const district = await storage.getDistrict(id);
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
      const state = await storage.getState(districtData.stateId);
      if (!state) {
        return res.status(400).json({ message: "State not found" });
      }
      
      const newDistrict = await storage.createDistrict(districtData);
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
        const state = await storage.getState(districtData.stateId);
        if (!state) {
          return res.status(400).json({ message: "State not found" });
        }
      }
      
      const updatedDistrict = await storage.updateDistrict(id, districtData);
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

      const success = await storage.deleteDistrict(id);
      
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
      const talukas = await storage.getAllTalukas(districtId);
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

      const taluka = await storage.getTaluka(id);
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
      const district = await storage.getDistrict(talukaData.districtId);
      if (!district) {
        return res.status(400).json({ message: "District not found" });
      }
      
      const newTaluka = await storage.createTaluka(talukaData);
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
        const district = await storage.getDistrict(talukaData.districtId);
        if (!district) {
          return res.status(400).json({ message: "District not found" });
        }
      }
      
      const updatedTaluka = await storage.updateTaluka(id, talukaData);
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

      const success = await storage.deleteTaluka(id);
      
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
      const tehsils = await storage.getAllTehsils(talukaId);
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

      const tehsil = await storage.getTehsil(id);
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
      const taluka = await storage.getTaluka(tehsilData.talukaId);
      if (!taluka) {
        return res.status(400).json({ message: "Taluka not found" });
      }
      
      const newTehsil = await storage.createTehsil(tehsilData);
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
        const taluka = await storage.getTaluka(tehsilData.talukaId);
        if (!taluka) {
          return res.status(400).json({ message: "Taluka not found" });
        }
      }
      
      const updatedTehsil = await storage.updateTehsil(id, tehsilData);
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

      const success = await storage.deleteTehsil(id);
      
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
      const contactInfo = await storage.getContactInfo();
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
      if (process.env.NODE_ENV !== "development") {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const contactData = insertContactInfoSchema.parse(req.body);
      const updatedContact = await storage.updateContactInfo(contactData);
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
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const users = await storage.getAllUsers();
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

      const user = await storage.getUser(id);
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
      // Check if user is authenticated and is an admin
      if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const { username, password, isAdmin } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Hash password
      const { hashPassword } = require('./auth');
      const hashedPassword = await hashPassword(password);
      
      const newUser = await storage.createUser({
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
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }

      const { username, password, isAdmin } = req.body;
      
      // If username is being changed, check if it's already taken
      if (username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(username);
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
      
      const updatedUser = await storage.updateUser(id, updateData);
      
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

      const success = await storage.deleteUser(id);
      
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
      const propertyTypes = await storage.getAllPropertyTypes();
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

      const propertyType = await storage.getPropertyType(id);
      
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
        const newPropertyType = await storage.createPropertyType(propertyTypeData);
        console.log("Created new property type:", newPropertyType);
        res.status(201).json(newPropertyType);
      } catch (storageError) {
        console.error("Error in storage.createPropertyType:", storageError);
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
      const updatedPropertyType = await storage.updatePropertyType(id, propertyTypeData);
      
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

      const success = await storage.deletePropertyType(id);
      
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
    try {
      // In development mode, skip authentication check
      if (process.env.NODE_ENV !== "development") {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      try {
        // First try using the storage method
        const messages = await storage.getAllContactMessages();
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

  app.get("/api/contact-messages/:id", async (req, res) => {
    try {
      // In development mode, skip authentication check
      if (process.env.NODE_ENV !== "development") {
        // Check for admin authentication in production
        if (!req.isAuthenticated() || !(req.user as any)?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }

      const message = await storage.getContactMessage(id);
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
      if (process.env.NODE_ENV !== "development") {
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
        const success = await storage.markContactMessageAsRead(id);
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
        
        if (result.rowCount === 0) {
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
      if (process.env.NODE_ENV !== "development") {
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
        const success = await storage.deleteContactMessage(id);
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
        
        if (result.rowCount === 0) {
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
      if (process.env.NODE_ENV !== "development") {
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
        // If no ids provided, mark ALL unread messages as read
        // Direct SQL query to get unread messages
        const result = await pool.query(`
          SELECT id FROM contact_messages WHERE is_read = false
        `);
        
        messageIds = result.rows.map(row => row.id);
      }
      
      if (messageIds.length === 0) {
        return res.status(200).json({ success: true, message: "No messages to mark as read" });
      }
      
      // Mark each message as read
      const results = await Promise.all(messageIds.map(async (id: number) => {
        return await storage.markContactMessageAsRead(id);
      }));
      
      const successCount = results.filter(success => success).length;
      
      console.log(`Marked ${successCount} of ${messageIds.length} messages as read`);
      res.status(200).json({ 
        success: true, 
        message: `Marked ${successCount} of ${messageIds.length} messages as read` 
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });

  // Neighborhoods API
  app.use('/api/neighborhoods', neighborhoodsRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
