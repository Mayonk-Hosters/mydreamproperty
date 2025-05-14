import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Run this migration to add neighborhoods and neighborhood metrics tables
 * and update the properties table with a neighborhood_id column
 */
async function main() {
  console.log("Starting migration: Adding neighborhoods tables...");

  try {
    // Create neighborhoods table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS neighborhoods (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        city TEXT NOT NULL,
        description TEXT NOT NULL,
        location_data JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Created neighborhoods table");

    // Create neighborhood_metrics table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS neighborhood_metrics (
        id SERIAL PRIMARY KEY,
        neighborhood_id INTEGER NOT NULL REFERENCES neighborhoods(id) ON DELETE CASCADE,
        avg_property_price DECIMAL(12, 2),
        safety_score INTEGER,
        walkability_score INTEGER,
        schools_score INTEGER,
        public_transport_score INTEGER,
        dining_score INTEGER,
        entertainment_score INTEGER,
        parking_score INTEGER,
        noise_level INTEGER,
        schools_count INTEGER DEFAULT 0,
        parks_count INTEGER DEFAULT 0,
        restaurants_count INTEGER DEFAULT 0,
        hospitals_count INTEGER DEFAULT 0,
        shopping_count INTEGER DEFAULT 0,
        grocery_stores_count INTEGER DEFAULT 0,
        gyms_count INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);
    console.log("Created neighborhood_metrics table");

    // Add neighborhood_id column to properties table
    await db.execute(sql`
      ALTER TABLE properties
      ADD COLUMN IF NOT EXISTS neighborhood_id INTEGER REFERENCES neighborhoods(id)
    `);
    console.log("Added neighborhood_id column to properties table");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });