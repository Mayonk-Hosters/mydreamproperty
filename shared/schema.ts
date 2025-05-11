import { pgTable, text, serial, integer, boolean, unique, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  isAdmin: true,
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
  status: text("status").default("active"),
  featured: boolean("featured").default(false),
  images: jsonb("images").notNull().default([]),
  agentId: integer("agent_id").notNull(), // Foreign key to agents
  createdAt: text("created_at").notNull(), // Store as ISO date string
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
});

// Agents schema
export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  image: text("image").notNull(),
  deals: integer("deals").default(0),
  rating: real("rating").default(0),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
});

// Inquiries schema
export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  propertyId: integer("property_id").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({
  id: true,
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

// Property types constant
export const PROPERTY_TYPES = ["House", "Apartment", "Villa", "Commercial"] as const;
export const PROPERTY_STATUS = ["active", "pending", "sold"] as const;
