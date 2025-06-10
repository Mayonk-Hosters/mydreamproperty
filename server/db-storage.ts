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

  async createUser(userData: {
    username: string;
    password: string;
    email?: string;
    fullName?: string;
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
        fullName: userData.fullName,
        isAdmin: userData.isAdmin || false,
        createdAt: new Date(),
      })
      .returning();
    
    return user;
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
    const result = await db
      .select({
        id: properties.id,
        propertyNumber: properties.propertyNumber,
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        address: properties.address,
        beds: properties.beds,
        baths: properties.baths,
        area: properties.area,
        areaUnit: properties.areaUnit,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        propertyType: properties.propertyType,
        type: properties.type,
        status: properties.status,
        featured: properties.featured,
        features: properties.features,
        images: properties.images,
        mapUrl: properties.mapUrl,
        maharera_registered: properties.maharera_registered,
        maharera_number: properties.maharera_number,
        agentId: properties.agentId,
        stateId: properties.stateId,
        districtId: properties.districtId,
        talukaId: properties.talukaId,
        tehsilId: properties.tehsilId,
        createdAt: properties.createdAt,
        // Include location names
        stateName: states.name,
        districtName: districts.name,
        talukaName: talukas.name,
        tehsilName: tehsils.name,
      })
      .from(properties)
      .leftJoin(states, eq(properties.stateId, states.id))
      .leftJoin(districts, eq(properties.districtId, districts.id))
      .leftJoin(talukas, eq(properties.talukaId, talukas.id))
      .leftJoin(tehsils, eq(properties.tehsilId, tehsils.id))
      .orderBy(desc(properties.createdAt));
    
    return result as any[];
  }

  async getProperty(id: number): Promise<Property | undefined> {
    const result = await db
      .select({
        id: properties.id,
        propertyNumber: properties.propertyNumber,
        title: properties.title,
        description: properties.description,
        price: properties.price,
        location: properties.location,
        address: properties.address,
        beds: properties.beds,
        baths: properties.baths,
        area: properties.area,
        areaUnit: properties.areaUnit,
        yearBuilt: properties.yearBuilt,
        parking: properties.parking,
        propertyType: properties.propertyType,
        type: properties.type,
        status: properties.status,
        featured: properties.featured,
        features: properties.features,
        images: properties.images,
        mapUrl: properties.mapUrl,
        maharera_registered: properties.maharera_registered,
        maharera_number: properties.maharera_number,
        agentId: properties.agentId,
        stateId: properties.stateId,
        districtId: properties.districtId,
        talukaId: properties.talukaId,
        tehsilId: properties.tehsilId,
        createdAt: properties.createdAt,
        // Include location names
        stateName: states.name,
        districtName: districts.name,
        talukaName: talukas.name,
        tehsilName: tehsils.name,
      })
      .from(properties)
      .leftJoin(states, eq(properties.stateId, states.id))
      .leftJoin(districts, eq(properties.districtId, districts.id))
      .leftJoin(talukas, eq(properties.talukaId, talukas.id))
      .leftJoin(tehsils, eq(properties.tehsilId, tehsils.id))
      .where(eq(properties.id, id))
      .limit(1);
    
    return result[0] as any;
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

  // States management
  async getAllStates(): Promise<State[]> {
    const result = await db.select().from(states).orderBy(states.name);
    return result;
  }

  async getState(id: number): Promise<State | undefined> {
    const [state] = await db.select().from(states).where(eq(states.id, id));
    return state;
  }

  async createState(stateData: InsertState): Promise<State> {
    const [created] = await db.insert(states).values(stateData).returning();
    return created;
  }

  async updateState(id: number, stateData: Partial<InsertState>): Promise<State> {
    const [updated] = await db
      .update(states)
      .set(stateData)
      .where(eq(states.id, id))
      .returning();
    return updated;
  }

  async deleteState(id: number): Promise<boolean> {
    const result = await db.delete(states).where(eq(states.id, id));
    return result.rowCount > 0;
  }

  // Districts management
  async getAllDistricts(stateId?: number): Promise<District[]> {
    if (stateId) {
      return await db.select().from(districts).where(eq(districts.stateId, stateId)).orderBy(districts.name);
    }
    return await db.select().from(districts).orderBy(districts.name);
  }

  async getDistrict(id: number): Promise<District | undefined> {
    const [district] = await db.select().from(districts).where(eq(districts.id, id));
    return district;
  }

  async createDistrict(districtData: InsertDistrict): Promise<District> {
    const [created] = await db.insert(districts).values(districtData).returning();
    return created;
  }

  async updateDistrict(id: number, districtData: Partial<InsertDistrict>): Promise<District> {
    const [updated] = await db
      .update(districts)
      .set(districtData)
      .where(eq(districts.id, id))
      .returning();
    return updated;
  }

  async deleteDistrict(id: number): Promise<boolean> {
    const result = await db.delete(districts).where(eq(districts.id, id));
    return result.rowCount > 0;
  }

  // Talukas management
  async getAllTalukas(districtId?: number): Promise<Taluka[]> {
    if (districtId) {
      return await db.select().from(talukas).where(eq(talukas.districtId, districtId)).orderBy(talukas.name);
    }
    return await db.select().from(talukas).orderBy(talukas.name);
  }

  async getTaluka(id: number): Promise<Taluka | undefined> {
    const [taluka] = await db.select().from(talukas).where(eq(talukas.id, id));
    return taluka;
  }

  async createTaluka(talukaData: InsertTaluka): Promise<Taluka> {
    const [created] = await db.insert(talukas).values(talukaData).returning();
    return created;
  }

  async updateTaluka(id: number, talukaData: Partial<InsertTaluka>): Promise<Taluka> {
    const [updated] = await db
      .update(talukas)
      .set(talukaData)
      .where(eq(talukas.id, id))
      .returning();
    return updated;
  }

  async deleteTaluka(id: number): Promise<boolean> {
    const result = await db.delete(talukas).where(eq(talukas.id, id));
    return result.rowCount > 0;
  }

  // Tehsils management
  async getAllTehsils(talukaId?: number): Promise<Tehsil[]> {
    if (talukaId) {
      return await db.select().from(tehsils).where(eq(tehsils.talukaId, talukaId)).orderBy(tehsils.name);
    }
    return await db.select().from(tehsils).orderBy(tehsils.name);
  }

  async getTehsil(id: number): Promise<Tehsil | undefined> {
    const [tehsil] = await db.select().from(tehsils).where(eq(tehsils.id, id));
    return tehsil;
  }

  async createTehsil(tehsilData: InsertTehsil): Promise<Tehsil> {
    const [created] = await db.insert(tehsils).values(tehsilData).returning();
    return created;
  }

  async updateTehsil(id: number, tehsilData: Partial<InsertTehsil>): Promise<Tehsil> {
    const [updated] = await db
      .update(tehsils)
      .set(tehsilData)
      .where(eq(tehsils.id, id))
      .returning();
    return updated;
  }

  async deleteTehsil(id: number): Promise<boolean> {
    const result = await db.delete(tehsils).where(eq(tehsils.id, id));
    return result.rowCount > 0;
  }

  // Stub implementations for other required methods
  async getFilteredProperties(): Promise<Property[]> { return []; }
  async getAllAgents(): Promise<Agent[]> { return []; }
  async getAgent(): Promise<Agent | undefined> { return undefined; }
  async createAgent(): Promise<Agent> { throw new Error("Not implemented"); }
  async updateAgent(): Promise<Agent> { throw new Error("Not implemented"); }
  async deleteAgent(): Promise<boolean> { return false; }
  // Homepage Images management
  async getAllHomepageImages(): Promise<HomepageImage[]> {
    const result = await db.select().from(homepageImages).orderBy(homepageImages.sortOrder, homepageImages.createdAt);
    return result;
  }

  async getHomepageImagesByType(imageType: string): Promise<HomepageImage[]> {
    const result = await db.select().from(homepageImages)
      .where(eq(homepageImages.imageType, imageType))
      .orderBy(homepageImages.sortOrder, homepageImages.createdAt);
    return result;
  }

  async getHomepageImage(id: number): Promise<HomepageImage | undefined> {
    const [image] = await db.select().from(homepageImages).where(eq(homepageImages.id, id));
    return image;
  }

  async createHomepageImage(imageData: InsertHomepageImage): Promise<HomepageImage> {
    const [created] = await db.insert(homepageImages).values(imageData).returning();
    return created;
  }

  async updateHomepageImage(id: number, imageData: Partial<InsertHomepageImage>): Promise<HomepageImage> {
    const [updated] = await db
      .update(homepageImages)
      .set(imageData)
      .where(eq(homepageImages.id, id))
      .returning();
    return updated;
  }

  async deleteHomepageImage(id: number): Promise<boolean> {
    const result = await db.delete(homepageImages).where(eq(homepageImages.id, id));
    return result.rowCount > 0;
  }

  // Contact Info management
  async getContactInfo(): Promise<ContactInfo | undefined> {
    const [info] = await db.select().from(contactInfo).limit(1);
    return info;
  }

  async updateContactInfo(infoData: Partial<InsertContactInfo>): Promise<ContactInfo> {
    // First check if contact info exists
    const existing = await this.getContactInfo();
    
    if (existing) {
      // Update existing record
      const [updated] = await db
        .update(contactInfo)
        .set(infoData)
        .where(eq(contactInfo.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new record
      const [created] = await db.insert(contactInfo).values(infoData as InsertContactInfo).returning();
      return created;
    }
  }

  // Property Types management
  async getAllPropertyTypes(): Promise<PropertyType[]> {
    const result = await db.select().from(propertyTypes).orderBy(propertyTypes.name);
    return result;
  }

  async getPropertyType(id: number): Promise<PropertyType | undefined> {
    const [type] = await db.select().from(propertyTypes).where(eq(propertyTypes.id, id));
    return type;
  }

  async createPropertyType(typeData: InsertPropertyType): Promise<PropertyType> {
    const [created] = await db.insert(propertyTypes).values(typeData).returning();
    return created;
  }

  async updatePropertyType(id: number, typeData: Partial<InsertPropertyType>): Promise<PropertyType> {
    const [updated] = await db
      .update(propertyTypes)
      .set(typeData)
      .where(eq(propertyTypes.id, id))
      .returning();
    return updated;
  }

  async deletePropertyType(id: number): Promise<boolean> {
    const result = await db.delete(propertyTypes).where(eq(propertyTypes.id, id));
    return result.rowCount > 0;
  }
}

// Export the database storage instance
export const dbStorage = new DbStorage();