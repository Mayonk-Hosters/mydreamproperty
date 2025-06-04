import {
  users, type User, type InsertUser, type UpsertUser,
  properties, type Property, type InsertProperty,
  agents, type Agent, type InsertAgent,
  inquiries, type Inquiry, type InsertInquiry,
  states, type State, type InsertState,
  districts, type District, type InsertDistrict,
  talukas, type Taluka, type InsertTaluka,
  tehsils, type Tehsil, type InsertTehsil,
  contactInfo, type ContactInfo, type InsertContactInfo,
  homeLoanInquiries, type HomeLoanInquiry, type InsertHomeLoanInquiry,
  propertyTypes, type PropertyType, type InsertPropertyType,
  contactMessages, type ContactMessage, type InsertContactMessage,
  DEFAULT_PROPERTY_TYPES,
  sessions
} from "@shared/schema";
import { eq, desc, and, inArray, like } from "drizzle-orm";
import { getPropertyImage, getAgentImage, getInteriorImage } from "../client/src/lib/utils";
import session from "express-session";
import connectPg from "connect-pg-simple";
import memorystore from "memorystore";

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
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: typeof users.$inferInsert): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: string, userData: Partial<typeof users.$inferInsert>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
  
  // Authentication methods
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getAgentByUsername(username: string): Promise<Agent | undefined>;
  getClientByUsername(username: string): Promise<User | undefined>;
  
  // Property methods
  getAllProperties(filters?: PropertyFilters): Promise<Property[]>;
  getProperty(id: number): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: InsertProperty): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;
  countPropertiesByType(propertyType: string): Promise<number>;
  
  // Property Types methods
  getAllPropertyTypes(): Promise<PropertyType[]>;
  getPropertyType(id: number): Promise<PropertyType | undefined>;
  createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType>;
  updatePropertyType(id: number, propertyType: Partial<InsertPropertyType>): Promise<PropertyType>;
  deletePropertyType(id: number): Promise<boolean>;
  
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
  markInquiryAsRead(id: number): Promise<boolean>;
  deleteInquiry(id: number): Promise<boolean>;
  
  // Contact Information methods
  getContactInfo(): Promise<ContactInfo | undefined>;
  updateContactInfo(contactData: InsertContactInfo): Promise<ContactInfo>;
  
  // Contact Messages methods
  getAllContactMessages(): Promise<ContactMessage[]>;
  getContactMessage(id: number): Promise<ContactMessage | undefined>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  markContactMessageAsRead(id: number): Promise<boolean>;
  markContactMessagesAsRead(ids: number[]): Promise<boolean>;
  deleteContactMessage(id: number): Promise<boolean>;
  
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

  // Home Loan Inquiries
  getAllHomeLoanInquiries(): Promise<HomeLoanInquiry[]>;
  getHomeLoanInquiry(id: number): Promise<HomeLoanInquiry | undefined>;
  createHomeLoanInquiry(inquiry: InsertHomeLoanInquiry): Promise<HomeLoanInquiry>;
  updateHomeLoanInquiry(id: number, inquiry: Partial<InsertHomeLoanInquiry>): Promise<HomeLoanInquiry>;
  deleteHomeLoanInquiry(id: number): Promise<boolean>;
  markHomeLoanInquiryAsRead(id: number): Promise<boolean>;

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
  private contactInfo: ContactInfo | undefined;
  private propertyTypes: Map<number, PropertyType>;
  private contactMessages: Map<number, ContactMessage>;
  private homeLoanInquiries: Map<number, HomeLoanInquiry>;

  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private agentIdCounter: number;
  private inquiryIdCounter: number;
  private stateIdCounter: number;
  private districtIdCounter: number;
  private talukaIdCounter: number;
  private tehsilIdCounter: number;
  private propertyTypeIdCounter: number;
  private contactMessageIdCounter: number;
  private homeLoanInquiryIdCounter: number;
  
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
    this.propertyTypes = new Map();
    this.contactMessages = new Map();
    this.homeLoanInquiries = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.agentIdCounter = 1;
    this.inquiryIdCounter = 1;
    this.stateIdCounter = 1;
    this.districtIdCounter = 1;
    this.talukaIdCounter = 1;
    this.tehsilIdCounter = 1;
    this.propertyTypeIdCounter = 1;
    this.contactMessageIdCounter = 1;
    this.homeLoanInquiryIdCounter = 1;
    
    // Initialize a basic session store
    this.sessionStore = new session.MemoryStore({
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
    
    // Initialize property types with defaults
    for (const typeName of DEFAULT_PROPERTY_TYPES) {
      this.createPropertyType({
        name: typeName,
        active: true
      });
    }
    
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
      
      // Determine property transaction type (buy, rent, sell)
      const types = ["buy", "rent", "sell"];
      let type = types[i % 3];
      
      // Adjust type based on property characteristics
      if (propertyType === "Apartment") {
        type = "rent"; // Apartments are typically for rent
      } else if (prices[i] > 2000000) {
        type = Math.random() > 0.3 ? "buy" : "sell"; // Higher value properties are for sale
      }
      
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
        type: type, // Add property transaction type
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
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email
    );
  }
  
  async getAgentByUsername(username: string): Promise<Agent | undefined> {
    // For now, we'll use the agent's name field as username
    const agent = Array.from(this.agents.values()).find(
      (agent) => agent.name === username
    );
    
    // If agent is found, add a role property to it
    if (agent) {
      (agent as any).role = "agent";
    }
    
    return agent;
  }
  
  async getClientByUsername(username: string): Promise<User | undefined> {
    // For now, clients are just users that are not admins
    const user = Array.from(this.users.values()).find(
      (user) => user.username === username && !user.isAdmin
    );
    
    if (user) {
      (user as any).role = "client";
    }
    
    return user;
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
      if (filters.type) {
        if (filters.type === "rent") {
          // Rental properties: typically apartments or properties with lower prices
          properties = properties.filter(p => p.type === "rent");
        } else if (filters.type === "buy") {
          // Properties for sale: houses or higher-value properties
          properties = properties.filter(p => p.type === "buy");
        } else if (filters.type === "sell") {
          // Properties for selling: properties listed by owners wanting to sell
          properties = properties.filter(p => p.type === "sell");
        }
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
  
  async updateAgent(id: number, updateAgent: InsertAgent): Promise<Agent> {
    const existingAgent = await this.getAgent(id);
    if (!existingAgent) {
      throw new Error(`Agent with ID ${id} not found`);
    }
    
    const updatedAgent: Agent = { ...updateAgent, id };
    this.agents.set(id, updatedAgent);
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    const exists = this.agents.has(id);
    if (!exists) {
      return false;
    }
    
    this.agents.delete(id);
    return true;
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
    const inquiry: Inquiry = { ...insertInquiry, id, isRead: false };
    this.inquiries.set(id, inquiry);
    return inquiry;
  }
  
  async markInquiryAsRead(id: number): Promise<boolean> {
    const inquiry = this.inquiries.get(id);
    if (!inquiry) {
      return false;
    }
    
    inquiry.isRead = true;
    this.inquiries.set(id, inquiry);
    return true;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    return this.inquiries.delete(id);
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

  // Contact Information methods
  async getContactInfo(): Promise<ContactInfo | undefined> {
    return this.contactInfo;
  }

  async updateContactInfo(contactData: InsertContactInfo): Promise<ContactInfo> {
    const now = new Date();
    const updatedContactInfo: ContactInfo = {
      id: 1, // Always use a single record with ID 1
      ...contactData,
      updatedAt: now
    };
    
    this.contactInfo = updatedContactInfo;
    return updatedContactInfo;
  }
  
  // Contact Messages methods
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return Array.from(this.contactMessages.values());
  }
  
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.get(id);
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const id = this.contactMessageIdCounter++;
    const now = new Date();
    const newMessage: ContactMessage = {
      ...message,
      id,
      isRead: false,
      createdAt: now
    };
    
    this.contactMessages.set(id, newMessage);
    return newMessage;
  }
  
  async markContactMessageAsRead(id: number): Promise<boolean> {
    const message = this.contactMessages.get(id);
    if (!message) return false;
    
    message.isRead = true;
    this.contactMessages.set(id, message);
    return true;
  }
  
  async markContactMessagesAsRead(ids: number[]): Promise<boolean> {
    if (ids.length === 0) return false;
    
    let modifiedCount = 0;
    for (const id of ids) {
      const message = this.contactMessages.get(id);
      if (message && !message.isRead) {
        message.isRead = true;
        this.contactMessages.set(id, message);
        modifiedCount++;
      }
    }
    
    return modifiedCount > 0;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    return this.contactMessages.delete(id);
  }
  
  // Property Types methods
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return Array.from(this.propertyTypes.values());
  }
  
  async getPropertyType(id: number): Promise<PropertyType | undefined> {
    return this.propertyTypes.get(id);
  }
  
  async createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType> {
    const id = this.propertyTypeIdCounter++;
    const now = new Date();
    const newPropertyType: PropertyType = { 
      ...propertyType, 
      id,
      createdAt: now
    };
    this.propertyTypes.set(id, newPropertyType);
    return newPropertyType;
  }
  
  async updatePropertyType(id: number, propertyTypeData: Partial<InsertPropertyType>): Promise<PropertyType> {
    const existingPropertyType = this.propertyTypes.get(id);
    
    if (!existingPropertyType) {
      throw new Error("Property type not found");
    }
    
    const updatedPropertyType: PropertyType = { ...existingPropertyType, ...propertyTypeData };
    this.propertyTypes.set(id, updatedPropertyType);
    return updatedPropertyType;
  }
  
  async deletePropertyType(id: number): Promise<boolean> {
    return this.propertyTypes.delete(id);
  }

  // Home Loan Inquiry methods
  async getAllHomeLoanInquiries(): Promise<HomeLoanInquiry[]> {
    return Array.from(this.homeLoanInquiries.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
  
  async getHomeLoanInquiry(id: number): Promise<HomeLoanInquiry | undefined> {
    return this.homeLoanInquiries.get(id);
  }
  
  async createHomeLoanInquiry(inquiry: InsertHomeLoanInquiry): Promise<HomeLoanInquiry> {
    const id = this.homeLoanInquiryIdCounter++;
    const now = new Date();
    const newInquiry: HomeLoanInquiry = {
      ...inquiry,
      id,
      isRead: false,
      createdAt: now
    };
    
    this.homeLoanInquiries.set(id, newInquiry);
    return newInquiry;
  }
  
  async updateHomeLoanInquiry(id: number, inquiryData: Partial<InsertHomeLoanInquiry>): Promise<HomeLoanInquiry> {
    const existingInquiry = this.homeLoanInquiries.get(id);
    
    if (!existingInquiry) {
      throw new Error("Home loan inquiry not found");
    }
    
    const updatedInquiry: HomeLoanInquiry = { ...existingInquiry, ...inquiryData };
    this.homeLoanInquiries.set(id, updatedInquiry);
    return updatedInquiry;
  }
  
  async markHomeLoanInquiryAsRead(id: number): Promise<boolean> {
    const inquiry = this.homeLoanInquiries.get(id);
    if (!inquiry) return false;
    
    inquiry.isRead = true;
    this.homeLoanInquiries.set(id, inquiry);
    return true;
  }
  
  async deleteHomeLoanInquiry(id: number): Promise<boolean> {
    return this.homeLoanInquiries.delete(id);
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
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: typeof users.$inferInsert): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }
  
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.id));
  }
  
  async updateUser(id: string, userData: Partial<typeof users.$inferInsert>): Promise<User> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date()
      })
      .where(eq(users.id, id))
      .returning();
      
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getAgentByUsername(username: string): Promise<Agent | undefined> {
    // For now, we'll use the agent's name field as username
    const [agent] = await db.select().from(agents).where(eq(agents.name, username));
    
    // If agent is found, add a role property to it
    if (agent) {
      (agent as any).role = "agent";
    }
    
    return agent;
  }

  async getClientByUsername(username: string): Promise<User | undefined> {
    // For now, clients are just users that are not admins
    const [user] = await db.select().from(users)
      .where(and(eq(users.username, username), eq(users.isAdmin, false)));
    
    if (user) {
      (user as any).role = "client";
    }
    
    return user;
  }

  async createUser(userData: {
    username: string;
    password: string;
    email?: string;
    isAdmin?: boolean;
  }): Promise<User> {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const [user] = await db
      .insert(users)
      .values({
        id: userId,
        username: userData.username,
        password: userData.password,
        email: userData.email,
        isAdmin: userData.isAdmin || false,
        createdAt: new Date(),
      })
      .returning();
    
    return user;
  }
  
  // Property methods
  async getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
    let query = db.select().from(properties);
    
    // By default, only show active properties unless explicitly filtered
    const conditions = [
      or(
        eq(properties.status, 'active'),
        eq(sql`${properties.status}`, sql`NULL`)
      )
    ];
    
    if (filters) {
      if (filters.type) {
        if (filters.type === "rent") {
          conditions.push(eq(properties.type, "rent"));
        } else if (filters.type === "buy") {
          // Include both 'buy' and 'sell' type properties under "Buy" filter
          conditions.push(or(
            eq(properties.type, "buy"),
            eq(properties.type, "sell")
          ));
        } else if (filters.type === "sell") {
          conditions.push(eq(properties.type, "sell"));
        }
      }
      
      if (filters.propertyType) {
        conditions.push(eq(properties.propertyType, filters.propertyType));
      }
      
      if (filters.location) {
        // Split the location input into tokens for more flexible search
        const locationTerms = filters.location.toLowerCase().split(/\s+/).filter(term => term.length > 1);
        
        if (locationTerms.length > 0) {
          const locationConditions = locationTerms.map(term => 
            or(
              like(sql`lower(${properties.location})`, `%${term.toLowerCase()}%`),
              like(sql`lower(${properties.address})`, `%${term.toLowerCase()}%`),
              like(sql`lower(${properties.title})`, `%${term.toLowerCase()}%`),
              like(sql`lower(${properties.description})`, `%${term.toLowerCase()}%`)
            )
          );
          
          // Any term can match any field
          conditions.push(or(...locationConditions));
        }
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
    }
    
    // Apply all conditions
    query = query.where(and(...conditions));
    
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
  
  async updateAgent(id: number, agentData: InsertAgent): Promise<Agent> {
    const [updatedAgent] = await db
      .update(agents)
      .set(agentData)
      .where(eq(agents.id, id))
      .returning();
    
    if (!updatedAgent) {
      throw new Error(`Agent with ID ${id} not found`);
    }
    
    return updatedAgent;
  }
  
  async deleteAgent(id: number): Promise<boolean> {
    const result = await db.delete(agents).where(eq(agents.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  // Inquiry methods
  async getAllInquiries(): Promise<Inquiry[]> {
    return await db.select().from(inquiries).orderBy(desc(inquiries.createdAt));
  }

  async getInquiry(id: number): Promise<Inquiry | undefined> {
    const [inquiry] = await db.select().from(inquiries).where(eq(inquiries.id, id));
    return inquiry;
  }
  
  async deleteInquiry(id: number): Promise<boolean> {
    const result = await db.delete(inquiries).where(eq(inquiries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
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

  // Contact Information methods
  async getContactInfo(): Promise<ContactInfo | undefined> {
    try {
      const [contact] = await db.select().from(contactInfo);
      return contact;
    } catch (error) {
      console.error("Error getting contact information:", error);
      return undefined;
    }
  }

  async updateContactInfo(contactData: InsertContactInfo): Promise<ContactInfo> {
    try {
      // Check if contact info exists
      const existingContact = await this.getContactInfo();
      
      if (existingContact) {
        // Update existing record
        const [updated] = await db
          .update(contactInfo)
          .set({
            ...contactData,
            updatedAt: new Date()
          })
          .where(eq(contactInfo.id, existingContact.id))
          .returning();
        
        return updated;
      } else {
        // Create new record
        const [newContact] = await db
          .insert(contactInfo)
          .values({
            ...contactData,
            updatedAt: new Date()
          })
          .returning();
        
        return newContact;
      }
    } catch (error) {
      console.error("Error updating contact information:", error);
      throw error;
    }
  }
  
  // Property Types methods
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return await db.select().from(propertyTypes).orderBy(propertyTypes.name);
  }
  
  async getPropertyType(id: number): Promise<PropertyType | undefined> {
    const [propertyType] = await db.select().from(propertyTypes).where(eq(propertyTypes.id, id));
    return propertyType;
  }
  
  async createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType> {
    const [newPropertyType] = await db.insert(propertyTypes).values(propertyType).returning();
    return newPropertyType;
  }
  
  async updatePropertyType(id: number, propertyTypeData: Partial<InsertPropertyType>): Promise<PropertyType> {
    const [updatedPropertyType] = await db
      .update(propertyTypes)
      .set(propertyTypeData)
      .where(eq(propertyTypes.id, id))
      .returning();
      
    if (!updatedPropertyType) {
      throw new Error("Property type not found");
    }
    
    return updatedPropertyType;
  }
  
  async deletePropertyType(id: number): Promise<boolean> {
    const result = await db.delete(propertyTypes).where(eq(propertyTypes.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Contact Messages methods
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }
  
  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const [message] = await db.select().from(contactMessages).where(eq(contactMessages.id, id));
    return message;
  }
  
  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [newMessage] = await db.insert(contactMessages).values(message).returning();
    return newMessage;
  }
  
  async markContactMessageAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async markContactMessagesAsRead(ids: number[]): Promise<boolean> {
    if (ids.length === 0) return false;
    
    const result = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(sql`id = ANY(${ids})`)
      .returning();
      
    return result.length > 0;
  }
  
  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }

  // Home Loan Inquiries methods
  async getAllHomeLoanInquiries(): Promise<HomeLoanInquiry[]> {
    return await db.select().from(homeLoanInquiries).orderBy(desc(homeLoanInquiries.createdAt));
  }
  
  async getHomeLoanInquiry(id: number): Promise<HomeLoanInquiry | undefined> {
    const [inquiry] = await db.select().from(homeLoanInquiries).where(eq(homeLoanInquiries.id, id));
    return inquiry;
  }
  
  async createHomeLoanInquiry(inquiry: InsertHomeLoanInquiry): Promise<HomeLoanInquiry> {
    const [newInquiry] = await db.insert(homeLoanInquiries).values(inquiry).returning();
    return newInquiry;
  }
  
  async updateHomeLoanInquiry(id: number, inquiryData: Partial<InsertHomeLoanInquiry>): Promise<HomeLoanInquiry> {
    const [updatedInquiry] = await db
      .update(homeLoanInquiries)
      .set(inquiryData)
      .where(eq(homeLoanInquiries.id, id))
      .returning();
      
    if (!updatedInquiry) {
      throw new Error("Home loan inquiry not found");
    }
    
    return updatedInquiry;
  }
  
  async deleteHomeLoanInquiry(id: number): Promise<boolean> {
    const result = await db.delete(homeLoanInquiries).where(eq(homeLoanInquiries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
  
  async markHomeLoanInquiryAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(homeLoanInquiries)
      .set({ isRead: true })
      .where(eq(homeLoanInquiries.id, id));
    return result.rowCount !== null && result.rowCount > 0;
  }
}

// Database storage implementation
// Use database storage for persistence
export const storage = new DatabaseStorage();
