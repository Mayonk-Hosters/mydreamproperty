import {
  users, type User, type InsertUser,
  properties, type Property, type InsertProperty,
  agents, type Agent, type InsertAgent,
  inquiries, type Inquiry, type InsertInquiry,
  states, type State, type InsertState,
  districts, type District, type InsertDistrict,
  talukas, type Taluka, type InsertTaluka,
  tehsils, type Tehsil, type InsertTehsil
} from "@shared/schema";
import { getPropertyImage, getAgentImage, getInteriorImage } from "../client/src/lib/utils";
import session from "express-session";
import connectPg from "connect-pg-simple";

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
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;
  
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
  updateAgent(id: number, agent: InsertAgent): Promise<Agent>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Inquiry methods
  getAllInquiries(): Promise<Inquiry[]>;
  getInquiry(id: number): Promise<Inquiry | undefined>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  
  // India location methods
  // States
  getAllStates(): Promise<State[]>;
  getState(id: number): Promise<State | undefined>;
  createState(state: InsertState): Promise<State>;
  updateState(id: number, state: Partial<InsertState>): Promise<State>;
  deleteState(id: number): Promise<boolean>;
  
  // Districts
  getAllDistricts(stateId?: number): Promise<District[]>;
  getDistrict(id: number): Promise<District | undefined>;
  createDistrict(district: InsertDistrict): Promise<District>;
  updateDistrict(id: number, district: Partial<InsertDistrict>): Promise<District>;
  deleteDistrict(id: number): Promise<boolean>;
  
  // Talukas
  getAllTalukas(districtId?: number): Promise<Taluka[]>;
  getTaluka(id: number): Promise<Taluka | undefined>;
  createTaluka(taluka: InsertTaluka): Promise<Taluka>;
  updateTaluka(id: number, taluka: Partial<InsertTaluka>): Promise<Taluka>;
  deleteTaluka(id: number): Promise<boolean>;
  
  // Tehsils
  getAllTehsils(talukaId?: number): Promise<Tehsil[]>;
  getTehsil(id: number): Promise<Tehsil | undefined>;
  createTehsil(tehsil: InsertTehsil): Promise<Tehsil>;
  updateTehsil(id: number, tehsil: Partial<InsertTehsil>): Promise<Tehsil>;
  deleteTehsil(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private agents: Map<number, Agent>;
  private inquiries: Map<number, Inquiry>;
  private states: Map<number, State>;
  private districts: Map<number, District>;
  private talukas: Map<number, Taluka>;
  private tehsils: Map<number, Tehsil>;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private agentIdCounter: number;
  private inquiryIdCounter: number;
  private stateIdCounter: number;
  private districtIdCounter: number;
  private talukaIdCounter: number;
  private tehsilIdCounter: number;
  
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.agents = new Map();
    this.inquiries = new Map();
    this.states = new Map();
    this.districts = new Map();
    this.talukas = new Map();
    this.tehsils = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.agentIdCounter = 1;
    this.inquiryIdCounter = 1;
    this.stateIdCounter = 1;
    this.districtIdCounter = 1;
    this.talukaIdCounter = 1;
    this.tehsilIdCounter = 1;
    
    // Initialize memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
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
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, user);
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const existingUser = this.users.get(id);
    
    if (!existingUser) {
      throw new Error("User not found");
    }
    
    const updatedUser = {
      ...existingUser,
      ...userData
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
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
  
  // India Location methods
  // States
  async getAllStates(): Promise<State[]> {
    return Array.from(this.states.values());
  }
  
  async getState(id: number): Promise<State | undefined> {
    return this.states.get(id);
  }
  
  async createState(state: InsertState): Promise<State> {
    const id = this.stateIdCounter++;
    const newState: State = { ...state, id };
    this.states.set(id, newState);
    return newState;
  }
  
  async updateState(id: number, stateData: Partial<InsertState>): Promise<State> {
    const existingState = this.states.get(id);
    
    if (!existingState) {
      throw new Error("State not found");
    }
    
    const updatedState: State = { ...existingState, ...stateData };
    this.states.set(id, updatedState);
    return updatedState;
  }
  
  async deleteState(id: number): Promise<boolean> {
    return this.states.delete(id);
  }
  
  // Districts
  async getAllDistricts(stateId?: number): Promise<District[]> {
    if (stateId !== undefined) {
      return Array.from(this.districts.values()).filter(
        district => district.stateId === stateId
      );
    }
    return Array.from(this.districts.values());
  }
  
  async getDistrict(id: number): Promise<District | undefined> {
    return this.districts.get(id);
  }
  
  async createDistrict(district: InsertDistrict): Promise<District> {
    const id = this.districtIdCounter++;
    const newDistrict: District = { ...district, id };
    this.districts.set(id, newDistrict);
    return newDistrict;
  }
  
  async updateDistrict(id: number, districtData: Partial<InsertDistrict>): Promise<District> {
    const existingDistrict = this.districts.get(id);
    
    if (!existingDistrict) {
      throw new Error("District not found");
    }
    
    const updatedDistrict: District = { ...existingDistrict, ...districtData };
    this.districts.set(id, updatedDistrict);
    return updatedDistrict;
  }
  
  async deleteDistrict(id: number): Promise<boolean> {
    return this.districts.delete(id);
  }
  
  // Talukas
  async getAllTalukas(districtId?: number): Promise<Taluka[]> {
    if (districtId !== undefined) {
      return Array.from(this.talukas.values()).filter(
        taluka => taluka.districtId === districtId
      );
    }
    return Array.from(this.talukas.values());
  }
  
  async getTaluka(id: number): Promise<Taluka | undefined> {
    return this.talukas.get(id);
  }
  
  async createTaluka(taluka: InsertTaluka): Promise<Taluka> {
    const id = this.talukaIdCounter++;
    const newTaluka: Taluka = { ...taluka, id };
    this.talukas.set(id, newTaluka);
    return newTaluka;
  }
  
  async updateTaluka(id: number, talukaData: Partial<InsertTaluka>): Promise<Taluka> {
    const existingTaluka = this.talukas.get(id);
    
    if (!existingTaluka) {
      throw new Error("Taluka not found");
    }
    
    const updatedTaluka: Taluka = { ...existingTaluka, ...talukaData };
    this.talukas.set(id, updatedTaluka);
    return updatedTaluka;
  }
  
  async deleteTaluka(id: number): Promise<boolean> {
    return this.talukas.delete(id);
  }
  
  // Tehsils
  async getAllTehsils(talukaId?: number): Promise<Tehsil[]> {
    if (talukaId !== undefined) {
      return Array.from(this.tehsils.values()).filter(
        tehsil => tehsil.talukaId === talukaId
      );
    }
    return Array.from(this.tehsils.values());
  }
  
  async getTehsil(id: number): Promise<Tehsil | undefined> {
    return this.tehsils.get(id);
  }
  
  async createTehsil(tehsil: InsertTehsil): Promise<Tehsil> {
    const id = this.tehsilIdCounter++;
    const newTehsil: Tehsil = { ...tehsil, id };
    this.tehsils.set(id, newTehsil);
    return newTehsil;
  }
  
  async updateTehsil(id: number, tehsilData: Partial<InsertTehsil>): Promise<Tehsil> {
    const existingTehsil = this.tehsils.get(id);
    
    if (!existingTehsil) {
      throw new Error("Tehsil not found");
    }
    
    const updatedTehsil: Tehsil = { ...existingTehsil, ...tehsilData };
    this.tehsils.set(id, updatedTehsil);
    return updatedTehsil;
  }
  
  async deleteTehsil(id: number): Promise<boolean> {
    return this.tehsils.delete(id);
  }
}

// Database implementation
import { db, pool } from "./db";
import { eq, like, gte, lte, and, desc, asc, sql, or } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    // Setup PostgreSQL session store
    const PostgresStore = connectPg(session);
    this.sessionStore = new PostgresStore({
      pool,
      createTableIfMissing: true,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }
  
  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Property methods
  async getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
    let query = db.select().from(properties);
    
    if (filters) {
      const conditions = [];
      
      if (filters.type === "rent") {
        conditions.push(
          or(
            eq(properties.propertyType, "Apartment"),
            lte(properties.price, 5000)
          )
        );
      }
      
      if (filters.propertyType) {
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      
      if (filters.location) {
        conditions.push(
          or(
            like(properties.location, `%${filters.location}%`),
            like(properties.address, `%${filters.location}%`)
          )
        );
      }
      
      if (filters.minPrice !== undefined) {
        conditions.push(gte(properties.price, filters.minPrice));
      }
      
      if (filters.maxPrice !== undefined) {
        conditions.push(lte(properties.price, filters.maxPrice));
      }
      
      if (filters.minBeds !== undefined) {
        conditions.push(gte(properties.beds, filters.minBeds));
      }
      
      if (filters.minBaths !== undefined) {
        conditions.push(gte(properties.baths, filters.minBaths));
      }
      
      if (filters.featured !== undefined) {
        conditions.push(eq(properties.featured, filters.featured));
      }
      
      if (conditions.length > 0) {
        query = query.where(and(...conditions));
      }
    }
    
    // Sort by newest first
    return await query.orderBy(desc(properties.createdAt));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: number, property: InsertProperty): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set(property)
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  async countPropertiesByType(propertyType: string): Promise<number> {
    const [result] = await db
      .select({ count: sql<number>`count(*)` })
      .from(properties)
      .where(eq(properties.propertyType, propertyType));
    
    return result?.count || 0;
  }
  
  // Agent methods
  async getAllAgents(): Promise<Agent[]> {
    return await db.select().from(agents);
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    const [agent] = await db.select().from(agents).where(eq(agents.id, id));
    return agent;
  }

  async createAgent(agent: InsertAgent): Promise<Agent> {
    const [newAgent] = await db.insert(agents).values(agent).returning();
    return newAgent;
  }
  
  // Inquiry methods
  async getAllInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const [newInquiry] = await db.insert(inquiries).values(inquiry).returning();
    return newInquiry;
  }
  
  // India location methods
  // States
  async getAllStates(): Promise<State[]> {
    return await db.select().from(states).orderBy(asc(states.name));
  }
  
  async getState(id: number): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }
  
  async createState(state: InsertState): Promise<State> {
    const [newState] = await db.insert(states).values(state).returning();
    return newState;
  }
  
  async updateState(id: number, stateData: Partial<InsertState>): Promise<State> {
    const [updatedState] = await db
      .update(states)
      .set(stateData)
      .where(eq(states.id, id))
      .returning();
      
    if (!updatedState) {
      throw new Error("State not found");
    }
    
    return updatedState;
  }
  
  async deleteState(id: number): Promise<boolean> {
    const result = await db.delete(states).where(eq(states.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Districts
  async getAllDistricts(stateId?: number): Promise<District[]> {
    if (stateId) {
      return await db
        .select()
        .from(districts)
        .where(eq(districts.stateId, stateId))
        .orderBy(asc(districts.name));
    }
    return await db.select().from(districts).orderBy(asc(districts.name));
  }
  
  async getDistrict(id: number): Promise<District | undefined> {
    const [district] = await db.select().from(districts).where(eq(districts.id, id));
    return district;
  }
  
  async createDistrict(district: InsertDistrict): Promise<District> {
    const [newDistrict] = await db.insert(districts).values(district).returning();
    return newDistrict;
  }
  
  async updateDistrict(id: number, districtData: Partial<InsertDistrict>): Promise<District> {
    const [updatedDistrict] = await db
      .update(districts)
      .set(districtData)
      .where(eq(districts.id, id))
      .returning();
      
    if (!updatedDistrict) {
      throw new Error("District not found");
    }
    
    return updatedDistrict;
  }
  
  async deleteDistrict(id: number): Promise<boolean> {
    const result = await db.delete(districts).where(eq(districts.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Talukas
  async getAllTalukas(districtId?: number): Promise<Taluka[]> {
    if (districtId) {
      return await db
        .select()
        .from(talukas)
        .where(eq(talukas.districtId, districtId))
        .orderBy(asc(talukas.name));
    }
    return await db.select().from(talukas).orderBy(asc(talukas.name));
  }
  
  async getTaluka(id: number): Promise<Taluka | undefined> {
    const [taluka] = await db.select().from(talukas).where(eq(talukas.id, id));
    return taluka;
  }
  
  async createTaluka(taluka: InsertTaluka): Promise<Taluka> {
    const [newTaluka] = await db.insert(talukas).values(taluka).returning();
    return newTaluka;
  }
  
  async updateTaluka(id: number, talukaData: Partial<InsertTaluka>): Promise<Taluka> {
    const [updatedTaluka] = await db
      .update(talukas)
      .set(talukaData)
      .where(eq(talukas.id, id))
      .returning();
      
    if (!updatedTaluka) {
      throw new Error("Taluka not found");
    }
    
    return updatedTaluka;
  }
  
  async deleteTaluka(id: number): Promise<boolean> {
    const result = await db.delete(talukas).where(eq(talukas.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Tehsils
  async getAllTehsils(talukaId?: number): Promise<Tehsil[]> {
    if (talukaId) {
      return await db
        .select()
        .from(tehsils)
        .where(eq(tehsils.talukaId, talukaId))
        .orderBy(asc(tehsils.name));
    }
    return await db.select().from(tehsils).orderBy(asc(tehsils.name));
  }
  
  async getTehsil(id: number): Promise<Tehsil | undefined> {
    const [tehsil] = await db.select().from(tehsils).where(eq(tehsils.id, id));
    return tehsil;
  }
  
  async createTehsil(tehsil: InsertTehsil): Promise<Tehsil> {
    const [newTehsil] = await db.insert(tehsils).values(tehsil).returning();
    return newTehsil;
  }
  
  async updateTehsil(id: number, tehsilData: Partial<InsertTehsil>): Promise<Tehsil> {
    const [updatedTehsil] = await db
      .update(tehsils)
      .set(tehsilData)
      .where(eq(tehsils.id, id))
      .returning();
      
    if (!updatedTehsil) {
      throw new Error("Tehsil not found");
    }
    
    return updatedTehsil;
  }
  
  async deleteTehsil(id: number): Promise<boolean> {
    const result = await db.delete(tehsils).where(eq(tehsils.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Uncomment the following line to use database storage
export const storage = new DatabaseStorage();

// Comment out the line below to switch from memory storage to database storage
// export const storage = new MemStorage();
