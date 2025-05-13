import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPropertySchema, 
  insertAgentSchema, 
  insertInquirySchema,
  insertStateSchema,
  insertDistrictSchema,
  insertTalukaSchema,
  insertTehsilSchema,
  insertContactInfoSchema,
  PROPERTY_TYPES,
  PROPERTY_STATUS
} from "@shared/schema";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, hashPassword } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Contact form schema
  const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    message: z.string().min(10, "Message must be at least 10 characters"),
    subject: z.string().min(3, "Subject must be at least 3 characters")
  });
  
  // Contact form endpoint
  app.post("/api/contact", async (req, res) => {
    try {
      const contactData = contactFormSchema.parse(req.body);
      
      // Here you would typically send an email using a service like SendGrid
      // For now, we'll just return success
      console.log("Contact form submission:", contactData);
      
      // Simulate a slight delay for network effect
      await new Promise(resolve => setTimeout(resolve, 500));
      
      res.status(200).json({ success: true, message: "Message received successfully" });
    } catch (error) {
      if (error instanceof ZodError) {
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
      const counts = await Promise.all(
        PROPERTY_TYPES.map(async (type) => {
          const count = await storage.countPropertiesByType(type);
          return { propertyType: type, count };
        })
      );
      
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

  // Create a new property
  app.post("/api/properties", async (req, res) => {
    try {
      const propertyData = insertPropertySchema.parse(req.body);
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

  // Create a new inquiry
  app.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        createdAt: new Date().toISOString()
      });
      
      const newInquiry = await storage.createInquiry(inquiryData);
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

  const httpServer = createServer(app);
  return httpServer;
}
