import {
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  agents, type Agent, type InsertAgent,
  inquiries, type Inquiry, type InsertInquiry
} from "@shared/schema";
import { getPropertyImage, getAgentImage, getInteriorImage } from "../client/src/lib/utils";

// Property filters interface
interface PropertyFilters {
  type?: string;
  propertyType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  minBeds?: number;
  minBaths?: number;
  featured?: boolean;
}

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Property methods
  getAllProperties(filters?: PropertyFilters): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: InsertProperty): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  countPropertiesByType(propertyType: string): Promise<number>;
  
  // Agent methods
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  
  // Inquiry methods
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private agents: Map<number, Agent>;
  private inquiries: Map<number, Inquiry>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private agentIdCounter: number;
  private inquiryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.agents = new Map();
    this.inquiries = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.agentIdCounter = 1;
    this.inquiryIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  // Initialize sample data
  private initSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      isAdmin: true
    });
    
    // Create sample agents
    const agentTitles = [
      "Luxury Property Specialist",
      "Urban Property Expert",
      "Commercial Specialist",
      "First-time Buyer Expert"
    ];
    
    for (let i = 0; i < 4; i++) {
      this.createAgent({
        name: [
          "Jessica Williams",
          "Michael Chen",
          "Robert Taylor",
          "Sarah Johnson"
        ][i],
        title: agentTitles[i],
        image: getAgentImage(i),
        deals: 75 + Math.floor(Math.random() * 50),
        rating: 4.5 + (Math.random() * 0.5)
      });
    }
    
    // Create sample properties
    const propertyTitles = [
      "Modern Luxury Villa",
      "Downtown Apartment",
      "Suburban Family Home",
      "Luxury Penthouse",
      "Beachfront Villa",
      "Minimalist Modern Home"
    ];
    
    const locations = ["Beverly Hills, CA", "San Francisco, CA", "Austin, TX", "New York, NY", "Malibu, CA", "Seattle, WA"];
    const addresses = [
      "123 Luxury Lane, Beverly Hills, CA 90210",
      "456 Downtown Ave, San Francisco, CA 94105",
      "789 Suburban Dr, Austin, TX 78701",
      "101 Penthouse Blvd, New York, NY 10001",
      "202 Beachfront Way, Malibu, CA 90265",
      "303 Modern St, Seattle, WA 98101"
    ];
    
    const prices = [2850000, 775000, 925000, 1950000, 3500000, 1375000];
    const beds = [5, 2, 4, 3, 6, 3];
    const baths = [6, 2, 3, 3.5, 7, 2.5];
    const areas = [6500, 1200, 2800, 3200, 7500, 2400];
    
    for (let i = 0; i < 6; i++) {
      const propertyType = i % 2 === 0 ? "House" : (i % 3 === 0 ? "Apartment" : (i % 4 === 0 ? "Commercial" : "Villa"));
      const status = i % 5 === 0 ? "sold" : (i % 3 === 0 ? "pending" : "active");
      const date = new Date();
      date.setDate(date.getDate() - (i * 2)); // Create dates ranging from today to 10 days ago
      
      this.createProperty({
        title: propertyTitles[i],
        description: `This beautiful ${propertyType.toLowerCase()} features ${beds[i]} bedrooms, ${baths[i]} bathrooms, and ${areas[i]} square feet of living space. Located in ${locations[i]}, it offers modern amenities and a great location.`,
        price: prices[i],
        location: locations[i],
        address: addresses[i],
        beds: beds[i],
        baths: baths[i],
        area: areas[i],
        propertyType: propertyType,
        status: status,
        featured: i < 2, // First two properties are featured
        images: [
          getPropertyImage(i),
          getPropertyImage((i + 1) % 6),
          getInteriorImage(i % 4),
          getInteriorImage((i + 1) % 4)
        ],
        agentId: (i % 4) + 1,
        createdAt: date.toISOString()
      });
    }
    
    // Create sample inquiries
    const inquiryNames = ["Emily Robertson", "David Wilson", "Thomas Anderson"];
    const inquiryEmails = ["emily.r@example.com", "david.w@example.com", "thomas.a@example.com"];
    const inquiryMessages = [
      "I'd like to schedule a viewing this weekend if possible. Is the property still available?",
      "What are the HOA fees for this property? Also, is parking included?",
      "I'm an investor looking for properties in this area. Is the seller open to negotiations?"
    ];
    
    for (let i = 0; i < 3; i++) {
      const date = new Date();
      date.setHours(date.getHours() - (i * 5)); // Create dates from a few hours ago to a day ago
      
      this.createInquiry({
        name: inquiryNames[i],
        email: inquiryEmails[i],
        message: inquiryMessages[i],
        propertyId: i + 1,
        createdAt: date.toISOString()
      });
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Property methods
  async getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
    let properties = Array.from(this.properties.values());
    
    if (filters) {
      if (filters.type === "rent") {
        // Filter to only show rental properties
        properties = properties.filter(p => p.propertyType === "Apartment" || p.price < 5000);
      }
      
      if (filters.propertyType) {
        properties = properties.filter(p => p.propertyType === filters.propertyType);
      }
      
      if (filters.location) {
        const locationLower = filters.location.toLowerCase();
        properties = properties.filter(p => 
          p.location.toLowerCase().includes(locationLower) || 
          p.address.toLowerCase().includes(locationLower)
        );
      }
      
      if (filters.minPrice !== undefined) {
        properties = properties.filter(p => p.price >= filters.minPrice!);
      }
      
      if (filters.maxPrice !== undefined) {
        properties = properties.filter(p => p.price <= filters.maxPrice!);
      }
      
      if (filters.minBeds !== undefined) {
        properties = properties.filter(p => p.beds >= filters.minBeds!);
      }
      
      if (filters.minBaths !== undefined) {
        properties = properties.filter(p => p.baths >= filters.minBaths!);
      }
      
      if (filters.featured !== undefined) {
        properties = properties.filter(p => p.featured === filters.featured);
      }
    }
    
    // Sort by newest first (by default)
    return properties.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const property: Property = { ...insertProperty, id };
    this.properties.set(id, property);
    return property;
  }

  async updateProperty(id: number, updateProperty: InsertProperty): Promise<Property | undefined> {
    const existingProperty = this.properties.get(id);
    
    if (!existingProperty) {
      return undefined;
    }
    
    const updatedProperty: Property = { ...updateProperty, id };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  async countPropertiesByType(propertyType: string): Promise<number> {
    return Array.from(this.properties.values()).filter(
      p => p.propertyType === propertyType
    ).length;
  }

  // Agent methods
  async getAllAgents(): Promise<Agent[]> {
    return Array.from(this.agents.values());
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.get(id);
  }

  async createAgent(insertAgent: InsertAgent): Promise<Agent> {
    const id = this.agentIdCounter++;
    const agent: Agent = { ...insertAgent, id };
    this.agents.set(id, agent);
    return agent;
  }

  // Inquiry methods
  async getAllInquiries(): Promise<Inquiry[]> {
    // Sort by newest first
    return Array.from(this.inquiries.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    return this.inquiries.get(id);
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const id = this.inquiryIdCounter++;
    const inquiry: Inquiry = { ...insertInquiry, id };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
}

export const storage = new MemStorage();
