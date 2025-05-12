import { pgTable, text, serial, integer, boolean, unique, real, jsonb, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
});

// Agents schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  image: text("image").notNull(),
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
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  location: text("location").notNull(),
  address: text("address").notNull(),
  beds: integer("beds").notNull(),
  baths: real("baths").notNull(),
  area: integer("area").notNull(),
  propertyType: text("property_type").notNull(),
  type: text("type").notNull().default("buy"), // Property transaction type: buy, rent, sell
  status: text("status").default("active"),
  featured: boolean("featured").default(false),
  images: jsonb("images").notNull().default([]),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  agent: one(agents, {
    fields: [properties.agentId],
    references: [agents.id],
  }),
  inquiries: many(inquiries),
}));

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
});

// Inquiries schema
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  propertyId: integer("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  userId: integer("user_id").references(() => users.id),
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
export const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"] as const;
export const PROPERTY_STATUS = ["active", "pending", "sold"] as const;
