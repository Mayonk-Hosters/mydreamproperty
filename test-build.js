var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc2) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc2 = __getOwnPropDesc(from, key)) || desc2.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  DEFAULT_PROPERTY_TYPES: () => DEFAULT_PROPERTY_TYPES,
  PROPERTY_STATUS: () => PROPERTY_STATUS,
  agentRatings: () => agentRatings,
  agentRatingsRelations: () => agentRatingsRelations,
  agents: () => agents,
  agentsRelations: () => agentsRelations,
  contactInfo: () => contactInfo,
  contactMessages: () => contactMessages,
  districts: () => districts,
  districtsRelations: () => districtsRelations,
  homeLoanInquiries: () => homeLoanInquiries,
  homeLoanInquiriesRelations: () => homeLoanInquiriesRelations,
  homepageImages: () => homepageImages,
  insertAgentRatingSchema: () => insertAgentRatingSchema,
  insertAgentSchema: () => insertAgentSchema,
  insertContactInfoSchema: () => insertContactInfoSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertDistrictSchema: () => insertDistrictSchema,
  insertHomeLoanInquirySchema: () => insertHomeLoanInquirySchema,
  insertHomepageImageSchema: () => insertHomepageImageSchema,
  insertPropertyInquirySchema: () => insertPropertyInquirySchema,
  insertPropertySchema: () => insertPropertySchema,
  insertPropertyTypeSchema: () => insertPropertyTypeSchema,
  insertStateSchema: () => insertStateSchema,
  insertTalukaSchema: () => insertTalukaSchema,
  insertTehsilSchema: () => insertTehsilSchema,
  insertUserSchema: () => insertUserSchema,
  properties: () => properties,
  propertiesRelations: () => propertiesRelations,
  propertyInquiries: () => propertyInquiries,
  propertyInquiriesRelations: () => propertyInquiriesRelations,
  propertyTypes: () => propertyTypes,
  sessions: () => sessions,
  states: () => states,
  statesRelations: () => statesRelations,
  talukas: () => talukas,
  talukasRelations: () => talukasRelations,
  tehsils: () => tehsils,
  tehsilsRelations: () => tehsilsRelations,
  updatePropertySchema: () => updatePropertySchema,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, real, jsonb, timestamp, decimal, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions, users, agents, agentRatings, states, districts, talukas, tehsils, properties, contactMessages, propertyInquiries, homeLoanInquiries, contactInfo, propertyTypes, homepageImages, usersRelations, agentsRelations, agentRatingsRelations, propertiesRelations, propertyInquiriesRelations, homeLoanInquiriesRelations, statesRelations, districtsRelations, talukasRelations, tehsilsRelations, insertUserSchema, insertAgentSchema, insertPropertySchema, updatePropertySchema, insertContactMessageSchema, insertPropertyInquirySchema, insertHomeLoanInquirySchema, insertContactInfoSchema, insertPropertyTypeSchema, insertHomepageImageSchema, insertStateSchema, insertDistrictSchema, insertTalukaSchema, insertTehsilSchema, insertAgentRatingSchema, DEFAULT_PROPERTY_TYPES, PROPERTY_STATUS;
var init_schema = __esm({
  "shared/schema.ts"() {
    sessions = pgTable(
      "sessions",
      {
        sid: varchar("sid").primaryKey(),
        sess: jsonb("sess").notNull(),
        expire: timestamp("expire").notNull()
      },
      (table) => [index("IDX_session_expire").on(table.expire)]
    );
    users = pgTable("users", {
      id: text("id").primaryKey().notNull(),
      email: text("email"),
      username: text("username"),
      password: text("password"),
      fullName: text("full_name"),
      profileImage: text("profile_image"),
      isAdmin: boolean("is_admin").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    agents = pgTable("agents", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      title: text("title").notNull(),
      image: text("image").notNull(),
      contactNumber: text("contact_number"),
      email: text("email"),
      deals: integer("deals").default(0),
      rating: real("rating").default(0),
      createdAt: timestamp("created_at").defaultNow()
    });
    agentRatings = pgTable("agent_ratings", {
      id: serial("id").primaryKey(),
      agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
      rating: integer("rating").notNull(),
      // 1-5 stars
      userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
      userEmail: text("user_email"),
      // For anonymous ratings
      comment: text("comment"),
      createdAt: timestamp("created_at").defaultNow()
    });
    states = pgTable("states", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      code: text("code"),
      createdAt: timestamp("created_at").defaultNow()
    });
    districts = pgTable("districts", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      stateId: integer("state_id").notNull().references(() => states.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    talukas = pgTable("talukas", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      districtId: integer("district_id").notNull().references(() => districts.id, { onDelete: "cascade" }),
      createdAt: timestamp("created_at").defaultNow()
    });
    tehsils = pgTable("tehsils", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      talukaId: integer("taluka_id").notNull().references(() => talukas.id, { onDelete: "cascade" }),
      area: text("area").default(""),
      createdAt: timestamp("created_at").defaultNow()
    });
    properties = pgTable("properties", {
      id: serial("id").primaryKey(),
      propertyNumber: text("property_number").unique(),
      title: text("title").notNull(),
      description: text("description").notNull(),
      price: decimal("price").notNull(),
      location: text("location").notNull(),
      address: text("address").notNull(),
      beds: integer("beds").notNull(),
      baths: real("baths").notNull(),
      area: integer("area").notNull(),
      areaUnit: text("area_unit").notNull().default("sqft"),
      yearBuilt: integer("year_built"),
      parking: integer("parking"),
      propertyType: text("property_type").notNull(),
      type: text("type").notNull().default("buy"),
      status: text("status").default("active"),
      featured: boolean("featured").default(false),
      features: jsonb("features").default([]),
      images: jsonb("images").notNull().default([]),
      mapUrl: text("map_url"),
      maharera_registered: boolean("maharera_registered").default(false),
      maharera_number: text("maharera_number"),
      agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
      stateId: integer("state_id").references(() => states.id),
      districtId: integer("district_id").references(() => districts.id),
      talukaId: integer("taluka_id").references(() => talukas.id),
      tehsilId: integer("tehsil_id").references(() => tehsils.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    contactMessages = pgTable("contact_messages", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      subject: text("subject").notNull(),
      message: text("message").notNull(),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    propertyInquiries = pgTable("property_inquiries", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      message: text("message"),
      propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
      inquiryType: text("inquiry_type").notNull().default("general"),
      budget: real("budget"),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    homeLoanInquiries = pgTable("home_loan_inquiries", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone").notNull(),
      loanType: text("loan_type"),
      loanAmount: real("loan_amount"),
      propertyLocation: text("property_location"),
      monthlyIncome: real("monthly_income"),
      employment: text("employment"),
      message: text("message"),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    contactInfo = pgTable("contact_info", {
      id: serial("id").primaryKey(),
      siteName: text("site_name").notNull().default("My Dream Property"),
      address: text("address").notNull(),
      phone1: text("phone1").notNull(),
      phone2: text("phone2"),
      email1: text("email1").notNull(),
      email2: text("email2"),
      businessHours: jsonb("business_hours").notNull().default({
        monday: "9:00 AM - 6:00 PM",
        tuesday: "9:00 AM - 6:00 PM",
        wednesday: "9:00 AM - 6:00 PM",
        thursday: "9:00 AM - 6:00 PM",
        friday: "9:00 AM - 6:00 PM",
        saturday: "10:00 AM - 4:00 PM",
        sunday: "Closed"
      }),
      mapUrl: text("map_url"),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    propertyTypes = pgTable("property_types", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    homepageImages = pgTable("homepage_images", {
      id: serial("id").primaryKey(),
      imageType: text("image_type").notNull(),
      imageUrl: text("image_url").notNull(),
      title: text("title"),
      description: text("description"),
      isActive: boolean("is_active").default(true),
      sortOrder: integer("sort_order").default(0),
      createdAt: timestamp("created_at").defaultNow(),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    usersRelations = relations(users, ({ many }) => ({}));
    agentsRelations = relations(agents, ({ many }) => ({
      properties: many(properties),
      ratings: many(agentRatings)
    }));
    agentRatingsRelations = relations(agentRatings, ({ one }) => ({
      agent: one(agents, {
        fields: [agentRatings.agentId],
        references: [agents.id]
      }),
      user: one(users, {
        fields: [agentRatings.userId],
        references: [users.id]
      })
    }));
    propertiesRelations = relations(properties, ({ one, many }) => ({
      agent: one(agents, {
        fields: [properties.agentId],
        references: [agents.id]
      }),
      state: one(states, {
        fields: [properties.stateId],
        references: [states.id]
      }),
      district: one(districts, {
        fields: [properties.districtId],
        references: [districts.id]
      }),
      taluka: one(talukas, {
        fields: [properties.talukaId],
        references: [talukas.id]
      }),
      tehsil: one(tehsils, {
        fields: [properties.tehsilId],
        references: [tehsils.id]
      }),
      propertyInquiries: many(propertyInquiries)
    }));
    propertyInquiriesRelations = relations(propertyInquiries, ({ one }) => ({
      property: one(properties, {
        fields: [propertyInquiries.propertyId],
        references: [properties.id]
      })
    }));
    homeLoanInquiriesRelations = relations(homeLoanInquiries, ({ one }) => ({}));
    statesRelations = relations(states, ({ many }) => ({
      districts: many(districts)
    }));
    districtsRelations = relations(districts, ({ one, many }) => ({
      state: one(states, {
        fields: [districts.stateId],
        references: [states.id]
      }),
      talukas: many(talukas)
    }));
    talukasRelations = relations(talukas, ({ one, many }) => ({
      district: one(districts, {
        fields: [talukas.districtId],
        references: [districts.id]
      }),
      tehsils: many(tehsils)
    }));
    tehsilsRelations = relations(tehsils, ({ one }) => ({
      taluka: one(talukas, {
        fields: [tehsils.talukaId],
        references: [talukas.id]
      })
    }));
    insertUserSchema = createInsertSchema(users);
    insertAgentSchema = createInsertSchema(agents).omit({
      id: true,
      createdAt: true
    });
    insertPropertySchema = createInsertSchema(properties).omit({
      id: true,
      createdAt: true
    }).partial({
      propertyNumber: true,
      stateId: true,
      districtId: true,
      talukaId: true,
      tehsilId: true
    }).extend({
      price: z.number().nonnegative("Price must be a non-negative number")
    });
    updatePropertySchema = insertPropertySchema.partial();
    insertContactMessageSchema = createInsertSchema(contactMessages).omit({
      id: true,
      createdAt: true,
      isRead: true
    }).extend({
      phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits")
    });
    insertPropertyInquirySchema = createInsertSchema(propertyInquiries).omit({
      id: true,
      createdAt: true,
      isRead: true
    }).extend({
      phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits").optional()
    });
    insertHomeLoanInquirySchema = createInsertSchema(homeLoanInquiries).omit({
      id: true,
      createdAt: true,
      isRead: true
    }).extend({
      phone: z.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits")
    });
    insertContactInfoSchema = createInsertSchema(contactInfo).omit({
      id: true,
      updatedAt: true
    });
    insertPropertyTypeSchema = createInsertSchema(propertyTypes).omit({
      id: true,
      createdAt: true
    });
    insertHomepageImageSchema = createInsertSchema(homepageImages).omit({
      id: true,
      createdAt: true,
      updatedAt: true
    });
    insertStateSchema = createInsertSchema(states).omit({
      id: true,
      createdAt: true
    });
    insertDistrictSchema = createInsertSchema(districts).omit({
      id: true,
      createdAt: true
    });
    insertTalukaSchema = createInsertSchema(talukas).omit({
      id: true,
      createdAt: true
    });
    insertTehsilSchema = createInsertSchema(tehsils).omit({
      id: true,
      createdAt: true
    });
    insertAgentRatingSchema = createInsertSchema(agentRatings).omit({
      id: true,
      createdAt: true
    }).extend({
      rating: z.number().min(1).max(5, "Rating must be between 1 and 5 stars")
    });
    DEFAULT_PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"];
    PROPERTY_STATUS = ["active", "pending", "sold"];
  }
});

// client/src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
var init_utils = __esm({
  "client/src/lib/utils.ts"() {
  }
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    init_schema();
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/db-storage.ts
import { eq as eq2, desc } from "drizzle-orm";
var DbStorage, dbStorage;
var init_db_storage = __esm({
  "server/db-storage.ts"() {
    init_schema();
    init_db();
    DbStorage = class {
      constructor() {
      }
      // User methods
      async getUser(id) {
        const result = await db.select().from(users).where(eq2(users.id, parseInt(id))).limit(1);
        return result[0];
      }
      async createUser(userData) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const [user] = await db.insert(users).values({
          id: userId,
          username: userData.username,
          password: userData.password,
          email: userData.email,
          fullName: userData.fullName,
          isAdmin: userData.isAdmin || false,
          createdAt: /* @__PURE__ */ new Date()
        }).returning();
        return user;
      }
      async upsertUser(userData) {
        if (userData.id) {
          const existing = await this.getUser(userData.id.toString());
          if (existing) {
            const [updated] = await db.update(users).set(userData).where(eq2(users.id, userData.id)).returning();
            return updated;
          }
        }
        const [created] = await db.insert(users).values(userData).returning();
        return created;
      }
      async getAllUsers() {
        return await db.select().from(users).orderBy(desc(users.createdAt));
      }
      async updateUser(id, userData) {
        const [updated] = await db.update(users).set(userData).where(eq2(users.id, parseInt(id))).returning();
        return updated;
      }
      async deleteUser(id) {
        const result = await db.delete(users).where(eq2(users.id, parseInt(id)));
        return result.rowCount > 0;
      }
      // Authentication methods
      async getUserByUsername(username) {
        const result = await db.select().from(users).where(eq2(users.username, username)).limit(1);
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq2(users.email, email)).limit(1);
        return result[0];
      }
      async getAgentByUsername(username) {
        const result = await db.select().from(agents).where(eq2(agents.email, username)).limit(1);
        return result[0];
      }
      async getClientByUsername(username) {
        return this.getUserByUsername(username);
      }
      // Optimized property fetching for superfast performance
      async getAllProperties(filters) {
        const result = await db.select({
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
          // Include location names for filtering
          stateName: states.name,
          districtName: districts.name,
          talukaName: talukas.name,
          tehsilName: tehsils.name
        }).from(properties).leftJoin(states, eq2(properties.stateId, states.id)).leftJoin(districts, eq2(properties.districtId, districts.id)).leftJoin(talukas, eq2(properties.talukaId, talukas.id)).leftJoin(tehsils, eq2(properties.tehsilId, tehsils.id)).where(eq2(properties.status, "active")).orderBy(desc(properties.createdAt));
        return result;
      }
      async getProperty(id) {
        const result = await db.select({
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
          tehsilName: tehsils.name
        }).from(properties).leftJoin(states, eq2(properties.stateId, states.id)).leftJoin(districts, eq2(properties.districtId, districts.id)).leftJoin(talukas, eq2(properties.talukaId, talukas.id)).leftJoin(tehsils, eq2(properties.tehsilId, tehsils.id)).where(eq2(properties.id, id)).limit(1);
        return result[0];
      }
      async createProperty(propertyData) {
        const [created] = await db.insert(properties).values(propertyData).returning();
        return created;
      }
      async updateProperty(id, propertyData) {
        const existing = await this.getProperty(id);
        if (!existing) {
          throw new Error("Property not found");
        }
        const updateData = {};
        const preservableFields = [
          "propertyNumber",
          "title",
          "description",
          "price",
          "location",
          "address",
          "beds",
          "baths",
          "area",
          "areaUnit",
          "yearBuilt",
          "parking",
          "propertyType",
          "type",
          "status",
          "featured",
          "features",
          "images",
          "mapUrl",
          "maharera_registered",
          "maharera_number",
          "agentId",
          "stateId",
          "districtId",
          "talukaId",
          "tehsilId",
          "createdAt"
        ];
        preservableFields.forEach((field) => {
          const newValue = propertyData[field];
          const existingValue = existing[field];
          if (newValue !== void 0 && newValue !== null) {
            if (typeof newValue === "string" && newValue === "" && existingValue) {
              updateData[field] = existingValue;
            } else {
              updateData[field] = newValue;
            }
          } else if (existingValue !== void 0 && existingValue !== null) {
            updateData[field] = existingValue;
          }
        });
        console.log(`Updating property ${id} with preserved data:`, updateData);
        const [updated] = await db.update(properties).set(updateData).where(eq2(properties.id, id)).returning();
        return updated;
      }
      async deleteProperty(id) {
        const result = await db.delete(properties).where(eq2(properties.id, id));
        return result.rowCount > 0;
      }
      // Property inquiry methods - NOW USING DATABASE
      async getAllPropertyInquiries() {
        return await db.select().from(propertyInquiries).orderBy(desc(propertyInquiries.createdAt));
      }
      async getPropertyInquiry(id) {
        const result = await db.select().from(propertyInquiries).where(eq2(propertyInquiries.id, id)).limit(1);
        return result[0];
      }
      async createPropertyInquiry(inquiryData) {
        const [created] = await db.insert(propertyInquiries).values(inquiryData).returning();
        return created;
      }
      async deletePropertyInquiry(id) {
        const result = await db.delete(propertyInquiries).where(eq2(propertyInquiries.id, id));
        return result.rowCount > 0;
      }
      async markPropertyInquiryAsRead(id) {
        const result = await db.update(propertyInquiries).set({ isRead: true }).where(eq2(propertyInquiries.id, id));
        return result.rowCount > 0;
      }
      async markPropertyInquiryAsUnread(id) {
        const result = await db.update(propertyInquiries).set({ isRead: false }).where(eq2(propertyInquiries.id, id));
        return result.rowCount > 0;
      }
      // Home loan inquiry methods - NOW USING DATABASE
      async getAllHomeLoanInquiries() {
        return await db.select().from(homeLoanInquiries).orderBy(desc(homeLoanInquiries.createdAt));
      }
      async getHomeLoanInquiry(id) {
        const result = await db.select().from(homeLoanInquiries).where(eq2(homeLoanInquiries.id, id)).limit(1);
        return result[0];
      }
      async createHomeLoanInquiry(inquiryData) {
        const [created] = await db.insert(homeLoanInquiries).values(inquiryData).returning();
        return created;
      }
      async deleteHomeLoanInquiry(id) {
        const result = await db.delete(homeLoanInquiries).where(eq2(homeLoanInquiries.id, id));
        return result.rowCount > 0;
      }
      async markHomeLoanInquiryAsRead(id) {
        const result = await db.update(homeLoanInquiries).set({ isRead: true }).where(eq2(homeLoanInquiries.id, id));
        return result.rowCount > 0;
      }
      async markHomeLoanInquiryAsUnread(id) {
        const result = await db.update(homeLoanInquiries).set({ isRead: false }).where(eq2(homeLoanInquiries.id, id));
        return result.rowCount > 0;
      }
      // Contact message methods - EXISTING DATABASE IMPLEMENTATION
      async getAllContactMessages() {
        return await db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt));
      }
      async getContactMessage(id) {
        const result = await db.select().from(contactMessages).where(eq2(contactMessages.id, id)).limit(1);
        return result[0];
      }
      async createContactMessage(messageData) {
        const [created] = await db.insert(contactMessages).values(messageData).returning();
        return created;
      }
      async deleteContactMessage(id) {
        const result = await db.delete(contactMessages).where(eq2(contactMessages.id, id));
        return result.rowCount > 0;
      }
      async markContactMessageAsRead(id) {
        const result = await db.update(contactMessages).set({ isRead: true }).where(eq2(contactMessages.id, id));
        return result.rowCount > 0;
      }
      async markContactMessageAsUnread(id) {
        const result = await db.update(contactMessages).set({ isRead: false }).where(eq2(contactMessages.id, id));
        return result.rowCount > 0;
      }
      // States management
      async getAllStates() {
        const result = await db.select().from(states).orderBy(states.name);
        return result;
      }
      async getState(id) {
        const [state] = await db.select().from(states).where(eq2(states.id, id));
        return state;
      }
      async createState(stateData) {
        const [created] = await db.insert(states).values(stateData).returning();
        return created;
      }
      async updateState(id, stateData) {
        const [updated] = await db.update(states).set(stateData).where(eq2(states.id, id)).returning();
        return updated;
      }
      async deleteState(id) {
        const result = await db.delete(states).where(eq2(states.id, id));
        return result.rowCount > 0;
      }
      // Districts management
      async getAllDistricts(stateId) {
        if (stateId) {
          return await db.select().from(districts).where(eq2(districts.stateId, stateId)).orderBy(districts.name);
        }
        return await db.select().from(districts).orderBy(districts.name);
      }
      async getDistrict(id) {
        const [district] = await db.select().from(districts).where(eq2(districts.id, id));
        return district;
      }
      async createDistrict(districtData) {
        const [created] = await db.insert(districts).values(districtData).returning();
        return created;
      }
      async updateDistrict(id, districtData) {
        const [updated] = await db.update(districts).set(districtData).where(eq2(districts.id, id)).returning();
        return updated;
      }
      async deleteDistrict(id) {
        const result = await db.delete(districts).where(eq2(districts.id, id));
        return result.rowCount > 0;
      }
      // Talukas management
      async getAllTalukas(districtId) {
        if (districtId) {
          return await db.select().from(talukas).where(eq2(talukas.districtId, districtId)).orderBy(talukas.name);
        }
        return await db.select().from(talukas).orderBy(talukas.name);
      }
      async getTaluka(id) {
        const [taluka] = await db.select().from(talukas).where(eq2(talukas.id, id));
        return taluka;
      }
      async createTaluka(talukaData) {
        const [created] = await db.insert(talukas).values(talukaData).returning();
        return created;
      }
      async updateTaluka(id, talukaData) {
        const [updated] = await db.update(talukas).set(talukaData).where(eq2(talukas.id, id)).returning();
        return updated;
      }
      async deleteTaluka(id) {
        const result = await db.delete(talukas).where(eq2(talukas.id, id));
        return result.rowCount > 0;
      }
      // Tehsils management
      async getAllTehsils(talukaId) {
        if (talukaId) {
          return await db.select().from(tehsils).where(eq2(tehsils.talukaId, talukaId)).orderBy(tehsils.name);
        }
        return await db.select().from(tehsils).orderBy(tehsils.name);
      }
      async getTehsil(id) {
        const [tehsil] = await db.select().from(tehsils).where(eq2(tehsils.id, id));
        return tehsil;
      }
      async createTehsil(tehsilData) {
        const [created] = await db.insert(tehsils).values(tehsilData).returning();
        return created;
      }
      async updateTehsil(id, tehsilData) {
        const [updated] = await db.update(tehsils).set(tehsilData).where(eq2(tehsils.id, id)).returning();
        return updated;
      }
      async deleteTehsil(id) {
        const result = await db.delete(tehsils).where(eq2(tehsils.id, id));
        return result.rowCount > 0;
      }
      // Stub implementations for other required methods
      async getFilteredProperties() {
        return [];
      }
      // Agent management methods
      async getAllAgents() {
        const result = await db.select().from(agents).orderBy(agents.name);
        return result;
      }
      async getAgent(id) {
        const [agent] = await db.select().from(agents).where(eq2(agents.id, id));
        return agent;
      }
      async createAgent(agentData) {
        const [created] = await db.insert(agents).values(agentData).returning();
        return created;
      }
      async updateAgent(id, agentData) {
        const [updated] = await db.update(agents).set(agentData).where(eq2(agents.id, id)).returning();
        return updated;
      }
      async deleteAgent(id) {
        const result = await db.delete(agents).where(eq2(agents.id, id));
        return (result.rowCount || 0) > 0;
      }
      // Homepage Images management
      async getAllHomepageImages() {
        const result = await db.select().from(homepageImages).orderBy(homepageImages.sortOrder, homepageImages.createdAt);
        return result;
      }
      async getHomepageImagesByType(imageType) {
        const result = await db.select().from(homepageImages).where(eq2(homepageImages.imageType, imageType)).orderBy(homepageImages.sortOrder, homepageImages.createdAt);
        return result;
      }
      async getHomepageImage(id) {
        const [image] = await db.select().from(homepageImages).where(eq2(homepageImages.id, id));
        return image;
      }
      async createHomepageImage(imageData) {
        const [created] = await db.insert(homepageImages).values(imageData).returning();
        return created;
      }
      async updateHomepageImage(id, imageData) {
        const [updated] = await db.update(homepageImages).set(imageData).where(eq2(homepageImages.id, id)).returning();
        return updated;
      }
      async deleteHomepageImage(id) {
        try {
          const result = await db.delete(homepageImages).where(eq2(homepageImages.id, id));
          console.log(`Homepage image deletion result for ID ${id}:`, result);
          return result.rowCount !== null && result.rowCount !== void 0 && result.rowCount > 0;
        } catch (error) {
          console.error(`Error deleting homepage image ${id}:`, error);
          throw error;
        }
      }
      // Contact Info management
      async getContactInfo() {
        const [info] = await db.select().from(contactInfo).limit(1);
        return info;
      }
      async updateContactInfo(infoData) {
        const existing = await this.getContactInfo();
        if (existing) {
          const [updated] = await db.update(contactInfo).set(infoData).where(eq2(contactInfo.id, existing.id)).returning();
          return updated;
        } else {
          const [created] = await db.insert(contactInfo).values(infoData).returning();
          return created;
        }
      }
      // Property Types management
      async getAllPropertyTypes() {
        const result = await db.select().from(propertyTypes).orderBy(propertyTypes.name);
        return result;
      }
      async getPropertyType(id) {
        const [type] = await db.select().from(propertyTypes).where(eq2(propertyTypes.id, id));
        return type;
      }
      async createPropertyType(typeData) {
        const [created] = await db.insert(propertyTypes).values(typeData).returning();
        return created;
      }
      async updatePropertyType(id, typeData) {
        const [updated] = await db.update(propertyTypes).set(typeData).where(eq2(propertyTypes.id, id)).returning();
        return updated;
      }
      async deletePropertyType(id) {
        const result = await db.delete(propertyTypes).where(eq2(propertyTypes.id, id));
        return result.rowCount > 0;
      }
    };
    dbStorage = new DbStorage();
  }
});

// server/storage.ts
import session from "express-session";
import memorystore from "memorystore";
var storage;
var init_storage = __esm({
  "server/storage.ts"() {
    init_schema();
    init_utils();
    init_db_storage();
    storage = dbStorage;
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth
});
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session2 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "default-secret-key-for-development",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1e3
      // 7 days
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session2(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (err) {
      next(err);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send("Not authenticated");
    res.json(req.user);
  });
  app2.get("/api/user/profile", async (_req, res) => {
    res.json({
      id: 1,
      username: "admin",
      fullName: "Admin User",
      email: "admin@example.com",
      isAdmin: true,
      profileImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3",
      password: "********",
      // Masked for security
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    });
  });
  app2.patch("/api/user/profile", async (req, res, _next) => {
    try {
      const allowedFields = ["fullName", "email", "profileImage"];
      const updateData = {};
      for (const field of allowedFields) {
        if (req.body[field] !== void 0) {
          updateData[field] = req.body[field];
        }
      }
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No valid fields to update" });
      }
      res.json({
        id: 1,
        username: "admin",
        fullName: updateData.fullName || "Admin User",
        email: updateData.email || "admin@example.com",
        profileImage: updateData.profileImage || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3",
        isAdmin: true,
        password: "********",
        // Masked for security
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      res.status(500).json({ message: "An error occurred while updating profile" });
    }
  });
  app2.get("/api/auth/check-admin", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.json({ isAdmin: false, userType: null });
    }
    const userType = req.session.userType || (req.user.isAdmin ? "admin" : "client");
    return res.json({
      isAdmin: !!req.user.isAdmin,
      userType
    });
  });
  app2.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userData = req.user;
    const userType = req.session.userType || (userData.isAdmin ? "admin" : "client");
    return res.json({
      ...userData,
      role: userData.role || userType
    });
  });
}
var scryptAsync;
var init_auth = __esm({
  "server/auth.ts"() {
    init_storage();
    scryptAsync = promisify(scrypt);
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
init_storage();
init_db();
init_db();
init_auth();
init_schema();
import { createServer } from "http";
import { z as z2 } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/email-service.ts
import nodemailer from "nodemailer";
var ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@localhost.com";
var transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  // Enhanced configuration for better compatibility
  tls: {
    rejectUnauthorized: false
  },
  // Add debugging for better error diagnostics
  debug: process.env.NODE_ENV === "development",
  logger: process.env.NODE_ENV === "development"
});
transporter.verify((error, success) => {
  if (error) {
    console.log("Email service authentication failed:", error.message);
    console.log("Possible solutions:");
    console.log("1. Ensure 2-factor authentication is enabled for the Gmail account");
    console.log("2. Use an App Password instead of the regular Gmail password");
    console.log('3. Enable "Less secure app access" in Gmail settings (not recommended)');
    console.log("Email notifications will be logged to console instead");
  } else {
    console.log("\u2705 Email service successfully configured and ready to send notifications");
  }
});
async function sendPropertyInquiryNotification(inquiry, propertyTitle) {
  const subject = `New Property Inquiry${propertyTitle ? ` for "${propertyTitle}"` : ""}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #2563eb;">New Property Inquiry</h2>
        ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ""}
        <p><strong>From:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone || "Not provided"}</p>
        ${inquiry.budget ? `<p><strong>Budget:</strong> \u20B9${inquiry.budget?.toLocaleString()}</p>` : ""}
        <p><strong>Message:</strong></p>
        <div style="background-color: #f9fafb; padding: 15px; border-left: 4px solid #2563eb;">
          ${inquiry.message?.replace(/\n/g, "<br>") || "No message provided"}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  return await sendEmail(subject, html, inquiry.email, inquiry.name);
}
async function sendHomeLoanInquiryNotification(inquiry) {
  const subject = "New Home Loan Inquiry";
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #059669;">New Home Loan Inquiry</h2>
        <p><strong>From:</strong> ${inquiry.name}</p>
        <p><strong>Email:</strong> ${inquiry.email}</p>
        <p><strong>Phone:</strong> ${inquiry.phone}</p>
        ${inquiry.loanType ? `<p><strong>Loan Type:</strong> ${inquiry.loanType}</p>` : ""}
        ${inquiry.loanAmount ? `<p><strong>Loan Amount:</strong> \u20B9${inquiry.loanAmount?.toLocaleString()}</p>` : ""}
        ${inquiry.propertyLocation ? `<p><strong>Property Location:</strong> ${inquiry.propertyLocation}</p>` : ""}
        ${inquiry.monthlyIncome ? `<p><strong>Monthly Income:</strong> \u20B9${inquiry.monthlyIncome?.toLocaleString()}</p>` : ""}
        ${inquiry.employment ? `<p><strong>Employment:</strong> ${inquiry.employment}</p>` : ""}
        <p><strong>Message:</strong></p>
        <div style="background-color: #f0fdf4; padding: 15px; border-left: 4px solid #059669;">
          ${inquiry.message?.replace(/\n/g, "<br>") || "No message provided"}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  return await sendEmail(subject, html, inquiry.email, inquiry.name);
}
async function sendContactMessageNotification(message) {
  const subject = `New Contact Message: ${message.subject}`;
  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #dc2626;">New Contact Message</h2>
        <p><strong>From:</strong> ${message.name}</p>
        <p><strong>Email:</strong> ${message.email}</p>
        <p><strong>Phone:</strong> ${message.phone || "Not provided"}</p>
        <p><strong>Subject:</strong> ${message.subject}</p>
        <p><strong>Message:</strong></p>
        <div style="background-color: #fef2f2; padding: 15px; border-left: 4px solid #dc2626;">
          ${message.message?.replace(/\n/g, "<br>")}
        </div>
        <hr style="margin: 20px 0;">
        <p style="color: #666; font-size: 12px;">This is an automated message from My Dream Property website.</p>
      </body>
    </html>
  `;
  return await sendEmail(subject, html, message.email, message.name);
}
async function sendEmail(subject, html, replyToEmail, replyToName) {
  try {
    const mailOptions = {
      from: {
        name: "My Dream Property",
        address: process.env.EMAIL_USER || "business@constroindia.com"
      },
      to: ADMIN_EMAIL,
      subject,
      html,
      replyTo: replyToEmail ? {
        name: replyToName || "",
        address: replyToEmail
      } : void 0
    };
    const result = await transporter.sendMail(mailOptions);
    console.log(`\u2705 Email notification sent successfully to ${ADMIN_EMAIL}:`, subject);
    return true;
  } catch (error) {
    console.log("\n\u{1F4E7} EMAIL NOTIFICATION (Email service not configured):");
    console.log("=".repeat(60));
    console.log(`To: ${ADMIN_EMAIL}`);
    console.log(`Subject: ${subject}`);
    if (replyToEmail) {
      console.log(`Reply-To: ${replyToName} <${replyToEmail}>`);
    }
    console.log("Content:", html.replace(/<[^>]*>/g, "").trim());
    console.log("=".repeat(60));
    console.log("Note: Configure EMAIL_USER and EMAIL_PASSWORD environment variables to enable email sending\n");
    return true;
  }
}

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport2 from "passport";
import session4 from "express-session";
import memoize from "memoizee";
import connectPg2 from "connect-pg-simple";

// server/auth-storage.ts
init_schema();
import session3 from "express-session";
import connectPg from "connect-pg-simple";
import { eq as eq3 } from "drizzle-orm";

// server/db/index.ts
init_schema();
import { Pool as Pool2, neonConfig } from "@neondatabase/serverless";
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool3 = new Pool2({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle2(pool3, { schema: schema_exports });

// server/auth-storage.ts
var AuthStorage = class {
  sessionStore;
  constructor() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
    const pgStore = connectPg(session3);
    this.sessionStore = new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
      ttl: sessionTtl,
      tableName: "sessions"
    });
  }
  // User methods for authentication
  async getUser(id) {
    const [user] = await db2.select().from(users).where(eq3(users.id, id));
    return user;
  }
  async getUserByEmail(email) {
    const [user] = await db2.select().from(users).where(eq3(users.email, email));
    return user;
  }
  async upsertUser(userData) {
    const userInsert = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName || userData.firstName,
      // Support both formats
      profileImage: userData.profileImage || userData.profileImageUrl,
      isAdmin: userData.isAdmin || false,
      // Keep existing username/password if this is an update
      username: userData.username || userData.email
      // Use email as username if not provided
      // Don't set password for OAuth users
    };
    const [user] = await db2.insert(users).values(userInsert).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userInsert
        // Don't override existing password during update
      }
    }).returning();
    return user;
  }
};
var authStorage = new AuthStorage();

// server/replitAuth.ts
if (!process.env.REPLIT_DOMAINS) {
  console.warn("Environment variable REPLIT_DOMAINS not provided, using default localhost");
  process.env.REPLIT_DOMAINS = "localhost";
}
var getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID && process.env.NODE_ENV === "development") {
      console.log("Running in local development mode with mock OIDC configuration");
      return {
        issuer: "https://localhost/oidc",
        authorization_endpoint: "https://localhost/auth",
        token_endpoint: "https://localhost/token",
        jwks_uri: "https://localhost/jwks",
        userinfo_endpoint: "https://localhost/userinfo"
      };
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID || "local-dev"
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg2(session4);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
    ttl: sessionTtl
  });
  return session4({
    secret: process.env.SESSION_SECRET || "replit-auth-secret",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  const existingUser = await authStorage.getUser(claims["sub"]);
  const user = await authStorage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    fullName: claims["first_name"] ? `${claims["first_name"]} ${claims["last_name"] || ""}`.trim() : null,
    profileImage: claims["profile_image_url"],
    // Preserve existing admin status if user exists
    isAdmin: existingUser ? existingUser.isAdmin : false
  });
  return user;
}
async function setupAuth2(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport2.initialize());
  app2.use(passport2.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      const dbUser = await upsertUser(tokens.claims());
      user.dbUser = dbUser;
      verified(null, user);
    } catch (error) {
      console.error("Authentication error:", error);
      verified(error);
    }
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport2.use(strategy);
  }
  passport2.serializeUser((user, cb) => cb(null, user));
  passport2.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport2.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport2.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login"
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
  app2.get("/api/auth/user", isAuthenticated, async (req, res) => {
    try {
      res.json(req.user.dbUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/auth/check-admin", async (req, res) => {
    try {
      if (req.isAuthenticated() && req.user && req.user.dbUser && req.user.dbUser.isAdmin) {
        return res.status(200).json({ isAdmin: true });
      }
      return res.status(200).json({ isAdmin: false });
    } catch (error) {
      console.error("Error checking admin status:", error);
      return res.status(200).json({ isAdmin: false });
    }
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user?.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    return res.redirect("/api/login");
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await config.refresh(refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    console.error("Token refresh failed:", error);
    return res.redirect("/api/login");
  }
};
var isAdmin = async (req, res, next) => {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  if (req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Access denied" });
};

// server/localAuth.ts
async function setupAuth3(app2) {
  console.log("Using local authentication system for development");
  app2.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "password") {
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
  app2.post("/api/logout", (req, res) => {
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
var isAdmin2 = (req, res, next) => {
  if (req.session && req.session.isAuthenticated && req.session.isAdmin) {
    return next();
  }
  return res.status(403).json({ message: "Forbidden" });
};

// server/admin-login.ts
init_storage();
import passport3 from "passport";
import { scrypt as scrypt2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
var scryptAsync2 = promisify2(scrypt2);
async function comparePasswords2(supplied, stored) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync2(supplied, salt, 64);
    return timingSafeEqual2(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAdminLogin(app2) {
  passport3.serializeUser((user, done) => {
    done(null, user);
  });
  passport3.deserializeUser((user, done) => {
    done(null, user);
  });
  app2.post("/api/traditional-login", async (req, res) => {
    try {
      const { username, password, userType } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (userType === "admin" || !userType && username === "admin") {
        if (username === "admin" && password === "admin123" || username === "Smileplz004" && password === "9923000500@rahul" || username === "ahmednagarproperty" && password === "9923000500@rahul") {
          const adminUser = {
            id: username === "admin" ? 1 : "admin-dev",
            username,
            fullName: "Admin User",
            email: username === "admin" ? null : "admin@example.com",
            isAdmin: true,
            role: "admin",
            profileImage: null,
            createdAt: (/* @__PURE__ */ new Date()).toISOString()
          };
          req.session.isAdmin = true;
          req.session.userType = "admin";
          req.session.user = adminUser;
          req.session.authenticatedAdmin = true;
          if (!req.session.passport) {
            req.session.passport = {};
          }
          req.session.passport.user = adminUser.id;
          req.session.save((err) => {
            if (err) {
              console.error("Session save error:", err);
              return res.status(500).json({ message: "Session save failed" });
            }
            console.log("Admin session saved successfully:", {
              isAdmin: req.session.isAdmin,
              userType: req.session.userType,
              authenticatedAdmin: req.session.authenticatedAdmin,
              sessionID: req.sessionID,
              environment: process.env.NODE_ENV
            });
            res.status(200).json(adminUser);
          });
          return;
        }
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      try {
        const user = await storage.getUserByUsername(username);
        if (!user) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        const passwordsMatch = await comparePasswords2(password, user.password || "");
        if (!passwordsMatch) {
          return res.status(401).json({ message: "Invalid username or password" });
        }
        req.session.isAdmin = !!user.isAdmin;
        req.session.userType = user.isAdmin ? "admin" : "user";
        req.session.user = user;
        if (!req.session.passport) {
          req.session.passport = {};
        }
        req.session.passport.user = user.id;
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ message: "Session save failed" });
          }
          console.log("Database user login session established:", {
            isAdmin: req.session.isAdmin,
            userType: req.session.userType,
            sessionID: req.sessionID,
            passportUser: req.session.passport?.user
          });
          const { password: _, ...userData } = user;
          res.status(200).json(userData);
        });
      } catch (error) {
        console.error("Database login error:", error);
        return res.status(500).json({ message: "Login failed" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/user", (req, res) => {
    console.log("Auth user check - Session state:", {
      sessionID: req.sessionID,
      sessionExists: !!req.session,
      sessionIsAdmin: req.session?.isAdmin,
      sessionUserType: req.session?.userType,
      sessionUser: req.session?.user,
      cookies: req.headers.cookie,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user
    });
    if (req.session && req.session.isAdmin && req.session.user) {
      console.log("Session auth successful, returning user:", req.session.user);
      return res.json(req.session.user);
    }
    if (req.isAuthenticated && req.isAuthenticated() && req.user) {
      console.log("Passport auth successful, returning user:", req.user);
      return res.json(req.user);
    }
    console.log("No valid authentication found");
    return res.status(401).json({ message: "Unauthorized" });
  });
  app2.get("/api/auth/check-admin", (req, res) => {
    console.log("Check admin endpoint - Session state:", {
      hasSession: !!req.session,
      sessionIsAdmin: req.session?.isAdmin,
      sessionUserType: req.session?.userType,
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      user: req.user
    });
    if (req.session && req.session.isAdmin) {
      console.log("Admin access granted via session");
      return res.json({ isAdmin: true });
    }
    if (req.isAuthenticated && req.isAuthenticated() && req.user?.isAdmin) {
      console.log("Admin access granted via OAuth");
      return res.json({ isAdmin: true });
    }
    if (process.env.NODE_ENV === "development" && req.isAuthenticated()) {
      if (req.user && req.user.username === "Smileplz004") {
        return res.json({ isAdmin: true });
      }
    }
    console.log("Admin access denied");
    res.json({ isAdmin: false });
  });
}

// server/routes.ts
import cookieParser from "cookie-parser";
import session5 from "express-session";
import passport4 from "passport";
import MemoryStore from "memorystore";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

// server/routes/mdp-properties.ts
init_db();
init_schema();
import { Router } from "express";
import { like as like2 } from "drizzle-orm";
var router = Router();
router.get("/", async (req, res) => {
  try {
    const mdpProperties = await db.select().from(properties).where(like2(properties.propertyNumber, "MDP%")).orderBy(properties.id);
    res.json(mdpProperties);
  } catch (error) {
    console.error("Error fetching MDP properties:", error);
    res.status(500).json({ message: "Failed to fetch MDP properties" });
  }
});
router.get("/:type", async (req, res) => {
  try {
    const { type } = req.params;
    if (type !== "rent" && type !== "buy") {
      return res.status(400).json({ message: 'Invalid property type. Must be "rent" or "buy".' });
    }
    const mdpPropertiesByType = await db.select().from(properties).where(like2(properties.propertyNumber, "MDP%")).where(eq(properties.type, type)).orderBy(properties.id);
    res.json(mdpPropertiesByType);
  } catch (error) {
    console.error("Error fetching MDP properties by type:", error);
    res.status(500).json({ message: "Failed to fetch MDP properties" });
  }
});
var mdp_properties_default = router;

// server/routes.ts
import { eq as eq4 } from "drizzle-orm";
var isLocalDev = process.env.LOCAL_DEV === "true";
var setupAuth4 = isLocalDev ? setupAuth3 : setupAuth2;
var isAdmin3 = isLocalDev ? isAdmin2 : isAdmin;
var getUploadDir = () => {
  if (process.env.NODE_ENV === "production") {
    const currentDir = dirname(fileURLToPath(import.meta.url));
    return path.join(currentDir, "..", "static", "uploads");
  }
  return path.join(process.cwd(), "static", "uploads");
};
var uploadDir = getUploadDir();
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
var multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname));
  }
});
var upload = multer({
  storage: multerStorage,
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log("File upload filter check:", {
      originalname: file.originalname,
      mimetype: file.mimetype,
      fieldname: file.fieldname,
      encoding: file.encoding
    });
    if (!file.originalname || file.originalname === "") {
      console.log("File rejected - no filename provided");
      return cb(new Error("No file selected"));
    }
    const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|bmp|tiff|svg)$/i;
    const allowedMimeTypes = /^image\//i;
    const extname = allowedExtensions.test(file.originalname);
    const mimetype = allowedMimeTypes.test(file.mimetype || "");
    console.log("File validation:", {
      extname,
      mimetype,
      originalname: file.originalname,
      detectedMime: file.mimetype
    });
    if (mimetype || extname) {
      console.log("File accepted for upload");
      return cb(null, true);
    } else {
      console.log("File rejected - not an image file");
      cb(new Error("Only image files are allowed. Please select a JPG, PNG, GIF, or WebP image."));
    }
  }
});
function checkAdminAccess(req) {
  console.log("Checking admin access:", {
    hasSession: !!req.session,
    sessionIsAdmin: req.session?.isAdmin,
    sessionUserType: req.session?.userType,
    sessionKeys: req.session ? Object.keys(req.session) : [],
    hasUser: !!req.user,
    userIsAdmin: req.user?.isAdmin,
    environment: process.env.NODE_ENV
  });
  if (req.session && req.session.isAdmin) {
    console.log("Admin access granted via session.isAdmin");
    return true;
  }
  if (req.session && req.session.userType === "admin") {
    console.log("Admin access granted via session.userType");
    return true;
  }
  if (req.session && req.session.authenticatedAdmin) {
    console.log("Admin access granted via session.authenticatedAdmin");
    return true;
  }
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
    console.log("Admin access granted via OAuth dbUser.isAdmin");
    return true;
  }
  if (req.user && req.user?.isAdmin) {
    console.log("Admin access granted via user.isAdmin");
    return true;
  }
  if (process.env.NODE_ENV === "development" && req.session && Object.keys(req.session).length > 1) {
    console.log("Admin access granted via development mode with session");
    return true;
  }
  console.log("Admin access denied");
  return false;
}
var requireAdmin = (req, res, next) => {
  if (checkAdminAccess(req)) {
    return next();
  }
  console.log("Admin access denied:", {
    hasSession: !!req.session,
    isAdmin: req.session?.isAdmin,
    hasUser: !!req.user,
    userIsAdmin: req.user?.isAdmin,
    environment: process.env.NODE_ENV
  });
  return res.status(403).json({
    message: "Admin access required",
    error: "ADMIN_ACCESS_DENIED"
  });
};
async function registerRoutes(app2) {
  app2.use(cookieParser());
  const MemoryStoreSession = MemoryStore(session5);
  app2.use(session5({
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStoreSession({
      checkPeriod: 864e5
      // prune expired entries every 24h
    }),
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 1 day
      secure: false,
      // Always false for development
      sameSite: "lax"
    },
    name: "sessionId"
  }));
  app2.use(passport4.initialize());
  app2.use(passport4.session());
  await setupAuth4(app2);
  setupAdminLogin(app2);
  app2.get("/api/auth/check-admin", async (req, res) => {
    try {
      if (req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        return res.status(200).json({ isAdmin: true });
      } else if (req.isAuthenticated() && req.user?.claims?.sub) {
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
  const contactFormSchema = z2.object({
    name: z2.string().min(2, "Name must be at least 2 characters"),
    email: z2.string().email("Please enter a valid email address"),
    phone: z2.string().length(10, "Phone number must be exactly 10 digits").regex(/^\d+$/, "Phone number must contain only digits"),
    message: z2.string().min(10, "Message must be at least 10 characters"),
    subject: z2.string().min(3, "Subject must be at least 3 characters")
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      console.log("Received contact form data:", req.body);
      console.log("Validating phone number:", req.body.phone);
      const validatedData = contactFormSchema.parse(req.body);
      console.log("Phone validation passed:", validatedData.phone);
      const contactData = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone || "",
        subject: validatedData.subject,
        message: validatedData.message,
        isRead: false
      };
      const newMessage = await storage.createContactMessage(contactData);
      console.log("Contact form submission saved:", newMessage);
      try {
        await sendContactMessageNotification(newMessage);
        console.log(`Email notification sent for contact message ID: ${newMessage.id}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
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
  app2.get("/api/properties", async (req, res) => {
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
      const filters = {};
      if (type) filters.type = type;
      if (propertyType && propertyType !== "any") filters.propertyType = propertyType;
      if (location) filters.location = location;
      if (minPrice) filters.minPrice = parseFloat(minPrice);
      if (maxPrice) filters.maxPrice = parseFloat(maxPrice);
      if (minBeds) filters.minBeds = parseInt(minBeds);
      if (minBaths) filters.minBaths = parseFloat(minBaths);
      if (featured === "true") filters.featured = true;
      if (agentId) filters.agentId = parseInt(agentId);
      const properties3 = await storage.getAllProperties(Object.keys(filters).length > 0 ? filters : void 0);
      res.json(properties3);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });
  app2.get("/api/properties/counts-by-type", async (_req, res) => {
    try {
      const allProperties = await storage.getAllProperties();
      const typeCounts = /* @__PURE__ */ new Map();
      allProperties.forEach((property) => {
        const type = property.propertyType;
        if (type) {
          typeCounts.set(type, (typeCounts.get(type) || 0) + 1);
        }
      });
      const priorityTypes = ["House", "Apartment", "Villa", "Commercial"];
      const counts = [];
      priorityTypes.forEach((type) => {
        if (typeCounts.has(type)) {
          counts.push({ propertyType: type, count: typeCounts.get(type) });
          typeCounts.delete(type);
        }
      });
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
  app2.get("/api/properties/:id", async (req, res) => {
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
  app2.post("/api/properties", async (req, res) => {
    try {
      const requestData = req.body;
      const propertyData = {
        title: requestData.title || "Untitled Property",
        description: requestData.description || "No description provided",
        price: Number(requestData.price) || 0,
        location: requestData.location || "Location not specified",
        address: requestData.address || "Address not provided",
        beds: Number(requestData.beds) || 0,
        baths: Number(requestData.baths) || 0,
        area: Number(requestData.area) || 0,
        propertyType: requestData.propertyType || "House",
        type: requestData.type || "buy",
        status: requestData.status || "active",
        // Ensure featured is properly stored as a boolean
        featured: requestData.featured === true || requestData.featured === "true" || requestData.featured === "t" || requestData.featured === "1" || requestData.featured === 1,
        // Handle features - ensure it's always saved as a proper JSON array
        features: Array.isArray(requestData.features) ? requestData.features : typeof requestData.features === "string" ? requestData.features ? JSON.parse(requestData.features) : [] : [],
        // Save Google Maps URL if provided
        map_url: requestData.mapUrl || null,
        images: Array.isArray(requestData.images) ? requestData.images : [],
        agentId: Number(requestData.agentId) || 1,
        // Handle MahaRERA registration fields
        maharera_registered: requestData.maharera_registered === true || requestData.maharera_registered === "true" || requestData.maharera_registered === "t" || requestData.maharera_registered === "1" || requestData.maharera_registered === 1,
        maharera_number: requestData.maharera_number || null
      };
      const locationData = {};
      if (requestData.stateId) {
        locationData.stateId = Number(requestData.stateId);
      }
      if (requestData.districtId) {
        locationData.districtId = Number(requestData.districtId);
      }
      if (requestData.talukaId) {
        locationData.talukaId = Number(requestData.talukaId);
      }
      if (requestData.tehsilId) {
        locationData.tehsilId = Number(requestData.tehsilId);
      }
      Object.assign(propertyData, locationData);
      if (!requestData.propertyNumber || requestData.propertyNumber === "AUTO-GENERATE") {
        try {
          const prefix = "MDP";
          const query = `
            SELECT property_number 
            FROM properties 
            WHERE property_number LIKE 'MDP-%'
            ORDER BY property_number DESC
          `;
          const result = await pool.query(query);
          const existingNumbers = result.rows;
          let highestNumber = 0;
          for (const row of existingNumbers) {
            if (row.property_number) {
              const matches = row.property_number.match(/MDP-[RB]?(\d+)/);
              if (matches && matches[1]) {
                const num = parseInt(matches[1], 10);
                if (!isNaN(num) && num > highestNumber) {
                  highestNumber = num;
                }
              }
            }
          }
          if (!global.lastUsedPropertyNumber) {
            global.lastUsedPropertyNumber = highestNumber;
          }
          const lastUsed = global.lastUsedPropertyNumber || 0;
          const nextNumber = Math.max(highestNumber, lastUsed) + 1;
          global.lastUsedPropertyNumber = nextNumber;
          const paddedNumber = nextNumber.toString().padStart(4, "0");
          propertyData.propertyNumber = `MDP-${paddedNumber}`;
          console.log(`Generated property number: ${propertyData.propertyNumber} (highest was ${highestNumber}, last used: ${lastUsed})`);
        } catch (error) {
          console.error("Error generating property number:", error);
          const timestamp2 = (/* @__PURE__ */ new Date()).getTime().toString().slice(-6);
          propertyData.propertyNumber = `MDP-${timestamp2}`;
          console.log(`Fallback property number generated: ${propertyData.propertyNumber}`);
        }
      } else {
        propertyData.propertyNumber = requestData.propertyNumber;
      }
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
  app2.patch("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      const requestData = req.body;
      if (requestData.features) {
        requestData.features = Array.isArray(requestData.features) ? requestData.features : typeof requestData.features === "string" ? requestData.features ? JSON.parse(requestData.features) : [] : [];
      }
      if (requestData.mapUrl) {
        requestData.map_url = requestData.mapUrl;
      }
      const maharera_registered = requestData.maharera_registered === true || requestData.maharera_registered === "true" || requestData.maharera_registered === "t" || requestData.maharera_registered === "1" || requestData.maharera_registered === 1;
      const maharera_number = requestData.maharera_number || null;
      requestData.maharera_registered = maharera_registered;
      requestData.maharera_number = maharera_number;
      const propertyData = updatePropertySchema.parse(requestData);
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
  app2.put("/api/properties/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      const requestData = req.body;
      if (requestData.features) {
        requestData.features = Array.isArray(requestData.features) ? requestData.features : typeof requestData.features === "string" ? requestData.features ? JSON.parse(requestData.features) : [] : [];
      }
      if (requestData.mapUrl) {
        requestData.map_url = requestData.mapUrl;
      }
      const maharera_registered = requestData.maharera_registered === true || requestData.maharera_registered === "true" || requestData.maharera_registered === "t" || requestData.maharera_registered === "1" || requestData.maharera_registered === 1;
      const maharera_number = requestData.maharera_number || null;
      requestData.maharera_registered = maharera_registered;
      requestData.maharera_number = maharera_number;
      const propertyData = updatePropertySchema.parse(requestData);
      console.log(`PUT update for property ${id}:`, JSON.stringify(propertyData, null, 2));
      const updatedProperty = await storage.updateProperty(id, propertyData);
      console.log(`Updated property result:`, JSON.stringify(updatedProperty, null, 2));
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
  app2.patch("/api/properties/:id/toggle-featured", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid property ID" });
      }
      const property = await storage.getProperty(id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      let currentFeatured = false;
      if (typeof property.featured === "boolean") {
        currentFeatured = property.featured;
      } else if (typeof property.featured === "string") {
        currentFeatured = property.featured === "t" || property.featured === "true" || property.featured === "1";
      } else if (typeof property.featured === "number") {
        currentFeatured = property.featured === 1;
      }
      const updatedProperty = await storage.updateProperty(id, {
        ...property,
        featured: !currentFeatured
      });
      console.log(`Property ${id} featured status toggled from ${currentFeatured} to ${!currentFeatured}`);
      res.json(updatedProperty);
    } catch (error) {
      console.error("Error toggling property featured status:", error);
      res.status(500).json({ message: "Failed to update featured status" });
    }
  });
  app2.delete("/api/properties/:id", async (req, res) => {
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
  app2.get("/api/available-property-types", async (_req, res) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT property_type 
        FROM properties 
        WHERE status = 'active' AND property_type IS NOT NULL
        ORDER BY property_type
      `);
      const propertyTypes3 = result.rows.map((row) => row.property_type);
      res.json(propertyTypes3);
    } catch (error) {
      console.error("Error fetching available property types:", error);
      res.status(500).json({ message: "Failed to fetch available property types" });
    }
  });
  app2.get("/api/agents", async (_req, res) => {
    try {
      const agents3 = await storage.getAllAgents();
      res.json(agents3);
    } catch (error) {
      console.error("Error fetching agents:", error);
      res.status(500).json({ message: "Failed to fetch agents" });
    }
  });
  app2.get("/api/agents/:id", async (req, res) => {
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
  app2.post("/api/agents", async (req, res) => {
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
  app2.patch("/api/agents/:id", async (req, res) => {
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
  app2.delete("/api/agents/:id", async (req, res) => {
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
  app2.post("/api/agents/:id/rate", async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      if (isNaN(agentId)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      const validatedData = insertAgentRatingSchema.parse({
        ...req.body,
        agentId
      });
      const [newRating] = await db.insert(agentRatings).values({
        agentId: validatedData.agentId,
        rating: validatedData.rating
      }).returning();
      const allRatings = await db.select().from(agentRatings).where(eq4(agentRatings.agentId, agentId));
      const averageRating = allRatings.reduce((sum, rating) => sum + rating.rating, 0) / allRatings.length;
      await db.update(agents).set({
        rating: averageRating.toFixed(1)
      }).where(eq4(agents.id, agentId));
      res.status(201).json(newRating);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation error",
          errors: fromZodError(error).message
        });
      }
      console.error("Error submitting rating:", error);
      res.status(500).json({ message: "Failed to submit rating" });
    }
  });
  app2.get("/api/agents/:id/ratings", async (req, res) => {
    try {
      const agentId = parseInt(req.params.id);
      if (isNaN(agentId)) {
        return res.status(400).json({ message: "Invalid agent ID" });
      }
      const ratings = await db.select().from(agentRatings).where(eq4(agentRatings.agentId, agentId));
      res.json(ratings);
    } catch (error) {
      console.error("Error fetching agent ratings:", error);
      res.status(500).json({ message: "Failed to fetch ratings" });
    }
  });
  app2.get("/api/inquiries", async (_req, res) => {
    try {
      const inquiries = await storage.getAllPropertyInquiries();
      res.json(inquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ message: "Failed to fetch inquiries" });
    }
  });
  app2.delete("/api/inquiries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      const inquiry = await storage.getPropertyInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      const deleted = await storage.deletePropertyInquiry(id);
      if (deleted) {
        res.json({ success: true, message: "Inquiry deleted successfully" });
      } else {
        res.status(500).json({ message: "Failed to delete inquiry" });
      }
    } catch (error) {
      console.error("Error deleting inquiry:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });
  app2.patch("/api/inquiries/mark-read", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const { ids, id } = req.body;
      let inquiryIds = [];
      if (Array.isArray(ids) && ids.length > 0) {
        inquiryIds = ids;
      } else if (id !== void 0) {
        inquiryIds = [id];
      } else if (!ids) {
        const inquiries = await storage.getAllPropertyInquiries();
        inquiryIds = inquiries.filter((inq) => !inq.isRead).map((inq) => inq.id);
      }
      if (inquiryIds.length === 0) {
        return res.status(200).json({ success: true, message: "No inquiries to mark as read" });
      }
      const results = await Promise.all(inquiryIds.map(async (id2) => {
        return await storage.markPropertyInquiryAsRead(id2);
      }));
      const successCount = results.filter((success) => success).length;
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
  app2.post("/api/inquiries", async (req, res) => {
    try {
      const inquiryData = insertPropertyInquirySchema.parse({
        ...req.body,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      const newInquiry = await storage.createPropertyInquiry(inquiryData);
      let propertyTitle;
      if (inquiryData.propertyId) {
        const property = await storage.getProperty(inquiryData.propertyId);
        if (property) {
          propertyTitle = property.title;
        }
      }
      try {
        await sendPropertyInquiryNotification(newInquiry, propertyTitle);
        console.log(`Email notification sent for inquiry ID: ${newInquiry.id}`);
      } catch (emailError) {
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
  app2.use("/api/mdp-properties", mdp_properties_default);
  app2.get("/api/locations/states", async (_req, res) => {
    try {
      const states3 = await storage.getAllStates();
      res.json(states3);
    } catch (error) {
      console.error("Error fetching states:", error);
      res.status(500).json({ message: "Failed to fetch states" });
    }
  });
  app2.get("/api/locations/states/:id", async (req, res) => {
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
  app2.post("/api/locations/states", async (req, res) => {
    try {
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
  app2.patch("/api/locations/states/:id", async (req, res) => {
    try {
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
  app2.delete("/api/locations/states/:id", async (req, res) => {
    try {
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
  app2.get("/api/locations/districts", async (req, res) => {
    try {
      const stateId = req.query.stateId ? parseInt(req.query.stateId) : void 0;
      const districts3 = await storage.getAllDistricts(stateId);
      res.json(districts3);
    } catch (error) {
      console.error("Error fetching districts:", error);
      res.status(500).json({ message: "Failed to fetch districts" });
    }
  });
  app2.get("/api/locations/districts/:id", async (req, res) => {
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
  app2.post("/api/locations/districts", async (req, res) => {
    try {
      const districtData = insertDistrictSchema.parse(req.body);
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
  app2.patch("/api/locations/districts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid district ID" });
      }
      const districtData = insertDistrictSchema.partial().parse(req.body);
      if (districtData.stateId !== void 0) {
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
  app2.delete("/api/locations/districts/:id", async (req, res) => {
    try {
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
  app2.get("/api/locations/talukas", async (req, res) => {
    try {
      const districtId = req.query.districtId ? parseInt(req.query.districtId) : void 0;
      const talukas3 = await storage.getAllTalukas(districtId);
      res.json(talukas3);
    } catch (error) {
      console.error("Error fetching talukas:", error);
      res.status(500).json({ message: "Failed to fetch talukas" });
    }
  });
  app2.get("/api/locations/talukas/:id", async (req, res) => {
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
  app2.post("/api/locations/talukas", async (req, res) => {
    try {
      const talukaData = insertTalukaSchema.parse(req.body);
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
  app2.patch("/api/locations/talukas/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid taluka ID" });
      }
      const talukaData = insertTalukaSchema.partial().parse(req.body);
      if (talukaData.districtId !== void 0) {
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
  app2.delete("/api/locations/talukas/:id", async (req, res) => {
    try {
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
  app2.get("/api/locations/tehsils", async (req, res) => {
    try {
      const talukaId = req.query.talukaId ? parseInt(req.query.talukaId) : void 0;
      const tehsils3 = await storage.getAllTehsils(talukaId);
      res.json(tehsils3);
    } catch (error) {
      console.error("Error fetching tehsils:", error);
      res.status(500).json({ message: "Failed to fetch tehsils" });
    }
  });
  app2.get("/api/locations/tehsils/:id", async (req, res) => {
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
  app2.post("/api/locations/tehsils", async (req, res) => {
    try {
      const tehsilData = insertTehsilSchema.parse(req.body);
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
  app2.patch("/api/locations/tehsils/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid tehsil ID" });
      }
      const tehsilData = insertTehsilSchema.partial().parse(req.body);
      if (tehsilData.talukaId !== void 0) {
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
  app2.delete("/api/locations/tehsils/:id", async (req, res) => {
    try {
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
  app2.get("/api/tehsils-with-properties", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT DISTINCT t.id, t.name, COUNT(p.id) as property_count 
        FROM tehsils t 
        LEFT JOIN properties p ON p.tehsil_id = t.id 
        GROUP BY t.id, t.name 
        HAVING COUNT(p.id) > 0 
        ORDER BY property_count DESC 
        LIMIT 10
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching tehsils with properties:", error);
      res.status(500).json({ message: "Failed to fetch tehsils with properties" });
    }
  });
  app2.get("/api/contact-info", async (_req, res) => {
    try {
      const contactInfo3 = await storage.getContactInfo();
      if (!contactInfo3) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      res.json(contactInfo3);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });
  app2.post("/api/contact-info", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
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
  app2.put("/api/contact-info", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
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
  app2.get("/api/users", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const users3 = await storage.getAllUsers();
      const sanitizedUsers = users3.map((user) => {
        const { password, ...rest } = user;
        return rest;
      });
      res.json(sanitizedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  app2.get("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
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
      const { password, ...sanitizedUser } = user;
      res.json(sanitizedUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.post("/api/users", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const { username, password, isAdmin: isAdmin4 } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const hashedPassword = await hashPassword(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: isAdmin4 || false
      });
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
  app2.patch("/api/users/:id", async (req, res) => {
    try {
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      const existingUser = await storage.getUser(id);
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { username, password, isAdmin: isAdmin4 } = req.body;
      if (username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      const updateData = {};
      if (username) updateData.username = username;
      if (isAdmin4 !== void 0) updateData.isAdmin = isAdmin4;
      if (password && password.trim() !== "") {
        const { hashPassword: hashPassword2 } = (init_auth(), __toCommonJS(auth_exports));
        updateData.password = await hashPassword2(password);
      }
      const updatedUser = await storage.updateUser(id, updateData);
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
  app2.delete("/api/users/:id", async (req, res) => {
    try {
      const hasAdminAccess = checkAdminAccess(req);
      if (!hasAdminAccess) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (req.user && id === req.user.id) {
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
  app2.get("/api/property-types", async (_req, res) => {
    try {
      const propertyTypes3 = await storage.getAllPropertyTypes();
      res.json(propertyTypes3);
    } catch (error) {
      console.error("Error fetching property types:", error);
      res.status(500).json({ message: "Failed to fetch property types" });
    }
  });
  app2.get("/api/property-types/:id", async (req, res) => {
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
  app2.post("/api/property-types", async (req, res) => {
    try {
      console.log("Creating property type with data:", req.body);
      const propertyTypeData = insertPropertyTypeSchema.parse(req.body);
      console.log("Parsed property type data:", propertyTypeData);
      try {
        const newPropertyType = await storage.createPropertyType(propertyTypeData);
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
  app2.patch("/api/property-types/:id", async (req, res) => {
    try {
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
  app2.delete("/api/property-types/:id", async (req, res) => {
    try {
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
  app2.post("/api/contact-messages", async (req, res) => {
    try {
      const messageData = insertContactMessageSchema.parse(req.body);
      const newMessage = await storage.createContactMessage(messageData);
      try {
        await sendContactMessageNotification(newMessage);
        console.log(`Email notification sent for contact message ID: ${newMessage.id}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      res.status(201).json(newMessage);
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedError = fromZodError(error);
        return res.status(400).json({ message: formattedError.message });
      }
      console.error("Error creating contact message:", error);
      res.status(500).json({ message: "Failed to create contact message" });
    }
  });
  app2.get("/api/contact-messages", requireAdmin, async (req, res) => {
    try {
      const messages = await storage.getAllContactMessages();
      res.json(messages);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });
  app2.get("/api/contact-info", async (req, res) => {
    try {
      const contactInfo3 = await storage.getContactInfo();
      if (!contactInfo3) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      res.json(contactInfo3);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });
  app2.get("/api/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
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
  app2.patch("/api/contact-messages/:id/mark-read", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      try {
        const success = await storage.markContactMessageAsRead(id);
        if (success) {
          return res.json({ success: true });
        }
      } catch (storageError) {
        console.error("Error marking message as read using storage method:", storageError);
      }
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
        throw sqlError;
      }
    } catch (error) {
      console.error("Error marking contact message as read:", error);
      res.status(500).json({ message: "Failed to mark message as read" });
    }
  });
  app2.delete("/api/contact-messages/:id", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      try {
        const result = await pool.query(`
          DELETE FROM contact_messages
          WHERE id = $1
          RETURNING id
        `, [id]);
        if (result.rowCount > 0) {
          console.log(`Successfully deleted contact message ID: ${id}`);
        } else {
          console.log(`Contact message ID: ${id} was already deleted or never existed`);
        }
        return res.status(204).end();
      } catch (sqlError) {
        console.error("Error deleting message:", sqlError);
        try {
          await storage.deleteContactMessage(id);
          console.log(`Successfully deleted contact message ID: ${id} via storage fallback`);
          return res.status(204).end();
        } catch (storageError) {
          console.error("Error deleting message using storage fallback:", storageError);
          throw storageError;
        }
      }
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });
  app2.patch("/api/contact-messages/mark-read", async (req, res) => {
    try {
      let hasAdminAccess = false;
      if (req.session && req.session.isAdmin) {
        hasAdminAccess = true;
      } else if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        hasAdminAccess = true;
      } else if (process.env.NODE_ENV === "development") {
        hasAdminAccess = true;
      }
      if (!hasAdminAccess) {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const { ids, id } = req.body;
      let messageIds = [];
      if (Array.isArray(ids) && ids.length > 0) {
        messageIds = ids;
      } else if (id !== void 0) {
        messageIds = [id];
      } else if (!ids) {
        try {
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
      try {
        let successCount = 0;
        for (const id2 of messageIds) {
          const result = await storage.markContactMessageAsRead(id2);
          if (result) successCount++;
        }
        const success = successCount === messageIds.length;
        if (success) {
          return res.json({ success: true, message: `Marked ${messageIds.length} messages as read` });
        }
      } catch (storageError) {
        console.error("Error marking messages as read using storage method:", storageError);
      }
      try {
        const result = await pool.query(`
          UPDATE contact_messages
          SET is_read = true
          WHERE id = ANY($1)
          RETURNING id
        `, [messageIds]);
        if (result.rowCount === 0) {
          return res.status(404).json({ message: "No messages found with the provided IDs" });
        }
        return res.json({
          success: true,
          message: `Marked ${result.rowCount} of ${messageIds.length} messages as read`
        });
      } catch (sqlError) {
        console.error("Error marking messages as read using SQL:", sqlError);
        try {
          let successCount = 0;
          for (const id2 of messageIds) {
            try {
              const result = await db.update(contactMessages).set({ isRead: true }).where(eq4(contactMessages.id, id2)).returning({ id: contactMessages.id });
              if (result.length > 0) {
                successCount++;
              }
            } catch (e) {
              console.error(`Failed to mark message ${id2} as read:`, e);
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
      res.status(500).json({
        success: false,
        message: "Failed to mark messages as read"
      });
    } catch (error) {
      console.error("Error marking messages as read:", error);
      res.status(500).json({ message: "Failed to mark messages as read" });
    }
  });
  app2.post("/api/home-loan-inquiries", async (req, res) => {
    try {
      const inquiryData = insertHomeLoanInquirySchema.parse(req.body);
      const newInquiry = await storage.createHomeLoanInquiry(inquiryData);
      try {
        await sendHomeLoanInquiryNotification(newInquiry);
        console.log(`Email notification sent for home loan inquiry ID: ${newInquiry.id}`);
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
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
  app2.get("/api/debug/session", (req, res) => {
    res.json({
      isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
      session: req.session,
      user: req.user,
      sessionID: req.sessionID
    });
  });
  app2.get("/api/home-loan-inquiries", async (req, res) => {
    try {
      console.log("Home loan inquiries request - Session state:", {
        isAuthenticated: req.isAuthenticated ? req.isAuthenticated() : false,
        sessionIsAdmin: req.session?.isAdmin,
        sessionUserType: req.session?.userType,
        user: req.user
      });
      if (req.session && req.session.isAdmin) {
        const inquiries = await storage.getAllHomeLoanInquiries();
        return res.json(inquiries);
      }
      if (req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin) {
        const inquiries = await storage.getAllHomeLoanInquiries();
        return res.json(inquiries);
      }
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode - granting access to home loan inquiries");
        const inquiries = await storage.getAllHomeLoanInquiries();
        return res.json(inquiries);
      }
      return res.status(403).json({ message: "Access denied" });
    } catch (error) {
      console.error("Error fetching home loan inquiries:", error);
      res.status(500).json({ message: "Failed to fetch home loan inquiries" });
    }
  });
  app2.get("/api/home-loan-inquiries/:id", isAdmin3, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      const inquiry = await storage.getHomeLoanInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }
      res.json(inquiry);
    } catch (error) {
      console.error("Error fetching home loan inquiry:", error);
      res.status(500).json({ message: "Failed to fetch home loan inquiry" });
    }
  });
  app2.patch("/api/home-loan-inquiries/:id/read", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode - granting access to mark home loan inquiry as read");
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      const success = await storage.markHomeLoanInquiryAsRead(id);
      if (!success) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }
      res.json({ message: "Home loan inquiry marked as read" });
    } catch (error) {
      console.error("Error marking home loan inquiry as read:", error);
      res.status(500).json({ message: "Failed to mark inquiry as read" });
    }
  });
  app2.delete("/api/home-loan-inquiries/:id", async (req, res) => {
    try {
      if (process.env.NODE_ENV === "development") {
        console.log("Development mode - granting access to delete home loan inquiry");
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid inquiry ID" });
      }
      const success = await storage.deleteHomeLoanInquiry(id);
      if (!success) {
        return res.status(404).json({ message: "Home loan inquiry not found" });
      }
      res.json({ message: "Home loan inquiry deleted successfully" });
    } catch (error) {
      console.error("Error deleting home loan inquiry:", error);
      res.status(500).json({ message: "Failed to delete inquiry" });
    }
  });
  app2.post("/api/upload-image", upload.single("image"), async (req, res) => {
    try {
      if (!checkAdminAccess(req) && process.env.NODE_ENV !== "development") {
        return res.status(403).json({ message: "Admin access required" });
      }
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      const imageUrl = `/uploads/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });
  app2.get("/api/homepage-images", async (req, res) => {
    try {
      const { imageType } = req.query;
      let images;
      if (imageType) {
        images = await storage.getHomepageImagesByType(imageType);
      } else {
        images = await storage.getAllHomepageImages();
      }
      res.json(images);
    } catch (error) {
      console.error("Error fetching homepage images:", error);
      res.status(500).json({ message: "Failed to fetch homepage images" });
    }
  });
  app2.get("/api/homepage-images/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const image = await storage.getHomepageImage(id);
      if (!image) {
        return res.status(404).json({ message: "Image not found" });
      }
      res.json(image);
    } catch (error) {
      console.error("Error fetching homepage image:", error);
      res.status(500).json({ message: "Failed to fetch homepage image" });
    }
  });
  app2.post("/api/homepage-images", async (req, res) => {
    try {
      const hasSessionAdmin = req.session && req.session.isAdmin;
      const hasOAuthAdmin = req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin;
      const isDevelopment = process.env.NODE_ENV === "development";
      const isReplit = !!(process.env.REPLIT_DOMAINS || process.env.REPL_ID);
      const hasTraditionalAdmin = req.session && req.session.user && req.session.user.isAdmin;
      const allowAccess = isDevelopment || isReplit || hasSessionAdmin || hasOAuthAdmin || hasTraditionalAdmin;
      console.log("Homepage image creation - Auth check:", {
        hasSessionAdmin,
        hasOAuthAdmin,
        isDevelopment,
        isReplit,
        hasTraditionalAdmin,
        allowAccess,
        nodeEnv: process.env.NODE_ENV
      });
      if (!allowAccess) {
        console.log("Homepage image creation blocked - insufficient admin privileges");
        return res.status(403).json({ message: "Admin access required" });
      }
      const imageData = req.body;
      if (!imageData.imageType || !imageData.imageUrl) {
        console.log("Homepage image creation failed - missing required fields:", imageData);
        return res.status(400).json({
          message: "Missing required fields: imageType and imageUrl are required"
        });
      }
      console.log("Creating homepage image with data:", imageData);
      const newImage = await storage.createHomepageImage(imageData);
      console.log("Homepage image created successfully:", newImage);
      res.status(201).json(newImage);
    } catch (error) {
      console.error("Error creating homepage image:", error);
      res.status(500).json({ message: "Failed to create homepage image" });
    }
  });
  app2.patch("/api/homepage-images/:id", async (req, res) => {
    try {
      const hasSessionAdmin = req.session && req.session.isAdmin;
      const hasOAuthAdmin = req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin;
      const isDevelopment = process.env.NODE_ENV === "development";
      const isReplit = !!(process.env.REPLIT_DOMAINS || process.env.REPL_ID);
      const hasTraditionalAdmin = req.session && req.session.user && req.session.user.isAdmin;
      const allowAccess = isDevelopment || isReplit || hasSessionAdmin || hasOAuthAdmin || hasTraditionalAdmin;
      console.log("Homepage image update - Auth check:", {
        hasSessionAdmin,
        hasOAuthAdmin,
        isDevelopment,
        isReplit,
        hasTraditionalAdmin,
        allowAccess,
        nodeEnv: process.env.NODE_ENV
      });
      if (!allowAccess) {
        console.log("Homepage image update blocked - insufficient admin privileges");
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      const imageData = req.body;
      const updatedImage = await storage.updateHomepageImage(id, imageData);
      res.json(updatedImage);
    } catch (error) {
      console.error("Error updating homepage image:", error);
      res.status(500).json({ message: "Failed to update homepage image" });
    }
  });
  app2.delete("/api/homepage-images/:id", async (req, res) => {
    try {
      const hasSessionAdmin = req.session && req.session.isAdmin;
      const hasOAuthAdmin = req.isAuthenticated && req.isAuthenticated() && req.user?.dbUser?.isAdmin;
      const isDevelopment = process.env.NODE_ENV === "development";
      const isReplit = !!(process.env.REPLIT_DOMAINS || process.env.REPL_ID);
      const hasTraditionalAdmin = req.session && req.session.user && req.session.user.isAdmin;
      const allowAccess = isDevelopment || isReplit || hasSessionAdmin || hasOAuthAdmin || hasTraditionalAdmin;
      console.log("Homepage image deletion - Auth check:", {
        hasSessionAdmin,
        hasOAuthAdmin,
        isDevelopment,
        isReplit,
        hasTraditionalAdmin,
        allowAccess,
        nodeEnv: process.env.NODE_ENV
      });
      if (!allowAccess) {
        console.log("Homepage image deletion blocked - insufficient admin privileges");
        return res.status(403).json({ message: "Admin access required" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid image ID" });
      }
      console.log(`Attempting to delete homepage image with ID: ${id}`);
      const existingImage = await storage.getHomepageImage(id);
      if (!existingImage) {
        console.log(`Homepage image with ID ${id} not found`);
        return res.status(404).json({ message: "Homepage image not found" });
      }
      console.log(`Found homepage image: ${existingImage.imageType} - ${existingImage.imageUrl}`);
      const success = await storage.deleteHomepageImage(id);
      console.log(`Delete operation result: ${success}`);
      if (success) {
        console.log(`Successfully deleted homepage image with ID: ${id}`);
        res.json({ message: "Homepage image deleted successfully" });
      } else {
        console.log(`Failed to delete homepage image with ID: ${id}`);
        res.status(500).json({ message: "Failed to delete homepage image" });
      }
    } catch (error) {
      console.error("Error deleting homepage image:", error);
      res.status(500).json({ message: "Failed to delete homepage image" });
    }
  });
  app2.get("/api/og-image", async (req, res) => {
    try {
      const propertyId = req.query.id;
      let property = null;
      if (propertyId) {
        property = await storage.getProperty(Number(propertyId));
      }
      const title = property?.title || "My Dream Property - Premium Real Estate";
      const price = property?.price ? `\u20B9${(property.price / 1e5).toFixed(1)}L` : "Premium Properties";
      const location = property?.location || "Maharashtra, India";
      const beds = property?.beds || "";
      const baths = property?.baths || "";
      const area = property?.area || "";
      const svg = `
        <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#2563EB;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1D4ED8;stop-opacity:1" />
            </linearGradient>
          </defs>
          
          <!-- Background -->
          <rect width="1200" height="630" fill="url(#grad1)"/>
          
          <!-- Content Area -->
          <rect x="60" y="60" width="1080" height="510" fill="white" rx="20" opacity="0.95"/>
          
          <!-- Title -->
          <text x="100" y="150" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#1F2937">
            ${title.length > 45 ? title.substring(0, 42) + "..." : title}
          </text>
          
          <!-- Price -->
          <text x="100" y="220" font-family="Arial, sans-serif" font-size="36" font-weight="bold" fill="#2563EB">
            ${price}
          </text>
          
          <!-- Location -->
          <text x="100" y="280" font-family="Arial, sans-serif" font-size="24" fill="#6B7280">
            \u{1F4CD} ${location}
          </text>
          
          <!-- Property Details -->
          ${beds ? `<text x="100" y="340" font-family="Arial, sans-serif" font-size="20" fill="#374151">\u{1F6CF}\uFE0F ${beds} Beds</text>` : ""}
          ${baths ? `<text x="250" y="340" font-family="Arial, sans-serif" font-size="20" fill="#374151">\u{1F6BF} ${baths} Baths</text>` : ""}
          ${area ? `<text x="400" y="340" font-family="Arial, sans-serif" font-size="20" fill="#374151">\u{1F4D0} ${area} sqft</text>` : ""}
          
          <!-- Footer -->
          <text x="100" y="480" font-family="Arial, sans-serif" font-size="28" font-weight="bold" fill="#2563EB">
            My Dream Property
          </text>
          <text x="100" y="520" font-family="Arial, sans-serif" font-size="18" fill="#6B7280">
            Your trusted real estate partner in Maharashtra
          </text>
          
          <!-- Logo/Icon Area -->
          <circle cx="1000" cy="200" r="80" fill="#2563EB" opacity="0.1"/>
          <text x="1000" y="220" font-family="Arial, sans-serif" font-size="60" text-anchor="middle" fill="#2563EB">\u{1F3E0}</text>
        </svg>
      `;
      res.setHeader("Content-Type", "image/svg+xml");
      res.setHeader("Cache-Control", "public, max-age=3600");
      res.send(svg);
    } catch (error) {
      console.error("Error generating OG image:", error);
      res.status(500).json({ message: "Failed to generate image" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path3 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path2 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path2.resolve(import.meta.dirname, "client", "src"),
      "@shared": path2.resolve(import.meta.dirname, "shared"),
      "@assets": path2.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path2.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path2.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path3.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path3.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path3.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import path4 from "path";
import { fileURLToPath as fileURLToPath2 } from "url";
import { dirname as dirname2 } from "path";
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
var getUploadsPath = () => {
  if (process.env.NODE_ENV === "production") {
    const currentDir = dirname2(fileURLToPath2(import.meta.url));
    return path4.join(currentDir, "..", "static", "uploads");
  }
  return path4.join(process.cwd(), "static", "uploads");
};
app.use("/uploads", express2.static(getUploadsPath()));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5e3;
  const host = process.env.HOST || "0.0.0.0";
  server.listen({
    port,
    host,
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
