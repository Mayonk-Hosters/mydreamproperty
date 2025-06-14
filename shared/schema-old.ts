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
  areaUnit: text("area_unit").notNull().default("sqft"), // Area measurement unit: sqft, acres
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
  maharera_number: text("maharera_number"), // MahaRERA registration number
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: 'cascade' }),
  // Location hierarchy fields
  stateId: integer("stateId").references(() => states.id),
  districtId: integer("districtId").references(() => districts.id),
  talukaId: integer("talukaId").references(() => talukas.id),
  tehsilId: integer("tehsilId").references(() => tehsils.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(agents, {
    fields: [properties.agentId],
    references: [agents.id],
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

}));

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
}).partial({
  propertyNumber: true,
  stateId: true,
  districtId: true,
  talukaId: true,
  tehsilId: true
});



// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;

// Property Inquiries - Specific property interest
export const propertyInquiries = pgTable("property_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message"),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  inquiryType: text("inquiry_type").notNull().default("general"), // general, visit, buy, rent
  budget: real("budget"), // Buyer's budget
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Home Loan Inquiries - Loan assistance requests
export const homeLoanInquiries = pgTable("home_loan_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  occupation: text("occupation"),
  monthlyIncome: real("monthly_income"),
  loanAmount: real("loan_amount"),
  propertyValue: real("property_value"),
  propertyId: integer("property_id").references(() => properties.id, { onDelete: 'set null' }),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations for inquiries
export const propertyInquiriesRelations = relations(propertyInquiries, ({ one }) => ({
  property: one(properties, {
    fields: [propertyInquiries.propertyId],
    references: [properties.id],
  }),
}));

export const homeLoanInquiriesRelations = relations(homeLoanInquiries, ({ one }) => ({
  property: one(properties, {
    fields: [homeLoanInquiries.propertyId],
    references: [properties.id],
  }),
}));

// Insert schemas for inquiries
export const insertPropertyInquirySchema = createInsertSchema(propertyInquiries).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertHomeLoanInquirySchema = createInsertSchema(homeLoanInquiries).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

// Type definitions for inquiries
export type PropertyInquiry = typeof propertyInquiries.$inferSelect;
export type InsertPropertyInquiry = z.infer<typeof insertPropertyInquirySchema>;

export type HomeLoanInquiry = typeof homeLoanInquiries.$inferSelect;
export type InsertHomeLoanInquiry = z.infer<typeof insertHomeLoanInquirySchema>;

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

// Homepage Images schema for admin management
export const homepageImages = pgTable("homepage_images", {
  id: serial("id").primaryKey(),
  imageType: text("image_type").notNull(), // 'hero', 'feature', 'banner', etc.
  imageUrl: text("image_url").notNull(),
  title: text("title"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertHomepageImageSchema = createInsertSchema(homepageImages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type HomepageImage = typeof homepageImages.$inferSelect;
export type InsertHomepageImage = z.infer<typeof insertHomepageImageSchema>;





// Default property types (for backwards compatibility)
export const DEFAULT_PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"];
export const PROPERTY_STATUS = ["active", "pending", "sold"] as const;
