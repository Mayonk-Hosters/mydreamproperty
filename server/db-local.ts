// Local development database connection for MySQL
import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

// This file is a simplified version for local MySQL development
// It's used when running the application locally with MySQL

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// MySQL connection for local development
// Format: mysql://username:password@localhost:3306/mydreamproperty
const poolConnection = mysql.createPool(process.env.DATABASE_URL);

// Export a compatible interface that the rest of the app can use
export const pool = {
  query: async (text: string, params: any[] = []) => {
    try {
      const [rows] = await poolConnection.execute(text, params);
      return { rows };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }
};

// Create a proxy object that mimics the drizzle interface but uses direct SQL
export const db = {
  query: async (sql: string, params: any[] = []) => {
    return await pool.query(sql, params);
  },
  // Add other methods as needed to match the drizzle interface
  // These methods will be simplified versions for local development
  select: () => ({ from: () => [] }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ from: () => ({ where: () => ({ returning: () => [] }) }) })
};