import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// MySQL connection for local development
// Format: mysql://username:password@localhost:3306/mydreamproperty
const poolConnection = mysql.createPool(process.env.DATABASE_URL);
export const db = drizzle(poolConnection);
export const pool = poolConnection;