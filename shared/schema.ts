import { pgTable, text, serial, integer, boolean, unique, real, jsonb, timestamp, decimal, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User schema
export const users = pgTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email"),
  username: text("username"),
  password: text("password"),
  fullName: text("full_name"),
  profileImage: text("profile_image"),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}));

export const insertUserSchema = createInsertSchema(users);

// Agents schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  image: text("image").notNull(),
  contactNumber: text("contact_number"),
  email: text("email"),
  deals: integer("deals").default(0),
  rating: real("rating").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const agentsRelations = relations(agents, ({ many }) => ({
  properties: many(properties),
}));

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  createdAt: true,
});

// Property schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  propertyNumber: text("property_number").unique(), // Unique property number (MDP-XXX)
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  beds: integer("beds").notNull(),
  baths: real("baths").notNull(),
  area: integer("area").notNull(),
  yearBuilt: integer("year_built"), // Year the property was built
  parking: integer("parking"), // Number of parking spaces
  propertyType: text("property_type").notNull(),
  type: text("type").notNull().default("buy"), // Property transaction type: buy, rent, sell
  status: text("status").default("active"),
  featured: boolean("featured").default(false),
  features: jsonb("features").default([]), // Property features/amenities
  images: jsonb("images").notNull().default([]),
  mapUrl: text("map_url"), // Google Maps URL for property location
  maharera_registered: boolean("maharera_registered").default(false), // Whether the property is MahaRERA registered
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: 'cascade' }),
  neighborhoodId: integer("neighborhood_id").references(() => neighborhoods.id),
  // Location hierarchy fields
  stateId: integer("state_id").references(() => states.id),
  districtId: integer("district_id").references(() => districts.id),
  talukaId: integer("taluka_id").references(() => talukas.id),
  tehsilId: integer("tehsil_id").references(() => tehsils.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(agents, {
    fields: [properties.agentId],
    references: [agents.id],
  }),
  neighborhood: one(neighborhoods, {
    fields: [properties.neighborhoodId],
    references: [neighborhoods.id],
  }),
  state: one(states, {
    fields: [properties.stateId],
    references: [states.id],
  }),
  district: one(districts, {
    fields: [properties.districtId],
    references: [districts.id],
  }),
  taluka: one(talukas, {
    fields: [properties.talukaId],
    references: [talukas.id],
  }),
  tehsil: one(tehsils, {
    fields: [properties.tehsilId],
    references: [tehsils.id],
  }),
  inquiries: many(inquiries),
}));

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
}).partial({
  propertyNumber: true,
  neighborhoodId: true,
  stateId: true,
  districtId: true,
  talukaId: true,
  tehsilId: true
});

// Inquiries schema
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: text("user_id").references(() => users.id),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  property: one(properties, {
    fields: [inquiries.propertyId],
    references: [properties.id],
  }),
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
}));

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
  createdAt: true,
  userId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;

// India Locations Tables
export const states = pgTable("states", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  code: text("code"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  stateId: integer("state_id").notNull().references(() => states.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const talukas = pgTable("talukas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  districtId: integer("district_id").notNull().references(() => districts.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tehsils = pgTable("tehsils", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  talukaId: integer("taluka_id").notNull().references(() => talukas.id, { onDelete: 'cascade' }),
  area: text("area").default(''),  // Area as a location text
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for locations
export const statesRelations = relations(states, ({ many }) => ({
  districts: many(districts),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  state: one(states, {
    fields: [districts.stateId],
    references: [states.id],
  }),
  talukas: many(talukas),
}));

export const talukasRelations = relations(talukas, ({ one, many }) => ({
  district: one(districts, {
    fields: [talukas.districtId],
    references: [districts.id],
  }),
  tehsils: many(tehsils),
}));

export const tehsilsRelations = relations(tehsils, ({ one }) => ({
  taluka: one(talukas, {
    fields: [tehsils.talukaId],
    references: [talukas.id],
  }),
}));

// Insert schemas for locations
export const insertStateSchema = createInsertSchema(states).omit({
  id: true,
  createdAt: true,
});

export const insertDistrictSchema = createInsertSchema(districts).omit({
  id: true,
  createdAt: true,
});

export const insertTalukaSchema = createInsertSchema(talukas).omit({
  id: true,
  createdAt: true,
});

export const insertTehsilSchema = createInsertSchema(tehsils).omit({
  id: true,
  createdAt: true,
});

// Location type definitions
export type State = typeof states.$inferSelect;
export type InsertState = z.infer<typeof insertStateSchema>;

export type District = typeof districts.$inferSelect;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;

export type Taluka = typeof talukas.$inferSelect;
export type InsertTaluka = z.infer<typeof insertTalukaSchema>;

export type Tehsil = typeof tehsils.$inferSelect;
export type InsertTehsil = z.infer<typeof insertTehsilSchema>;

// Property types constant
// Contact information schema
export const contactInfo = pgTable("contact_info", {
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertContactInfoSchema = createInsertSchema(contactInfo).omit({
  id: true,
  updatedAt: true,
});

export type ContactInfo = typeof contactInfo.$inferSelect;
export type InsertContactInfo = z.infer<typeof insertContactInfoSchema>;

// Property types table
export const propertyTypes = pgTable("property_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPropertyTypeSchema = createInsertSchema(propertyTypes).omit({
  id: true,
  createdAt: true,
});

export type PropertyType = typeof propertyTypes.$inferSelect;
export type InsertPropertyType = z.infer<typeof insertPropertyTypeSchema>;

// Contact Messages schema
export const contactMessages = pgTable("contact_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  isRead: true,
  createdAt: true,
});

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

// Neighborhoods schema
export const neighborhoods = pgTable("neighborhoods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  city: text("city").notNull(),
  description: text("description").notNull(),
  locationData: jsonb("location_data").notNull().default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

export const neighborhoodMetrics = pgTable("neighborhood_metrics", {
  id: serial("id").primaryKey(),
  neighborhoodId: integer("neighborhood_id").notNull().references(() => neighborhoods.id, { onDelete: 'cascade' }),
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
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const neighborhoodsRelations = relations(neighborhoods, ({ one, many }) => ({
  metrics: one(neighborhoodMetrics, {
    fields: [neighborhoods.id],
    references: [neighborhoodMetrics.neighborhoodId],
  }),
  properties: many(properties),
}));

export const neighborhoodMetricsRelations = relations(neighborhoodMetrics, ({ one }) => ({
  neighborhood: one(neighborhoods, {
    fields: [neighborhoodMetrics.neighborhoodId],
    references: [neighborhoods.id],
  }),
}));

export const insertNeighborhoodSchema = createInsertSchema(neighborhoods).omit({
  id: true,
  createdAt: true,
});

export const insertNeighborhoodMetricsSchema = createInsertSchema(neighborhoodMetrics).omit({
  id: true,
  updatedAt: true,
});

export type Neighborhood = typeof neighborhoods.$inferSelect;
export type InsertNeighborhood = z.infer<typeof insertNeighborhoodSchema>;

export type NeighborhoodMetrics = typeof neighborhoodMetrics.$inferSelect;
export type InsertNeighborhoodMetrics = z.infer<typeof insertNeighborhoodMetricsSchema>;

// Default property types (for backwards compatibility)
export const DEFAULT_PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"];
export const PROPERTY_STATUS = ["active", "pending", "sold"] as const;
