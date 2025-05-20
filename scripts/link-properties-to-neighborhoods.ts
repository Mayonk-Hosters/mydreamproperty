import { db } from "../server/db";
import { properties } from "@shared/schema";
import { eq } from "drizzle-orm";

/**
 * This script links existing properties to neighborhoods
 */
async function linkPropertiesToNeighborhoods() {
  console.log("Starting to link properties to neighborhoods...");

  try {
    // Define a mapping of neighborhood IDs to property IDs using existing properties from the database
    const neighborhoodMappings = [
      { neighborhoodId: 1, propertyIds: [30, 31, 33, 34, 36] },   // Juhu properties
      { neighborhoodId: 2, propertyIds: [29, 32, 35, 37, 38] },   // Bandra West properties
      { neighborhoodId: 3, propertyIds: [39, 40, 41, 42, 43] },   // Powai properties
      { neighborhoodId: 4, propertyIds: [44, 45, 46, 47, 48] },   // Andheri East properties
      { neighborhoodId: 5, propertyIds: [49, 50, 51, 52, 53] },   // Malad West properties
    ];

    for (const mapping of neighborhoodMappings) {
      for (const propertyId of mapping.propertyIds) {
        // Update the property to associate it with the neighborhood
        await db
          .update(properties)
          .set({
            neighborhoodId: mapping.neighborhoodId
          })
          .where(eq(properties.id, propertyId));
        
        console.log(`Linked property #${propertyId} to neighborhood #${mapping.neighborhoodId}`);
      }
    }

    console.log("Successfully linked properties to neighborhoods!");
  } catch (error) {
    console.error("Error linking properties to neighborhoods:", error);
  } finally {
    process.exit(0);
  }
}

linkPropertiesToNeighborhoods();