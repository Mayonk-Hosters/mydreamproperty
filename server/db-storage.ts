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
import { pool, db } from "./db";
import type { IStorage } from "./storage";

// Database storage implementation
export class DbStorage implements IStorage {
  constructor() {}

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, parseInt(id))).limit(1);
    return result[0];
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    if (userData.id) {
      const existing = await this.getUser(userData.id.toString());
      if (existing) {
        const [updated] = await db
          .update(users)
          .set(userData)
          .where(eq(users.id, userData.id))
          .returning();
        return updated;
      }
    }
    
    const [created] = await db.insert(users).values(userData).returning();
    return created;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(desc(users.createdAt));
  }

  async updateUser(id: string, userData: Partial<InsertUser>): Promise<User> {
    const [updated] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, parseInt(id)))
      .returning();
    return updated;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, parseInt(id)));
    return result.rowCount > 0;
  }

  // Authentication methods
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getAgentByUsername(username: string): Promise<Agent | undefined> {
    const result = await db.select().from(agents).where(eq(agents.email, username)).limit(1);
    return result[0];
  }

  async getClientByUsername(username: string): Promise<User | undefined> {
    return this.getUserByUsername(username);
  }

  // Property methods (implementing minimal required for messages to work)
  async getAllProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(desc(properties.createdAt));
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const result = await db.select().from(properties).where(eq(properties.id, id)).limit(1);
    return result[0];
  }

  async createProperty(propertyData: InsertProperty): Promise<Property> {
    const [created] = await db.insert(properties).values(propertyData).returning();
    return created;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property> {
    const [updated] = await db
      .update(properties)
      .set(propertyData)
      .where(eq(properties.id, id))
      .returning();
    return updated;
  }

  async deleteProperty(id: number): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return result.rowCount > 0;
  }

  // Property inquiry methods - NOW USING DATABASE
  async getAllPropertyInquiries(): Promise<PropertyInquiry[]> {
    return await db.select().from(propertyInquiries).orderBy(desc(propertyInquiries.createdAt));
  }

  async getPropertyInquiry(id: number): Promise<PropertyInquiry | undefined> {
    const result = await db.select().from(propertyInquiries).where(eq(propertyInquiries.id, id)).limit(1);
    return result[0];
  }

  async createPropertyInquiry(inquiryData: InsertPropertyInquiry): Promise<PropertyInquiry> {
    const [created] = await db.insert(propertyInquiries).values(inquiryData).returning();
    return created;
  }

  async deletePropertyInquiry(id: number): Promise<boolean> {
    const result = await db.delete(propertyInquiries).where(eq(propertyInquiries.id, id));
    return result.rowCount > 0;
  }

  async markPropertyInquiryAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(propertyInquiries)
      .set({ isRead: true })
      .where(eq(propertyInquiries.id, id));
    return result.rowCount > 0;
  }

  async markPropertyInquiryAsUnread(id: number): Promise<boolean> {
    const result = await db
      .update(propertyInquiries)
      .set({ isRead: false })
      .where(eq(propertyInquiries.id, id));
    return result.rowCount > 0;
  }

  // Home loan inquiry methods - NOW USING DATABASE
  async getAllHomeLoanInquiries(): Promise<HomeLoanInquiry[]> {
    return await db.select().from(homeLoanInquiries).orderBy(desc(homeLoanInquiries.createdAt));
  }

  async getHomeLoanInquiry(id: number): Promise<HomeLoanInquiry | undefined> {
    const result = await db.select().from(homeLoanInquiries).where(eq(homeLoanInquiries.id, id)).limit(1);
    return result[0];
  }

  async createHomeLoanInquiry(inquiryData: InsertHomeLoanInquiry): Promise<HomeLoanInquiry> {
    const [created] = await db.insert(homeLoanInquiries).values(inquiryData).returning();
    return created;
  }

  async deleteHomeLoanInquiry(id: number): Promise<boolean> {
    const result = await db.delete(homeLoanInquiries).where(eq(homeLoanInquiries.id, id));
    return result.rowCount > 0;
  }

  async markHomeLoanInquiryAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(homeLoanInquiries)
      .set({ isRead: true })
      .where(eq(homeLoanInquiries.id, id));
    return result.rowCount > 0;
  }

  async markHomeLoanInquiryAsUnread(id: number): Promise<boolean> {
    const result = await db
      .update(homeLoanInquiries)
      .set({ isRead: false })
      .where(eq(homeLoanInquiries.id, id));
    return result.rowCount > 0;
  }

  // Contact message methods - EXISTING DATABASE IMPLEMENTATION
  async getAllContactMessages(): Promise<ContactMessage[]> {
    return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
  }

  async getContactMessage(id: number): Promise<ContactMessage | undefined> {
    const result = await db.select().from(contactMessages).where(eq(contactMessages.id, id)).limit(1);
    return result[0];
  }

  async createContactMessage(messageData: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(messageData).returning();
    return created;
  }

  async deleteContactMessage(id: number): Promise<boolean> {
    const result = await db.delete(contactMessages).where(eq(contactMessages.id, id));
    return result.rowCount > 0;
  }

  async markContactMessageAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(contactMessages)
      .set({ isRead: true })
      .where(eq(contactMessages.id, id));
    return result.rowCount > 0;
  }

  async markContactMessageAsUnread(id: number): Promise<boolean> {
    const result = await db
      .update(contactMessages)
      .set({ isRead: false })
      .where(eq(contactMessages.id, id));
    return result.rowCount > 0;
  }

  // Stub implementations for other required methods
  async getFilteredProperties(): Promise<Property[]> { return []; }
  async getAllAgents(): Promise<Agent[]> { return []; }
  async getAgent(): Promise<Agent | undefined> { return undefined; }
  async createAgent(): Promise<Agent> { throw new Error("Not implemented"); }
  async updateAgent(): Promise<Agent> { throw new Error("Not implemented"); }
  async deleteAgent(): Promise<boolean> { return false; }
  async getAllStates(): Promise<State[]> { return []; }
  async getState(): Promise<State | undefined> { return undefined; }
  async createState(): Promise<State> { throw new Error("Not implemented"); }
  async updateState(): Promise<State> { throw new Error("Not implemented"); }
  async deleteState(): Promise<boolean> { return false; }
  async getAllDistricts(): Promise<District[]> { return []; }
  async getDistrict(): Promise<District | undefined> { return undefined; }
  async createDistrict(): Promise<District> { throw new Error("Not implemented"); }
  async updateDistrict(): Promise<District> { throw new Error("Not implemented"); }
  async deleteDistrict(): Promise<boolean> { return false; }
  async getAllTalukas(): Promise<Taluka[]> { return []; }
  async getTaluka(): Promise<Taluka | undefined> { return undefined; }
  async createTaluka(): Promise<Taluka> { throw new Error("Not implemented"); }
  async updateTaluka(): Promise<Taluka> { throw new Error("Not implemented"); }
  async deleteTaluka(): Promise<boolean> { return false; }
  async getAllTehsils(): Promise<Tehsil[]> { return []; }
  async getTehsil(): Promise<Tehsil | undefined> { return undefined; }
  async createTehsil(): Promise<Tehsil> { throw new Error("Not implemented"); }
  async updateTehsil(): Promise<Tehsil> { throw new Error("Not implemented"); }
  async deleteTehsil(): Promise<boolean> { return false; }
  async getContactInfo(): Promise<ContactInfo | undefined> { return undefined; }
  async updateContactInfo(): Promise<ContactInfo> { throw new Error("Not implemented"); }
  async getAllPropertyTypes(): Promise<PropertyType[]> { return []; }
  async getPropertyType(): Promise<PropertyType | undefined> { return undefined; }
  async createPropertyType(): Promise<PropertyType> { throw new Error("Not implemented"); }
  async updatePropertyType(): Promise<PropertyType> { throw new Error("Not implemented"); }
  async deletePropertyType(): Promise<boolean> { return false; }
  async getAllHomepageImages(): Promise<HomepageImage[]> { return []; }
  async getHomepageImage(): Promise<HomepageImage | undefined> { return undefined; }
  async createHomepageImage(): Promise<HomepageImage> { throw new Error("Not implemented"); }
  async updateHomepageImage(): Promise<HomepageImage> { throw new Error("Not implemented"); }
  async deleteHomepageImage(): Promise<boolean> { return false; }
}

// Export the database storage instance
export const dbStorage = new DbStorage();