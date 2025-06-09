import {
  users, type User, type InsertUser, type UpsertUser,
  properties, type Property, type InsertProperty,
  agents, type Agent, type InsertAgent,
  propertyInquiries, type PropertyInquiry, type InsertPropertyInquiry,
  homeLoanInquiries, type HomeLoanInquiry, type InsertHomeLoanInquiry,
  states, type State, type InsertState,
  districts, type District, type InsertDistrict,
  talukas, type Taluka, type InsertTaluka,
  tehsils, type Tehsil, type InsertTehsil,
  contactInfo, type ContactInfo, type InsertContactInfo,
  propertyTypes, type PropertyType, type InsertPropertyType,
  contactMessages, type ContactMessage, type InsertContactMessage,
  homepageImages, type HomepageImage, type InsertHomepageImage,
  DEFAULT_PROPERTY_TYPES,
  sessions
} from "@shared/schema";
import { eq, desc, and, inArray, like, or, sql, gte, lte } from "drizzle-orm";
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
  agentId?: number;
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
  getPropertiesByAgent(agentId: number): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, property: Partial<InsertProperty>): Promise<Property>;
  deleteProperty(id: number): Promise<boolean>;
  getFeaturedProperties(): Promise<Property[]>;
  
  // Agent methods
  getAllAgents(): Promise<Agent[]>;
  getAgent(id: number): Promise<Agent | undefined>;
  createAgent(agent: InsertAgent): Promise<Agent>;
  updateAgent(id: number, agent: InsertAgent): Promise<Agent>;
  deleteAgent(id: number): Promise<boolean>;
  
  // Property Inquiry methods
  getAllPropertyInquiries(): Promise<PropertyInquiry[]>;
  getPropertyInquiry(id: number): Promise<PropertyInquiry | undefined>;
  createPropertyInquiry(inquiry: InsertPropertyInquiry): Promise<PropertyInquiry>;
  markPropertyInquiryAsRead(id: number): Promise<boolean>;
  deletePropertyInquiry(id: number): Promise<boolean>;
  
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

  // Homepage Images methods
  getAllHomepageImages(): Promise<HomepageImage[]>;
  getHomepageImage(id: number): Promise<HomepageImage | undefined>;
  createHomepageImage(image: InsertHomepageImage): Promise<HomepageImage>;
  updateHomepageImage(id: number, image: Partial<InsertHomepageImage>): Promise<HomepageImage>;
  deleteHomepageImage(id: number): Promise<boolean>;

  // Property Types methods
  getAllPropertyTypes(): Promise<PropertyType[]>;
  getPropertyType(id: number): Promise<PropertyType | undefined>;
  createPropertyType(propertyType: InsertPropertyType): Promise<PropertyType>;
  updatePropertyType(id: number, propertyType: Partial<InsertPropertyType>): Promise<PropertyType>;
  deletePropertyType(id: number): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
}

// MemoryStore implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private properties: Property[] = [];
  private agents: Agent[] = [];
  private propertyInquiries: PropertyInquiry[] = [];
  private homeLoanInquiries: HomeLoanInquiry[] = [];
  private states: State[] = [];
  private districts: District[] = [];
  private talukas: Taluka[] = [];
  private tehsils: Tehsil[] = [];
  private contactMessages: ContactMessage[] = [];
  private contactInfoData: ContactInfo | undefined;
  private propertyTypes: PropertyType[] = [];
  private homepageImages: HomepageImage[] = [];
  private nextId = 1;
  private nextUserId = 1;
  public sessionStore: session.Store;

  constructor() {
    const MemoryStore = memorystore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize default admin user
    this.upsertUser({
      id: "admin",
      username: "admin",
      password: "admin123",
      isAdmin: true,
    });

    // Initialize sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Add default contact info
    this.contactInfoData = {
      id: 1,
      siteName: "My Dream Property",
      address: "123 Real Estate Avenue, Property City, PC 12345",
      phone1: "+1 (555) 123-4567",
      phone2: "+1 (555) 987-6543",
      email1: "info@mydreamproperty.com",
      email2: "support@mydreamproperty.com",
      businessHours: {
        monday: "9:00 AM - 6:00 PM",
        tuesday: "9:00 AM - 6:00 PM",
        wednesday: "9:00 AM - 6:00 PM",
        thursday: "9:00 AM - 6:00 PM",
        friday: "9:00 AM - 6:00 PM",
        saturday: "10:00 AM - 4:00 PM",
        sunday: "Closed"
      },
      mapUrl: "https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3771.2874594567!2d72.8776!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c9b9c1e1e1e1%3A0x1e1e1e1e1e1e1e1e!2sTest%20Location!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin",
      updatedAt: new Date()
    };

    // Add sample properties
    const sampleProperties: Omit<Property, 'id' | 'createdAt'>[] = [
      {
        propertyNumber: "MDP-001",
        title: "Luxurious 3BHK Apartment",
        description: "Beautiful spacious apartment with modern amenities",
        price: 1250000,
        location: "Mumbai Central",
        address: "123 Main Street, Mumbai Central, Mumbai",
        beds: 3,
        baths: 2,
        area: 1200,
        areaUnit: "sqft",
        yearBuilt: 2020,
        parking: 2,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: true,
        features: ["Swimming Pool", "Gym", "Parking", "Security"],
        images: [getPropertyImage(1), getPropertyImage(2)],
        mapUrl: "https://maps.google.com/embed?pb=!1m18!1m12!1m3!1d3771.287!2d72.8776!3d19.0760!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1",
        maharera_registered: true,
        maharera_number: "P51700000001",
        agentId: 1,
        stateId: 1,
        districtId: 1,
        talukaId: 1,
        tehsilId: 1
      }
    ];

    this.properties = sampleProperties.map((prop, index) => ({
      ...prop,
      id: index + 1,
      createdAt: new Date()
    }));

    // Add sample agents
    const sampleAgents: Omit<Agent, 'id' | 'createdAt'>[] = [
      {
        name: "John Smith",
        title: "Senior Property Consultant",
        image: getAgentImage(1),
        contactNumber: "+1-555-0123",
        email: "john.smith@mydreamproperty.com",
        deals: 45,
        rating: 4.8
      }
    ];

    this.agents = sampleAgents.map((agent, index) => ({
      ...agent,
      id: index + 1,
      createdAt: new Date()
    }));

    // Initialize property inquiries
    this.propertyInquiries = [];

    // Initialize home loan inquiries  
    this.homeLoanInquiries = [];

    // Add sample states
    this.states = [
      { id: 1, name: "Maharashtra", code: "MH", createdAt: new Date() }
    ];

    // Add sample districts
    this.districts = [
      { id: 1, name: "Mumbai", stateId: 1, createdAt: new Date() }
    ];

    // Add sample talukas
    this.talukas = [
      { id: 1, name: "Mumbai City", districtId: 1, createdAt: new Date() }
    ];

    // Add sample tehsils
    this.tehsils = [
      { id: 1, name: "Mumbai Central", talukaId: 1, area: "Central Mumbai", createdAt: new Date() }
    ];

    // Add sample contact messages
    this.contactMessages = [];

    // Add sample property types
    this.propertyTypes = DEFAULT_PROPERTY_TYPES.map((name, index) => ({
      id: index + 1,
      name,
      active: true,
      createdAt: new Date()
    }));

    // Add sample homepage images
    this.homepageImages = [
      {
        id: 1,
        imageType: "hero",
        imageUrl: getPropertyImage(1),
        title: "Find Your Dream Property",
        description: "Discover the best properties in prime locations",
        isActive: true,
        sortOrder: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    this.nextId = Math.max(
      this.properties.length,
      this.agents.length,
      this.states.length,
      this.districts.length,
      this.talukas.length,
      this.tehsils.length,
      this.propertyTypes.length,
      this.homepageImages.length
    ) + 1;
  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.find(u => u.id === id);
  }

  async upsertUser(userData: typeof users.$inferInsert): Promise<User> {
    const existingIndex = this.users.findIndex(u => u.id === userData.id);
    const user: User = {
      ...userData,
      createdAt: new Date()
    };

    if (existingIndex >= 0) {
      this.users[existingIndex] = { ...this.users[existingIndex], ...user };
      return this.users[existingIndex];
    } else {
      this.users.push(user);
      return user;
    }
  }

  async getAllUsers(): Promise<User[]> {
    return this.users;
  }

  async updateUser(id: string, userData: Partial<typeof users.$inferInsert>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error("User not found");
    
    this.users[index] = { ...this.users[index], ...userData };
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return this.users.find(u => u.email === email);
  }

  async getAgentByUsername(username: string): Promise<Agent | undefined> {
    return this.agents.find(a => a.name === username);
  }

  async getClientByUsername(username: string): Promise<User | undefined> {
    return this.users.find(u => u.username === username && !u.isAdmin);
  }

  // Property methods
  async getAllProperties(filters?: PropertyFilters): Promise<Property[]> {
    let filteredProperties = this.properties;

    if (filters) {
      if (filters.type) {
        filteredProperties = filteredProperties.filter(p => p.type === filters.type);
      }
      if (filters.propertyType) {
        filteredProperties = filteredProperties.filter(p => p.propertyType === filters.propertyType);
      }
      if (filters.location) {
        filteredProperties = filteredProperties.filter(p => 
          p.location.toLowerCase().includes(filters.location!.toLowerCase()) ||
          p.address.toLowerCase().includes(filters.location!.toLowerCase())
        );
      }
      if (filters.minPrice) {
        filteredProperties = filteredProperties.filter(p => p.price >= filters.minPrice!);
      }
      if (filters.maxPrice) {
        filteredProperties = filteredProperties.filter(p => p.price <= filters.maxPrice!);
      }
      if (filters.minBeds) {
        filteredProperties = filteredProperties.filter(p => p.beds >= filters.minBeds!);
      }
      if (filters.minBaths) {
        filteredProperties = filteredProperties.filter(p => p.baths >= filters.minBaths!);
      }
      if (filters.featured !== undefined) {
        filteredProperties = filteredProperties.filter(p => p.featured === filters.featured);
      }
      if (filters.agentId) {
        filteredProperties = filteredProperties.filter(p => p.agentId === filters.agentId);
      }
    }

    return filteredProperties.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.find(p => p.id === id);
  }

  async getPropertiesByAgent(agentId: number): Promise<Property[]> {
    return this.properties.filter(p => p.agentId === agentId);
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const property: Property = {
      id: this.nextId++,
      ...propertyData,
      createdAt: new Date()
    };
    this.properties.push(property);
    return property;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) throw new Error("Property not found");
    
    this.properties[index] = { ...this.properties[index], ...propertyData };
    return this.properties[index];
  }

  async deleteProperty(id: number): Promise<boolean> {
    const index = this.properties.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.properties.splice(index, 1);
    return true;
  }

  async getFeaturedProperties(): Promise<Property[]> {
    return this.properties.filter(p => p.featured);
  }

  // Agent methods
  async getAllAgents(): Promise<Agent[]> {
    return this.agents;
  }

  async getAgent(id: number): Promise<Agent | undefined> {
    return this.agents.find(a => a.id === id);
  }

  async createAgent(agentData: InsertAgent): Promise<Agent> {
    const agent: Agent = {
      id: this.nextId++,
      ...agentData,
      createdAt: new Date()
    };
    this.agents.push(agent);
    return agent;
  }

  async updateAgent(id: number, agentData: InsertAgent): Promise<Agent> {
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) throw new Error("Agent not found");
    
    this.agents[index] = { ...this.agents[index], ...agentData };
    return this.agents[index];
  }

  async deleteAgent(id: number): Promise<boolean> {
    const index = this.agents.findIndex(a => a.id === id);
    if (index === -1) return false;
    
    this.agents.splice(index, 1);
    return true;
  }

  // Property Inquiry methods
  async getAllPropertyInquiries(): Promise<PropertyInquiry[]> {
    return this.propertyInquiries.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getPropertyInquiry(id: number): Promise<PropertyInquiry | undefined> {
    return this.propertyInquiries.find(i => i.id === id);
  }

  async createPropertyInquiry(inquiryData: InsertPropertyInquiry): Promise<PropertyInquiry> {
    const inquiry: PropertyInquiry = {
      id: this.nextId++,
      ...inquiryData,
      isRead: false,
      createdAt: new Date()
    };
    this.propertyInquiries.push(inquiry);
    return inquiry;
  }

  async markPropertyInquiryAsRead(id: number): Promise<boolean> {
    const inquiry = this.propertyInquiries.find(i => i.id === id);
    if (!inquiry) return false;
    
    inquiry.isRead = true;
    return true;
  }

  async deletePropertyInquiry(id: number): Promise<boolean> {
    const index = this.propertyInquiries.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.propertyInquiries.splice(index, 1);
    return true;
  }

  // States methods
  async getAllStates(): Promise<State[]> {
    return this.states;
  }

  async getState(id: number): Promise<State | undefined> {
    return this.states.find(s => s.id === id);
  }

  async createState(stateData: InsertState): Promise<State> {
    const state: State = {
      id: this.nextId++,
      ...stateData,
      createdAt: new Date()
    };
    this.states.push(state);
    return state;
  }

  async updateState(id: number, stateData: Partial<InsertState>): Promise<State> {
    const index = this.states.findIndex(s => s.id === id);
    if (index === -1) throw new Error("State not found");
    
    this.states[index] = { ...this.states[index], ...stateData };
    return this.states[index];
  }

  async deleteState(id: number): Promise<boolean> {
    const index = this.states.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.states.splice(index, 1);
    return true;
  }

  // Districts methods
  async getAllDistricts(stateId?: number): Promise<District[]> {
    if (stateId) {
      return this.districts.filter(d => d.stateId === stateId);
    }
    return this.districts;
  }

  async getDistrict(id: number): Promise<District | undefined> {
    return this.districts.find(d => d.id === id);
  }

  async createDistrict(districtData: InsertDistrict): Promise<District> {
    const district: District = {
      id: this.nextId++,
      ...districtData,
      createdAt: new Date()
    };
    this.districts.push(district);
    return district;
  }

  async updateDistrict(id: number, districtData: Partial<InsertDistrict>): Promise<District> {
    const index = this.districts.findIndex(d => d.id === id);
    if (index === -1) throw new Error("District not found");
    
    this.districts[index] = { ...this.districts[index], ...districtData };
    return this.districts[index];
  }

  async deleteDistrict(id: number): Promise<boolean> {
    const index = this.districts.findIndex(d => d.id === id);
    if (index === -1) return false;
    
    this.districts.splice(index, 1);
    return true;
  }

  // Talukas methods
  async getAllTalukas(districtId?: number): Promise<Taluka[]> {
    if (districtId) {
      return this.talukas.filter(t => t.districtId === districtId);
    }
    return this.talukas;
  }

  async getTaluka(id: number): Promise<Taluka | undefined> {
    return this.talukas.find(t => t.id === id);
  }

  async createTaluka(talukaData: InsertTaluka): Promise<Taluka> {
    const taluka: Taluka = {
      id: this.nextId++,
      ...talukaData,
      createdAt: new Date()
    };
    this.talukas.push(taluka);
    return taluka;
  }

  async updateTaluka(id: number, talukaData: Partial<InsertTaluka>): Promise<Taluka> {
    const index = this.talukas.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Taluka not found");
    
    this.talukas[index] = { ...this.talukas[index], ...talukaData };
    return this.talukas[index];
  }

  async deleteTaluka(id: number): Promise<boolean> {
    const index = this.talukas.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.talukas.splice(index, 1);
    return true;
  }

  // Tehsils methods
  async getAllTehsils(talukaId?: number): Promise<Tehsil[]> {
    if (talukaId) {
      return this.tehsils.filter(t => t.talukaId === talukaId);
    }
    return this.tehsils;
  }

  async getTehsil(id: number): Promise<Tehsil | undefined> {
    return this.tehsils.find(t => t.id === id);
  }

  async createTehsil(tehsilData: InsertTehsil): Promise<Tehsil> {
    const tehsil: Tehsil = {
      id: this.nextId++,
      ...tehsilData,
      createdAt: new Date()
    };
    this.tehsils.push(tehsil);
    return tehsil;
  }

  async updateTehsil(id: number, tehsilData: Partial<InsertTehsil>): Promise<Tehsil> {
    const index = this.tehsils.findIndex(t => t.id === id);
    if (index === -1) throw new Error("Tehsil not found");
    
    this.tehsils[index] = { ...this.tehsils[index], ...tehsilData };
    return this.tehsils[index];
  }

  async deleteTehsil(id: number): Promise<boolean> {
    const index = this.tehsils.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.tehsils.splice(index, 1);
    return true;
  }

  // Contact info methods
  async getContactInfo(): Promise<ContactInfo | undefined> {
    return this.contactInfoData;
  }

  async updateContactInfo(contactData: InsertContactInfo): Promise<ContactInfo> {
    this.contactInfoData = {
      id: 1,
      ...contactData,
      updatedAt: new Date()
    };
    return this.contactInfoData;
  }

  // Contact messages methods
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return this.contactMessages.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    return this.contactMessages.find(m => m.id === id);
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const message: ContactMessage = {
      id: this.nextId++,
      ...messageData,
      isRead: false,
      createdAt: new Date()
    };
    this.contactMessages.push(message);
    return message;
  }

  async markContactMessageAsRead(id: number): Promise<boolean> {
    const message = this.contactMessages.find(m => m.id === id);
    if (!message) return false;
    
    message.isRead = true;
    return true;
  }

  async markContactMessagesAsRead(ids: number[]): Promise<boolean> {
    let updated = false;
    for (const id of ids) {
      const message = this.contactMessages.find(m => m.id === id);
      if (message && !message.isRead) {
        message.isRead = true;
        updated = true;
      }
    }
    return updated;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const index = this.contactMessages.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.contactMessages.splice(index, 1);
    return true;
  }

  // Property types methods
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    return this.propertyTypes.filter(pt => pt.active);
  }

  async getPropertyType(id: number): Promise<PropertyType | undefined> {
    return this.propertyTypes.find(pt => pt.id === id);
  }

  async createPropertyType(propertyTypeData: InsertPropertyType): Promise<PropertyType> {
    const propertyType: PropertyType = {
      id: this.nextId++,
      ...propertyTypeData,
      createdAt: new Date()
    };
    this.propertyTypes.push(propertyType);
    return propertyType;
  }

  async updatePropertyType(id: number, propertyTypeData: Partial<InsertPropertyType>): Promise<PropertyType> {
    const index = this.propertyTypes.findIndex(pt => pt.id === id);
    if (index === -1) throw new Error("Property type not found");
    
    this.propertyTypes[index] = { ...this.propertyTypes[index], ...propertyTypeData };
    return this.propertyTypes[index];
  }

  async deletePropertyType(id: number): Promise<boolean> {
    const index = this.propertyTypes.findIndex(pt => pt.id === id);
    if (index === -1) return false;
    
    this.propertyTypes.splice(index, 1);
    return true;
  }

  // Home loan inquiries methods
  async getAllHomeLoanInquiries(): Promise<HomeLoanInquiry[]> {
    return this.homeLoanInquiries.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getHomeLoanInquiry(id: number): Promise<HomeLoanInquiry | undefined> {
    return this.homeLoanInquiries.find(i => i.id === id);
  }

  async createHomeLoanInquiry(inquiryData: InsertHomeLoanInquiry): Promise<HomeLoanInquiry> {
    const inquiry: HomeLoanInquiry = {
      id: this.nextId++,
      ...inquiryData,
      isRead: false,
      createdAt: new Date()
    };
    this.homeLoanInquiries.push(inquiry);
    return inquiry;
  }

  async updateHomeLoanInquiry(id: number, inquiryData: Partial<InsertHomeLoanInquiry>): Promise<HomeLoanInquiry> {
    const index = this.homeLoanInquiries.findIndex(i => i.id === id);
    if (index === -1) throw new Error("Home loan inquiry not found");
    
    this.homeLoanInquiries[index] = { ...this.homeLoanInquiries[index], ...inquiryData };
    return this.homeLoanInquiries[index];
  }

  async deleteHomeLoanInquiry(id: number): Promise<boolean> {
    const index = this.homeLoanInquiries.findIndex(i => i.id === id);
    if (index === -1) return false;
    
    this.homeLoanInquiries.splice(index, 1);
    return true;
  }

  async markHomeLoanInquiryAsRead(id: number): Promise<boolean> {
    const inquiry = this.homeLoanInquiries.find(i => i.id === id);
    if (!inquiry) return false;
    
    inquiry.isRead = true;
    return true;
  }

  // Homepage images methods
  async getAllHomepageImages(): Promise<HomepageImage[]> {
    return this.homepageImages.filter(img => img.isActive);
  }

  async getHomepageImage(id: number): Promise<HomepageImage | undefined> {
    return this.homepageImages.find(img => img.id === id);
  }

  async createHomepageImage(imageData: InsertHomepageImage): Promise<HomepageImage> {
    const image: HomepageImage = {
      id: this.nextId++,
      ...imageData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.homepageImages.push(image);
    return image;
  }

  async updateHomepageImage(id: number, imageData: Partial<InsertHomepageImage>): Promise<HomepageImage> {
    const index = this.homepageImages.findIndex(img => img.id === id);
    if (index === -1) throw new Error("Homepage image not found");
    
    this.homepageImages[index] = { 
      ...this.homepageImages[index], 
      ...imageData, 
      updatedAt: new Date() 
    };
    return this.homepageImages[index];
  }

  async deleteHomepageImage(id: number): Promise<boolean> {
    const index = this.homepageImages.findIndex(img => img.id === id);
    if (index === -1) return false;
    
    this.homepageImages.splice(index, 1);
    return true;
  }
}

// Export storage instance - use database storage for persistence
import { dbStorage } from "./db-storage";
export const storage = dbStorage;