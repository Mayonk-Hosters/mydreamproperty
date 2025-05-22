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
  agents: () => agents,
  agentsRelations: () => agentsRelations,
  contactInfo: () => contactInfo,
  contactMessages: () => contactMessages,
  districts: () => districts,
  districtsRelations: () => districtsRelations,
  inquiries: () => inquiries,
  inquiriesRelations: () => inquiriesRelations,
  insertAgentSchema: () => insertAgentSchema,
  insertContactInfoSchema: () => insertContactInfoSchema,
  insertContactMessageSchema: () => insertContactMessageSchema,
  insertDistrictSchema: () => insertDistrictSchema,
  insertInquirySchema: () => insertInquirySchema,
  insertNeighborhoodMetricsSchema: () => insertNeighborhoodMetricsSchema,
  insertNeighborhoodSchema: () => insertNeighborhoodSchema,
  insertPropertySchema: () => insertPropertySchema,
  insertPropertyTypeSchema: () => insertPropertyTypeSchema,
  insertStateSchema: () => insertStateSchema,
  insertTalukaSchema: () => insertTalukaSchema,
  insertTehsilSchema: () => insertTehsilSchema,
  insertUserSchema: () => insertUserSchema,
  neighborhoodMetrics: () => neighborhoodMetrics,
  neighborhoodMetricsRelations: () => neighborhoodMetricsRelations,
  neighborhoods: () => neighborhoods,
  neighborhoodsRelations: () => neighborhoodsRelations,
  properties: () => properties,
  propertiesRelations: () => propertiesRelations,
  propertyTypes: () => propertyTypes,
  sessions: () => sessions,
  states: () => states,
  statesRelations: () => statesRelations,
  talukas: () => talukas,
  talukasRelations: () => talukasRelations,
  tehsils: () => tehsils,
  tehsilsRelations: () => tehsilsRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, real, jsonb, timestamp, decimal, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
var sessions, users, usersRelations, insertUserSchema, agents, agentsRelations, insertAgentSchema, properties, propertiesRelations, insertPropertySchema, inquiries, inquiriesRelations, insertInquirySchema, states, districts, talukas, tehsils, statesRelations, districtsRelations, talukasRelations, tehsilsRelations, insertStateSchema, insertDistrictSchema, insertTalukaSchema, insertTehsilSchema, contactInfo, insertContactInfoSchema, propertyTypes, insertPropertyTypeSchema, contactMessages, insertContactMessageSchema, neighborhoods, neighborhoodMetrics, neighborhoodsRelations, neighborhoodMetricsRelations, insertNeighborhoodSchema, insertNeighborhoodMetricsSchema, DEFAULT_PROPERTY_TYPES, PROPERTY_STATUS;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
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
    usersRelations = relations(users, ({ many }) => ({
      inquiries: many(inquiries)
    }));
    insertUserSchema = createInsertSchema(users);
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
    agentsRelations = relations(agents, ({ many }) => ({
      properties: many(properties)
    }));
    insertAgentSchema = createInsertSchema(agents).omit({
      id: true,
      createdAt: true
    });
    properties = pgTable("properties", {
      id: serial("id").primaryKey(),
      propertyNumber: text("property_number").unique(),
      // Unique property number (MDP-XXX)
      title: text("title").notNull(),
      description: text("description").notNull(),
      price: real("price").notNull(),
      location: text("location").notNull(),
      address: text("address").notNull(),
      beds: integer("beds").notNull(),
      baths: real("baths").notNull(),
      area: integer("area").notNull(),
      yearBuilt: integer("year_built"),
      // Year the property was built
      parking: integer("parking"),
      // Number of parking spaces
      propertyType: text("property_type").notNull(),
      type: text("type").notNull().default("buy"),
      // Property transaction type: buy, rent, sell
      status: text("status").default("active"),
      featured: boolean("featured").default(false),
      features: jsonb("features").default([]),
      // Property features/amenities
      images: jsonb("images").notNull().default([]),
      mapUrl: text("map_url"),
      // Google Maps URL for property location
      maharera_registered: boolean("maharera_registered").default(false),
      // Whether the property is MahaRERA registered
      agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
      neighborhoodId: integer("neighborhood_id").references(() => neighborhoods.id),
      // Location hierarchy fields
      stateId: integer("state_id").references(() => states.id),
      districtId: integer("district_id").references(() => districts.id),
      talukaId: integer("taluka_id").references(() => talukas.id),
      tehsilId: integer("tehsil_id").references(() => tehsils.id),
      createdAt: timestamp("created_at").defaultNow()
    });
    propertiesRelations = relations(properties, ({ one, many }) => ({
      agent: one(agents, {
        fields: [properties.agentId],
        references: [agents.id]
      }),
      neighborhood: one(neighborhoods, {
        fields: [properties.neighborhoodId],
        references: [neighborhoods.id]
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
      inquiries: many(inquiries)
    }));
    insertPropertySchema = createInsertSchema(properties).omit({
      id: true,
      createdAt: true
    }).partial({
      propertyNumber: true,
      neighborhoodId: true,
      stateId: true,
      districtId: true,
      talukaId: true,
      tehsilId: true
    });
    inquiries = pgTable("inquiries", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull(),
      phone: text("phone"),
      message: text("message").notNull(),
      propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: "cascade" }),
      userId: text("user_id").references(() => users.id),
      isRead: boolean("is_read").default(false),
      createdAt: timestamp("created_at").defaultNow()
    });
    inquiriesRelations = relations(inquiries, ({ one }) => ({
      property: one(properties, {
        fields: [inquiries.propertyId],
        references: [properties.id]
      }),
      user: one(users, {
        fields: [inquiries.userId],
        references: [users.id]
      })
    }));
    insertInquirySchema = createInsertSchema(inquiries).omit({
      id: true,
      createdAt: true,
      userId: true
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
      // Area as a location text
      createdAt: timestamp("created_at").defaultNow()
    });
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
    insertContactInfoSchema = createInsertSchema(contactInfo).omit({
      id: true,
      updatedAt: true
    });
    propertyTypes = pgTable("property_types", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      active: boolean("active").default(true),
      createdAt: timestamp("created_at").defaultNow()
    });
    insertPropertyTypeSchema = createInsertSchema(propertyTypes).omit({
      id: true,
      createdAt: true
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
    insertContactMessageSchema = createInsertSchema(contactMessages).omit({
      id: true,
      isRead: true,
      createdAt: true
    });
    neighborhoods = pgTable("neighborhoods", {
      id: serial("id").primaryKey(),
      name: text("name").notNull().unique(),
      city: text("city").notNull(),
      description: text("description").notNull(),
      locationData: jsonb("location_data").notNull().default({}),
      createdAt: timestamp("created_at").defaultNow()
    });
    neighborhoodMetrics = pgTable("neighborhood_metrics", {
      id: serial("id").primaryKey(),
      neighborhoodId: integer("neighborhood_id").notNull().references(() => neighborhoods.id, { onDelete: "cascade" }),
      // Metrics for comparing neighborhoods
      avgPropertyPrice: decimal("avg_property_price", { precision: 12, scale: 2 }),
      safetyScore: integer("safety_score"),
      walkabilityScore: integer("walkability_score"),
      schoolsScore: integer("schools_score"),
      publicTransportScore: integer("public_transport_score"),
      diningScore: integer("dining_score"),
      entertainmentScore: integer("entertainment_score"),
      parkingScore: integer("parking_score"),
      noiseLevel: integer("noise_level"),
      // Amenities counts
      schoolsCount: integer("schools_count").default(0),
      parksCount: integer("parks_count").default(0),
      restaurantsCount: integer("restaurants_count").default(0),
      hospitalsCount: integer("hospitals_count").default(0),
      shoppingCount: integer("shopping_count").default(0),
      groceryStoresCount: integer("grocery_stores_count").default(0),
      gymsCount: integer("gyms_count").default(0),
      updatedAt: timestamp("updated_at").defaultNow()
    });
    neighborhoodsRelations = relations(neighborhoods, ({ one, many }) => ({
      metrics: one(neighborhoodMetrics, {
        fields: [neighborhoods.id],
        references: [neighborhoodMetrics.neighborhoodId]
      }),
      properties: many(properties)
    }));
    neighborhoodMetricsRelations = relations(neighborhoodMetrics, ({ one }) => ({
      neighborhood: one(neighborhoods, {
        fields: [neighborhoodMetrics.neighborhoodId],
        references: [neighborhoods.id]
      })
    }));
    insertNeighborhoodSchema = createInsertSchema(neighborhoods).omit({
      id: true,
      createdAt: true
    });
    insertNeighborhoodMetricsSchema = createInsertSchema(neighborhoodMetrics).omit({
      id: true,
      updatedAt: true
    });
    DEFAULT_PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"];
    PROPERTY_STATUS = ["active", "pending", "sold"];
  }
});

// client/src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function getPropertyImage(index2) {
  const propertyImages = [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1523217582562-09d0def993a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
  ];
  return propertyImages[index2 % propertyImages.length];
}
function getAgentImage(index2) {
  const agentImages = [
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400",
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400"
  ];
  return agentImages[index2 % agentImages.length];
}
function getInteriorImage(index2) {
  const interiorImages = [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
  ];
  return interiorImages[index2 % interiorImages.length];
}
var init_utils = __esm({
  "client/src/lib/utils.ts"() {
    "use strict";
  }
});

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    neonConfig.webSocketConstructor = ws;
    if (!process.env.DATABASE_URL) {
      throw new Error(
        "DATABASE_URL must be set. Did you forget to provision a database?"
      );
    }
    pool = new Pool({ connectionString: process.env.DATABASE_URL });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/storage.ts
import session from "express-session";
import connectPg from "connect-pg-simple";
import { eq as eq2, like, gte, lte, and, desc, asc, sql, or } from "drizzle-orm";
var MemStorage, storage;
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_schema();
    init_utils();
    init_db();
    MemStorage = class {
      users;
      properties;
      agents;
      inquiries;
      states;
      districts;
      talukas;
      tehsils;
      contactInfo;
      propertyTypes;
      contactMessages;
      neighborhoods;
      neighborhoodMetrics;
      userIdCounter;
      propertyIdCounter;
      agentIdCounter;
      inquiryIdCounter;
      stateIdCounter;
      districtIdCounter;
      talukaIdCounter;
      tehsilIdCounter;
      propertyTypeIdCounter;
      contactMessageIdCounter;
      sessionStore;
      constructor() {
        this.users = /* @__PURE__ */ new Map();
        this.properties = /* @__PURE__ */ new Map();
        this.agents = /* @__PURE__ */ new Map();
        this.inquiries = /* @__PURE__ */ new Map();
        this.states = /* @__PURE__ */ new Map();
        this.districts = /* @__PURE__ */ new Map();
        this.talukas = /* @__PURE__ */ new Map();
        this.tehsils = /* @__PURE__ */ new Map();
        this.propertyTypes = /* @__PURE__ */ new Map();
        this.contactMessages = /* @__PURE__ */ new Map();
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
        this.sessionStore = new session.MemoryStore({
          checkPeriod: 864e5
          // prune expired entries every 24h
        });
        this.initSampleData();
      }
      // Initialize sample data
      initSampleData() {
        this.createUser({
          username: "admin",
          password: "admin123",
          isAdmin: true
        });
        for (const typeName of DEFAULT_PROPERTY_TYPES) {
          this.createPropertyType({
            name: typeName,
            active: true
          });
        }
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
            rating: 4.5 + Math.random() * 0.5
          });
        }
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
        const prices = [285e4, 775e3, 925e3, 195e4, 35e5, 1375e3];
        const beds = [5, 2, 4, 3, 6, 3];
        const baths = [6, 2, 3, 3.5, 7, 2.5];
        const areas = [6500, 1200, 2800, 3200, 7500, 2400];
        for (let i = 0; i < 6; i++) {
          const propertyType = i % 2 === 0 ? "House" : i % 3 === 0 ? "Apartment" : i % 4 === 0 ? "Commercial" : "Villa";
          const status = i % 5 === 0 ? "sold" : i % 3 === 0 ? "pending" : "active";
          const date = /* @__PURE__ */ new Date();
          date.setDate(date.getDate() - i * 2);
          const types = ["buy", "rent", "sell"];
          let type = types[i % 3];
          if (propertyType === "Apartment") {
            type = "rent";
          } else if (prices[i] > 2e6) {
            type = Math.random() > 0.3 ? "buy" : "sell";
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
            propertyType,
            type,
            // Add property transaction type
            status,
            featured: i < 2,
            // First two properties are featured
            images: [
              getPropertyImage(i),
              getPropertyImage((i + 1) % 6),
              getInteriorImage(i % 4),
              getInteriorImage((i + 1) % 4)
            ],
            agentId: i % 4 + 1,
            createdAt: date.toISOString()
          });
        }
        const inquiryNames = ["Emily Robertson", "David Wilson", "Thomas Anderson"];
        const inquiryEmails = ["emily.r@example.com", "david.w@example.com", "thomas.a@example.com"];
        const inquiryMessages = [
          "I'd like to schedule a viewing this weekend if possible. Is the property still available?",
          "What are the HOA fees for this property? Also, is parking included?",
          "I'm an investor looking for properties in this area. Is the seller open to negotiations?"
        ];
        for (let i = 0; i < 3; i++) {
          const date = /* @__PURE__ */ new Date();
          date.setHours(date.getHours() - i * 5);
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
      async getUser(id) {
        return this.users.get(id);
      }
      async getUserByUsername(username) {
        return Array.from(this.users.values()).find(
          (user) => user.username === username
        );
      }
      async getUserByEmail(email) {
        return Array.from(this.users.values()).find(
          (user) => user.email === email
        );
      }
      async getAgentByUsername(username) {
        const agent = Array.from(this.agents.values()).find(
          (agent2) => agent2.name === username
        );
        if (agent) {
          agent.role = "agent";
        }
        return agent;
      }
      async getClientByUsername(username) {
        const user = Array.from(this.users.values()).find(
          (user2) => user2.username === username && !user2.isAdmin
        );
        if (user) {
          user.role = "client";
        }
        return user;
      }
      async createUser(insertUser) {
        const id = this.userIdCounter++;
        const user = {
          ...insertUser,
          id,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        this.users.set(id, user);
        return user;
      }
      async getAllUsers() {
        return Array.from(this.users.values());
      }
      async updateUser(id, userData) {
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
      async deleteUser(id) {
        return this.users.delete(id);
      }
      // Property methods
      async getAllProperties(filters) {
        let properties2 = Array.from(this.properties.values());
        if (filters) {
          if (filters.type) {
            if (filters.type === "rent") {
              properties2 = properties2.filter((p) => p.type === "rent");
            } else if (filters.type === "buy") {
              properties2 = properties2.filter((p) => p.type === "buy");
            } else if (filters.type === "sell") {
              properties2 = properties2.filter((p) => p.type === "sell");
            }
          }
          if (filters.propertyType) {
            properties2 = properties2.filter((p) => p.propertyType === filters.propertyType);
          }
          if (filters.location) {
            const locationLower = filters.location.toLowerCase();
            properties2 = properties2.filter(
              (p) => p.location.toLowerCase().includes(locationLower) || p.address.toLowerCase().includes(locationLower)
            );
          }
          if (filters.minPrice !== void 0) {
            properties2 = properties2.filter((p) => p.price >= filters.minPrice);
          }
          if (filters.maxPrice !== void 0) {
            properties2 = properties2.filter((p) => p.price <= filters.maxPrice);
          }
          if (filters.minBeds !== void 0) {
            properties2 = properties2.filter((p) => p.beds >= filters.minBeds);
          }
          if (filters.minBaths !== void 0) {
            properties2 = properties2.filter((p) => p.baths >= filters.minBaths);
          }
          if (filters.featured !== void 0) {
            properties2 = properties2.filter((p) => p.featured === filters.featured);
          }
        }
        return properties2.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      async getProperty(id) {
        return this.properties.get(id);
      }
      async createProperty(insertProperty) {
        const id = this.propertyIdCounter++;
        const property = { ...insertProperty, id };
        this.properties.set(id, property);
        return property;
      }
      async updateProperty(id, updateProperty) {
        const existingProperty = this.properties.get(id);
        if (!existingProperty) {
          return void 0;
        }
        const updatedProperty = { ...updateProperty, id };
        this.properties.set(id, updatedProperty);
        return updatedProperty;
      }
      async deleteProperty(id) {
        return this.properties.delete(id);
      }
      async countPropertiesByType(propertyType) {
        return Array.from(this.properties.values()).filter(
          (p) => p.propertyType === propertyType
        ).length;
      }
      // Agent methods
      async getAllAgents() {
        return Array.from(this.agents.values());
      }
      async getAgent(id) {
        return this.agents.get(id);
      }
      async createAgent(insertAgent) {
        const id = this.agentIdCounter++;
        const agent = { ...insertAgent, id };
        this.agents.set(id, agent);
        return agent;
      }
      async updateAgent(id, updateAgent) {
        const existingAgent = await this.getAgent(id);
        if (!existingAgent) {
          throw new Error(`Agent with ID ${id} not found`);
        }
        const updatedAgent = { ...updateAgent, id };
        this.agents.set(id, updatedAgent);
        return updatedAgent;
      }
      async deleteAgent(id) {
        const exists = this.agents.has(id);
        if (!exists) {
          return false;
        }
        this.agents.delete(id);
        return true;
      }
      // Inquiry methods
      async getAllInquiries() {
        return Array.from(this.inquiries.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      async getInquiry(id) {
        return this.inquiries.get(id);
      }
      async createInquiry(insertInquiry) {
        const id = this.inquiryIdCounter++;
        const inquiry = { ...insertInquiry, id, isRead: false };
        this.inquiries.set(id, inquiry);
        return inquiry;
      }
      async markInquiryAsRead(id) {
        const inquiry = this.inquiries.get(id);
        if (!inquiry) {
          return false;
        }
        inquiry.isRead = true;
        this.inquiries.set(id, inquiry);
        return true;
      }
      async deleteInquiry(id) {
        return this.inquiries.delete(id);
      }
      // India Location methods
      // States
      async getAllStates() {
        return Array.from(this.states.values());
      }
      async getState(id) {
        return this.states.get(id);
      }
      async createState(state) {
        const id = this.stateIdCounter++;
        const newState = { ...state, id };
        this.states.set(id, newState);
        return newState;
      }
      async updateState(id, stateData) {
        const existingState = this.states.get(id);
        if (!existingState) {
          throw new Error("State not found");
        }
        const updatedState = { ...existingState, ...stateData };
        this.states.set(id, updatedState);
        return updatedState;
      }
      async deleteState(id) {
        return this.states.delete(id);
      }
      // Districts
      async getAllDistricts(stateId) {
        if (stateId !== void 0) {
          return Array.from(this.districts.values()).filter(
            (district) => district.stateId === stateId
          );
        }
        return Array.from(this.districts.values());
      }
      async getDistrict(id) {
        return this.districts.get(id);
      }
      async createDistrict(district) {
        const id = this.districtIdCounter++;
        const newDistrict = { ...district, id };
        this.districts.set(id, newDistrict);
        return newDistrict;
      }
      async updateDistrict(id, districtData) {
        const existingDistrict = this.districts.get(id);
        if (!existingDistrict) {
          throw new Error("District not found");
        }
        const updatedDistrict = { ...existingDistrict, ...districtData };
        this.districts.set(id, updatedDistrict);
        return updatedDistrict;
      }
      async deleteDistrict(id) {
        return this.districts.delete(id);
      }
      // Talukas
      async getAllTalukas(districtId) {
        if (districtId !== void 0) {
          return Array.from(this.talukas.values()).filter(
            (taluka) => taluka.districtId === districtId
          );
        }
        return Array.from(this.talukas.values());
      }
      async getTaluka(id) {
        return this.talukas.get(id);
      }
      async createTaluka(taluka) {
        const id = this.talukaIdCounter++;
        const newTaluka = { ...taluka, id };
        this.talukas.set(id, newTaluka);
        return newTaluka;
      }
      async updateTaluka(id, talukaData) {
        const existingTaluka = this.talukas.get(id);
        if (!existingTaluka) {
          throw new Error("Taluka not found");
        }
        const updatedTaluka = { ...existingTaluka, ...talukaData };
        this.talukas.set(id, updatedTaluka);
        return updatedTaluka;
      }
      async deleteTaluka(id) {
        return this.talukas.delete(id);
      }
      // Tehsils
      async getAllTehsils(talukaId) {
        if (talukaId !== void 0) {
          return Array.from(this.tehsils.values()).filter(
            (tehsil) => tehsil.talukaId === talukaId
          );
        }
        return Array.from(this.tehsils.values());
      }
      async getTehsil(id) {
        return this.tehsils.get(id);
      }
      async createTehsil(tehsil) {
        const id = this.tehsilIdCounter++;
        const newTehsil = { ...tehsil, id };
        this.tehsils.set(id, newTehsil);
        return newTehsil;
      }
      async updateTehsil(id, tehsilData) {
        const existingTehsil = this.tehsils.get(id);
        if (!existingTehsil) {
          throw new Error("Tehsil not found");
        }
        const updatedTehsil = { ...existingTehsil, ...tehsilData };
        this.tehsils.set(id, updatedTehsil);
        return updatedTehsil;
      }
      async deleteTehsil(id) {
        return this.tehsils.delete(id);
      }
      // Contact Information methods
      async getContactInfo() {
        return this.contactInfo;
      }
      async updateContactInfo(contactData) {
        const now = /* @__PURE__ */ new Date();
        const updatedContactInfo = {
          id: 1,
          // Always use a single record with ID 1
          ...contactData,
          updatedAt: now
        };
        this.contactInfo = updatedContactInfo;
        return updatedContactInfo;
      }
      // Contact Messages methods
      async getAllContactMessages() {
        return Array.from(this.contactMessages.values());
      }
      async getContactMessage(id) {
        return this.contactMessages.get(id);
      }
      async createContactMessage(message) {
        const id = this.contactMessageIdCounter++;
        const now = /* @__PURE__ */ new Date();
        const newMessage = {
          ...message,
          id,
          isRead: false,
          createdAt: now
        };
        this.contactMessages.set(id, newMessage);
        return newMessage;
      }
      async markContactMessageAsRead(id) {
        const message = this.contactMessages.get(id);
        if (!message) return false;
        message.isRead = true;
        this.contactMessages.set(id, message);
        return true;
      }
      async markContactMessagesAsRead(ids) {
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
      async deleteContactMessage(id) {
        return this.contactMessages.delete(id);
      }
      // Property Types methods
      async getAllPropertyTypes() {
        return Array.from(this.propertyTypes.values());
      }
      async getPropertyType(id) {
        return this.propertyTypes.get(id);
      }
      async createPropertyType(propertyType) {
        const id = this.propertyTypeIdCounter++;
        const now = /* @__PURE__ */ new Date();
        const newPropertyType = {
          ...propertyType,
          id,
          createdAt: now
        };
        this.propertyTypes.set(id, newPropertyType);
        return newPropertyType;
      }
      async updatePropertyType(id, propertyTypeData) {
        const existingPropertyType = this.propertyTypes.get(id);
        if (!existingPropertyType) {
          throw new Error("Property type not found");
        }
        const updatedPropertyType = { ...existingPropertyType, ...propertyTypeData };
        this.propertyTypes.set(id, updatedPropertyType);
        return updatedPropertyType;
      }
      async deletePropertyType(id) {
        return this.propertyTypes.delete(id);
      }
    };
    storage = new MemStorage();
  }
});

// server/auth.ts
var auth_exports = {};
__export(auth_exports, {
  hashPassword: () => hashPassword,
  setupAuth: () => setupAuth3
});
import passport3 from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session4 from "express-session";
import { scrypt as scrypt2, randomBytes as randomBytes2, timingSafeEqual as timingSafeEqual2 } from "crypto";
import { promisify as promisify2 } from "util";
async function hashPassword(password) {
  const salt = randomBytes2(16).toString("hex");
  const buf = await scryptAsync2(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords2(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync2(supplied, salt, 64);
  return timingSafeEqual2(hashedBuf, suppliedBuf);
}
function setupAuth3(app2) {
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
  app2.use(session4(sessionSettings));
  app2.use(passport3.initialize());
  app2.use(passport3.session());
  passport3.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !await comparePasswords2(password, user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (err) {
        return done(err);
      }
    })
  );
  passport3.serializeUser((user, done) => done(null, user.id));
  passport3.deserializeUser(async (id, done) => {
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
  app2.post("/api/login", passport3.authenticate("local"), (req, res) => {
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
var scryptAsync2;
var init_auth = __esm({
  "server/auth.ts"() {
    "use strict";
    init_storage();
    scryptAsync2 = promisify2(scrypt2);
  }
});

// server/index.ts
import express2 from "express";

// server/routes.ts
init_storage();
init_db();
init_schema();
import { createServer } from "http";
import { z } from "zod";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session3 from "express-session";
import memoize from "memoizee";
import connectPg3 from "connect-pg-simple";

// server/auth-storage.ts
init_schema();
import session2 from "express-session";
import connectPg2 from "connect-pg-simple";
import { eq as eq3 } from "drizzle-orm";

// server/db/index.ts
init_schema();
import { Pool as Pool2, neonConfig as neonConfig2 } from "@neondatabase/serverless";
import { drizzle as drizzle2 } from "drizzle-orm/neon-serverless";
import ws2 from "ws";
neonConfig2.webSocketConstructor = ws2;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool2 = new Pool2({ connectionString: process.env.DATABASE_URL });
var db2 = drizzle2(pool2, { schema: schema_exports });

// server/auth-storage.ts
var AuthStorage = class {
  sessionStore;
  constructor() {
    const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
    const pgStore = connectPg2(session2);
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
  const pgStore = connectPg3(session3);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    tableName: "sessions",
    ttl: sessionTtl
  });
  return session3({
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
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
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
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
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

// server/localAuth.ts
async function setupAuth2(app2) {
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
var isAuthenticated2 = (req, res, next) => {
  if (req.session && req.session.isAuthenticated) {
    req.user = {
      claims: {
        sub: "local-admin"
      },
      dbUser: req.session.user
    };
    return next();
  }
  return res.status(401).json({ message: "Unauthorized" });
};

// server/admin-login.ts
init_storage();
import passport2 from "passport";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function comparePasswords(supplied, stored) {
  try {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = await scryptAsync(supplied, salt, 64);
    return timingSafeEqual(hashedBuf, suppliedBuf);
  } catch (error) {
    console.error("Error comparing passwords:", error);
    return false;
  }
}
function setupAdminLogin(app2) {
  passport2.serializeUser((user, done) => {
    done(null, user);
  });
  passport2.deserializeUser((user, done) => {
    done(null, user);
  });
  app2.post("/api/traditional-login", async (req, res) => {
    try {
      const { username, password, userType } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (process.env.NODE_ENV === "development") {
        if (userType === "admin" && username === "Smileplz004" && password === "9923000500@rahul") {
          const adminUser = {
            id: "admin-dev",
            username: "Smileplz004",
            fullName: "Admin User",
            email: "admin@example.com",
            isAdmin: true,
            role: "admin",
            profileImage: null
          };
          req.login(adminUser, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Login failed" });
            }
            req.session.isAdmin = true;
            req.session.userType = "admin";
            req.session.save((err2) => {
              if (err2) console.error("Session save error:", err2);
              res.status(200).json(adminUser);
            });
          });
          return;
        }
        if (userType === "agent" && username === "agent") {
          const agentUser = {
            id: "agent-dev",
            username: "agent",
            fullName: "Agent User",
            email: "agent@example.com",
            isAdmin: false,
            role: "agent",
            profileImage: null
          };
          req.login(agentUser, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Login failed" });
            }
            req.session.isAdmin = false;
            req.session.userType = "agent";
            req.session.save((err2) => {
              if (err2) console.error("Session save error:", err2);
              res.status(200).json(agentUser);
            });
          });
          return;
        }
        if (userType === "client" && username === "client") {
          const clientUser = {
            id: "client-dev",
            username: "client",
            fullName: "Client User",
            email: "client@example.com",
            isAdmin: false,
            role: "client",
            profileImage: null
          };
          req.login(clientUser, (err) => {
            if (err) {
              console.error("Login error:", err);
              return res.status(500).json({ message: "Login failed" });
            }
            req.session.isAdmin = false;
            req.session.userType = "client";
            req.session.save((err2) => {
              if (err2) console.error("Session save error:", err2);
              res.status(200).json(clientUser);
            });
          });
          return;
        }
      }
      let user;
      if (userType === "admin") {
        user = await storage.getUserByUsername(username);
      } else if (userType === "agent") {
        user = await storage.getAgentByUsername(username);
        if (user) {
          user.role = "agent";
        }
      } else if (userType === "client") {
        user = await storage.getClientByUsername(username);
        if (user) {
          user.role = "client";
        }
      } else {
        user = await storage.getUserByUsername(username);
      }
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      let passwordsMatch = false;
      if (process.env.NODE_ENV === "development") {
        passwordsMatch = true;
      } else {
        passwordsMatch = await comparePasswords(password, user.password || "");
      }
      if (!passwordsMatch) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: "Login failed" });
        req.session.isAdmin = !!user.isAdmin;
        req.session.userType = user.role || (user.isAdmin ? "admin" : "client");
        req.session.save((err2) => {
          if (err2) {
            console.error("Session save error:", err2);
          }
          const { password: password2, ...userData } = user;
          res.status(200).json(userData);
        });
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/auth/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    res.json(req.user);
  });
  app2.get("/api/auth/check-admin", (req, res) => {
    if (process.env.NODE_ENV === "development" && req.isAuthenticated()) {
      if (req.user && req.user.username === "Smileplz004") {
        return res.json({ isAdmin: true });
      }
    }
    if (req.isAuthenticated() && req.user?.isAdmin) {
      return res.json({ isAdmin: true });
    }
    res.json({ isAdmin: false });
  });
}

// server/email-service.ts
import SibApiV3Sdk from "sib-api-v3-sdk";
if (!process.env.BREVO_API_KEY) {
  console.warn("Warning: BREVO_API_KEY is not set. Email notifications will not be sent.");
}
if (!process.env.ADMIN_EMAIL) {
  console.warn("Warning: ADMIN_EMAIL is not set. Email notifications will not be sent.");
}
var apiInstance = null;
try {
  const defaultClient = SibApiV3Sdk.ApiClient.instance;
  const apiKey = defaultClient.authentications["api-key"];
  apiKey.apiKey = process.env.BREVO_API_KEY || "";
  apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
} catch (error) {
  console.error("Failed to initialize Brevo API client:", error);
}
async function sendInquiryNotification(inquiry, propertyTitle) {
  try {
    if (!process.env.BREVO_API_KEY) {
      console.error("BREVO_API_KEY is not set. Cannot send email notification.");
      return false;
    }
    if (!process.env.ADMIN_EMAIL) {
      console.error("ADMIN_EMAIL is not set. Cannot send email notification.");
      return false;
    }
    if (!apiInstance) {
      console.error("Brevo API client is not initialized. Cannot send email notification.");
      return false;
    }
    const sendSmtpEmail = {
      to: [{ email: process.env.ADMIN_EMAIL }],
      sender: {
        name: "My Dream Property",
        email: "noreply@mydreamproperty.com"
      },
      replyTo: { email: inquiry.email, name: inquiry.name },
      subject: `New Property Inquiry${propertyTitle ? ` for "${propertyTitle}"` : ""}`,
      htmlContent: `
        <html>
          <body>
            <h1>New Property Inquiry</h1>
            ${propertyTitle ? `<p><strong>Property:</strong> ${propertyTitle}</p>` : ""}
            <p><strong>From:</strong> ${inquiry.name}</p>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            <p><strong>Phone:</strong> ${inquiry.phone || "Not provided"}</p>
            <p><strong>Message:</strong></p>
            <p>${inquiry.message.replace(/\n/g, "<br>")}</p>
            <p>You can respond directly to this email to contact the inquirer.</p>
            <hr>
            <p><small>This is an automated message from My Dream Property website.</small></p>
          </body>
        </html>
      `,
      textContent: `
        New Property Inquiry
        
        ${propertyTitle ? `Property: ${propertyTitle}
` : ""}
        From: ${inquiry.name}
        Email: ${inquiry.email}
        Phone: ${inquiry.phone || "Not provided"}
        
        Message:
        ${inquiry.message}
        
        You can respond directly to this email to contact the inquirer.
        
        This is an automated message from My Dream Property website.
      `
    };
    const result = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Email notification sent successfully:", result);
    return true;
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return false;
  }
}

// server/routes/neighborhoods.ts
init_db();
init_schema();
import { Router } from "express";
import { eq as eq4, isNotNull, count } from "drizzle-orm";
var router = Router();
router.get("/compare", (_req, res) => {
  res.status(403).json({
    message: "The Neighborhood Comparison feature has been disabled",
    disabled: true
  });
});
router.get("/compare", (req, res) => {
  res.status(403).json({
    message: "The Neighborhood Comparison feature has been disabled",
    disabled: true
  });
});
router.get("/", async (_req, res) => {
  try {
    const allNeighborhoods = await db.select({
      id: neighborhoods.id,
      name: neighborhoods.name,
      city: neighborhoods.city,
      description: neighborhoods.description,
      locationData: neighborhoods.locationData,
      createdAt: neighborhoods.createdAt
    }).from(neighborhoods);
    const propertyCounts = await db.select({
      neighborhoodId: properties.neighborhoodId,
      count: count(properties.id)
    }).from(properties).where(isNotNull(properties.neighborhoodId)).groupBy(properties.neighborhoodId);
    const neighborhoodsWithProperties = allNeighborhoods.map((neighborhood) => {
      const propertyData = propertyCounts.find((p) => p.neighborhoodId === neighborhood.id);
      return {
        ...neighborhood,
        propertyCount: propertyData ? propertyData.count : 0
      };
    }).filter((neighborhood) => neighborhood.propertyCount > 0);
    console.log(`Found ${neighborhoodsWithProperties.length} neighborhoods with properties`);
    res.json(neighborhoodsWithProperties);
  } catch (error) {
    console.error("Error fetching neighborhoods:", error);
    res.status(500).json({ message: "Failed to fetch neighborhoods" });
  }
});
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const neighborhood = await db.select().from(neighborhoods).where(eq4(neighborhoods.id, parseInt(id))).limit(1);
    if (neighborhood.length === 0) {
      return res.status(404).json({ message: "Neighborhood not found" });
    }
    res.json(neighborhood[0]);
  } catch (error) {
    console.error("Error fetching neighborhood:", error);
    res.status(500).json({ message: "Failed to fetch neighborhood" });
  }
});
router.get("/:id/metrics", async (req, res) => {
  try {
    const { id } = req.params;
    const metrics = await db.select().from(neighborhoodMetrics).where(eq4(neighborhoodMetrics.neighborhoodId, parseInt(id))).limit(1);
    if (metrics.length === 0) {
      return res.status(404).json({ message: "Neighborhood metrics not found" });
    }
    res.json(metrics[0]);
  } catch (error) {
    console.error("Error fetching neighborhood metrics:", error);
    res.status(500).json({ message: "Failed to fetch neighborhood metrics" });
  }
});
var neighborhoods_default = router;

// server/routes.ts
import cookieParser from "cookie-parser";
import session5 from "express-session";
import passport4 from "passport";

// server/routes/mdp-properties.ts
init_db();
init_schema();
import { Router as Router2 } from "express";
import { like as like2 } from "drizzle-orm";
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const mdpProperties = await db.select().from(properties).where(like2(properties.propertyNumber, "MDP%")).orderBy(properties.id);
    res.json(mdpProperties);
  } catch (error) {
    console.error("Error fetching MDP properties:", error);
    res.status(500).json({ message: "Failed to fetch MDP properties" });
  }
});
router2.get("/:type", async (req, res) => {
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
var mdp_properties_default = router2;

// server/routes.ts
var isLocalDev = process.env.LOCAL_DEV === "true";
var setupAuth4 = isLocalDev ? setupAuth2 : setupAuth;
var isAuthenticated3 = isLocalDev ? isAuthenticated2 : isAuthenticated;
async function registerRoutes(app2) {
  app2.use(cookieParser());
  app2.use(session5({
    secret: process.env.SESSION_SECRET || "local-dev-secret",
    resave: true,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1e3,
      // 1 day
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    }
  }));
  app2.use(passport4.initialize());
  app2.use(passport4.session());
  await setupAuth4(app2);
  setupAdminLogin(app2);
  app2.get("/api/auth/user", isAuthenticated3, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await authStorage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
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
  const contactFormSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
    subject: z.string().min(3, "Subject must be at least 3 characters")
  });
  app2.post("/api/contact", async (req, res) => {
    try {
      console.log("Received contact form data:", req.body);
      const validatedData = contactFormSchema.parse(req.body);
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
        featured
      } = req.query;
      const properties2 = await storage.getAllProperties({
        type,
        propertyType,
        location,
        minPrice: minPrice ? parseFloat(minPrice) : void 0,
        maxPrice: maxPrice ? parseFloat(maxPrice) : void 0,
        minBeds: minBeds ? parseInt(minBeds) : void 0,
        minBaths: minBaths ? parseFloat(minBaths) : void 0,
        featured: featured === "true"
      });
      res.json(properties2);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });
  app2.get("/api/properties/counts-by-type", async (_req, res) => {
    try {
      const counts = await Promise.all(
        DEFAULT_PROPERTY_TYPES.map(async (type) => {
          const count2 = await storage.countPropertiesByType(type);
          return { propertyType: type, count: count2 };
        })
      );
      return res.json(counts);
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
        agentId: Number(requestData.agentId) || 1
      };
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
          const nextNumber = Math.max(highestNumber, global.lastUsedPropertyNumber) + 1;
          global.lastUsedPropertyNumber = nextNumber;
          const paddedNumber = nextNumber.toString().padStart(4, "0");
          propertyData.propertyNumber = `MDP-${paddedNumber}`;
          console.log(`Generated property number: ${propertyData.propertyNumber} (highest was ${highestNumber}, last used: ${global.lastUsedPropertyNumber - 1})`);
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
      const propertyData = insertPropertySchema.parse(requestData);
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
  app2.get("/api/agents", async (_req, res) => {
    try {
      const agents2 = await storage.getAllAgents();
      res.json(agents2);
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
  app2.get("/api/inquiries", async (_req, res) => {
    try {
      const inquiries2 = await storage.getAllInquiries();
      res.json(inquiries2);
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
      const inquiry = await storage.getInquiry(id);
      if (!inquiry) {
        return res.status(404).json({ message: "Inquiry not found" });
      }
      const deleted = await storage.deleteInquiry(id);
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
      if (process.env.NODE_ENV !== "development") {
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
        const inquiries2 = await storage.getAllInquiries();
        inquiryIds = inquiries2.filter((inq) => !inq.isRead).map((inq) => inq.id);
      }
      if (inquiryIds.length === 0) {
        return res.status(200).json({ success: true, message: "No inquiries to mark as read" });
      }
      const results = await Promise.all(inquiryIds.map(async (id2) => {
        return await storage.markInquiryAsRead(id2);
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
      const inquiryData = insertInquirySchema.parse({
        ...req.body,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      const newInquiry = await storage.createInquiry(inquiryData);
      let propertyTitle;
      if (inquiryData.propertyId) {
        const property = await storage.getProperty(inquiryData.propertyId);
        if (property) {
          propertyTitle = property.title;
        }
      }
      try {
        await sendInquiryNotification(newInquiry, propertyTitle);
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
      const states2 = await storage.getAllStates();
      res.json(states2);
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
      const districts2 = await storage.getAllDistricts(stateId);
      res.json(districts2);
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
      const talukas2 = await storage.getAllTalukas(districtId);
      res.json(talukas2);
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
      const tehsils2 = await storage.getAllTehsils(talukaId);
      res.json(tehsils2);
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
  app2.get("/api/contact-info", async (_req, res) => {
    try {
      const contactInfo2 = await storage.getContactInfo();
      if (!contactInfo2) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      res.json(contactInfo2);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });
  app2.post("/api/contact-info", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
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
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const users2 = await storage.getAllUsers();
      const sanitizedUsers = users2.map((user) => {
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
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const { username, password, isAdmin } = req.body;
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      const { hashPassword: hashPassword2 } = (init_auth(), __toCommonJS(auth_exports));
      const hashedPassword = await hashPassword2(password);
      const newUser = await storage.createUser({
        username,
        password: hashedPassword,
        isAdmin: isAdmin || false
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
      const { username, password, isAdmin } = req.body;
      if (username !== existingUser.username) {
        const userWithSameUsername = await storage.getUserByUsername(username);
        if (userWithSameUsername) {
          return res.status(400).json({ message: "Username already exists" });
        }
      }
      const updateData = {};
      if (username) updateData.username = username;
      if (isAdmin !== void 0) updateData.isAdmin = isAdmin;
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
      if (!req.isAuthenticated() || !req.user?.isAdmin) {
        return res.status(403).json({ message: "Forbidden" });
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid user ID" });
      }
      if (id === req.user.id) {
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
      const propertyTypes2 = await storage.getAllPropertyTypes();
      res.json(propertyTypes2);
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
  app2.get("/api/contact-messages", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      try {
        const messages = await storage.getAllContactMessages();
        if (messages && messages.length > 0) {
          res.json(messages);
        } else {
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
        const result = await pool.query(`
          SELECT * FROM contact_messages ORDER BY created_at DESC
        `);
        const formattedMessages = result.rows.map((row) => ({
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
  app2.get("/api/contact-info", async (req, res) => {
    try {
      const contactInfo2 = await storage.getContactInfo();
      if (!contactInfo2) {
        return res.status(404).json({ message: "Contact information not found" });
      }
      res.json(contactInfo2);
    } catch (error) {
      console.error("Error fetching contact information:", error);
      res.status(500).json({ message: "Failed to fetch contact information" });
    }
  });
  app2.get("/api/contact-messages/:id", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
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
  app2.patch("/api/contact-messages/:id/mark-read", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
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
      if (process.env.NODE_ENV !== "development") {
        if (!req.isAuthenticated() || !req.user?.isAdmin) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid message ID" });
      }
      try {
        const success = await storage.deleteContactMessage(id);
        if (success) {
          return res.status(204).end();
        }
      } catch (storageError) {
        console.error("Error deleting message using storage method:", storageError);
      }
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
        throw sqlError;
      }
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });
  app2.patch("/api/contact-messages/mark-read", async (req, res) => {
    try {
      if (process.env.NODE_ENV !== "development") {
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
        const success = await storage.markContactMessagesAsRead(messageIds);
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
              const result = await pool.query(`
                UPDATE contact_messages
                SET is_read = true
                WHERE id = $1
                RETURNING id
              `, [id2]);
              if (result.rowCount > 0) {
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
  app2.use("/api/neighborhoods", neighborhoods_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
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
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
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
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
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
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json({ limit: "50mb" }));
app.use(express2.urlencoded({ extended: false, limit: "50mb" }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
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
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
