// TiDB Cloud serverless database adapter
import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please provide your TiDB Cloud connection string.",
  );
}

// Connect to TiDB Cloud
const connection = connect({
  url: process.env.DATABASE_URL
});

// Create a pool interface that's compatible with the rest of the application
export const pool = {
  query: async (text: string, params: any[] = []) => {
    try {
      const results = await connection.execute(text, params);
      return { rows: results.rows || [] };
    } catch (error) {
      console.error("Database query error:", error);
      throw error;
    }
  }
};

// Create a proxy object that mimics the drizzle interface
export const db = {
  query: async (sql: string, params: any[] = []) => {
    return await pool.query(sql, params);
  },
  // Add other methods as needed to match the drizzle interface
  // These methods will be simplified versions for TiDB Cloud
  select: () => ({ from: () => [] }),
  insert: () => ({ values: () => ({ returning: () => [] }) }),
  update: () => ({ set: () => ({ where: () => ({ returning: () => [] }) }) }),
  delete: () => ({ from: () => ({ where: () => ({ returning: () => [] }) }) })
};