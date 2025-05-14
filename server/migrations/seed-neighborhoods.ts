import { db } from "../db";
import { neighborhoods, neighborhoodMetrics } from "@shared/schema";

/**
 * Seed script to add sample neighborhood data
 */
async function main() {
  console.log("Starting to seed neighborhood data...");

  try {
    // Add sample neighborhoods
    const neighborhoodsData = [
      {
        name: "Juhu",
        city: "Mumbai",
        description: "A wealthy, upmarket neighborhood located along the Arabian Sea. Known for its beautiful beach, luxury hotels, and celebrity homes.",
        locationData: { 
          lat: 19.1075, 
          lng: 72.8263,
          boundaries: [
            { lat: 19.0975, lng: 72.8163 },
            { lat: 19.0975, lng: 72.8363 },
            { lat: 19.1175, lng: 72.8363 },
            { lat: 19.1175, lng: 72.8163 }
          ]
        }
      },
      {
        name: "Bandra West",
        city: "Mumbai",
        description: "A trendy and cosmopolitan neighborhood with a mix of heritage and modern influences. Popular for shopping, dining, and entertainment.",
        locationData: { 
          lat: 19.0607, 
          lng: 72.8362,
          boundaries: [
            { lat: 19.0507, lng: 72.8262 },
            { lat: 19.0507, lng: 72.8462 },
            { lat: 19.0707, lng: 72.8462 },
            { lat: 19.0707, lng: 72.8262 }
          ]
        }
      },
      {
        name: "Powai",
        city: "Mumbai",
        description: "A planned neighborhood with a beautiful lake, modern residential complexes, and the prestigious Indian Institute of Technology campus.",
        locationData: { 
          lat: 19.1207, 
          lng: 72.9046,
          boundaries: [
            { lat: 19.1107, lng: 72.8946 },
            { lat: 19.1107, lng: 72.9146 },
            { lat: 19.1307, lng: 72.9146 },
            { lat: 19.1307, lng: 72.8946 }
          ]
        }
      },
      {
        name: "Andheri East",
        city: "Mumbai",
        description: "A major commercial hub with offices, malls, and the international airport. Also features residential areas with good connectivity.",
        locationData: { 
          lat: 19.1173, 
          lng: 72.8695,
          boundaries: [
            { lat: 19.1073, lng: 72.8595 },
            { lat: 19.1073, lng: 72.8795 },
            { lat: 19.1273, lng: 72.8795 },
            { lat: 19.1273, lng: 72.8595 }
          ]
        }
      },
      {
        name: "Malad West",
        city: "Mumbai",
        description: "A vibrant suburban neighborhood with a mix of residential and commercial areas, shopping malls, and proximity to Aksa Beach.",
        locationData: { 
          lat: 19.1871, 
          lng: 72.8401,
          boundaries: [
            { lat: 19.1771, lng: 72.8301 },
            { lat: 19.1771, lng: 72.8501 },
            { lat: 19.1971, lng: 72.8501 },
            { lat: 19.1971, lng: 72.8301 }
          ]
        }
      }
    ];

    // Insert neighborhoods
    console.log("Inserting neighborhoods...");
    const insertedNeighborhoods = [];
    
    for (const neighborhood of neighborhoodsData) {
      const [result] = await db.insert(neighborhoods).values(neighborhood).returning();
      insertedNeighborhoods.push(result);
      console.log(`Added neighborhood: ${neighborhood.name}`);
    }

    // Add metrics for each neighborhood
    console.log("Inserting neighborhood metrics...");
    
    const metricsData = [
      {
        neighborhoodId: insertedNeighborhoods[0].id, // Juhu
        avgPropertyPrice: 450000.00,
        safetyScore: 87,
        walkabilityScore: 75,
        schoolsScore: 82,
        publicTransportScore: 68,
        diningScore: 92,
        entertainmentScore: 90,
        parkingScore: 45,
        noiseLevel: 60,
        schoolsCount: 8,
        parksCount: 3,
        restaurantsCount: 124,
        hospitalsCount: 5,
        shoppingCount: 76,
        groceryStoresCount: 18,
        gymsCount: 12
      },
      {
        neighborhoodId: insertedNeighborhoods[1].id, // Bandra West
        avgPropertyPrice: 420000.00,
        safetyScore: 85,
        walkabilityScore: 88,
        schoolsScore: 78,
        publicTransportScore: 80,
        diningScore: 95,
        entertainmentScore: 93,
        parkingScore: 40,
        noiseLevel: 65,
        schoolsCount: 12,
        parksCount: 4,
        restaurantsCount: 180,
        hospitalsCount: 4,
        shoppingCount: 120,
        groceryStoresCount: 25,
        gymsCount: 18
      },
      {
        neighborhoodId: insertedNeighborhoods[2].id, // Powai
        avgPropertyPrice: 380000.00,
        safetyScore: 91,
        walkabilityScore: 65,
        schoolsScore: 90,
        publicTransportScore: 62,
        diningScore: 80,
        entertainmentScore: 75,
        parkingScore: 70,
        noiseLevel: 45,
        schoolsCount: 15,
        parksCount: 8,
        restaurantsCount: 78,
        hospitalsCount: 3,
        shoppingCount: 40,
        groceryStoresCount: 15,
        gymsCount: 8
      },
      {
        neighborhoodId: insertedNeighborhoods[3].id, // Andheri East
        avgPropertyPrice: 320000.00,
        safetyScore: 75,
        walkabilityScore: 65,
        schoolsScore: 70,
        publicTransportScore: 85,
        diningScore: 78,
        entertainmentScore: 80,
        parkingScore: 60,
        noiseLevel: 75,
        schoolsCount: 10,
        parksCount: 2,
        restaurantsCount: 90,
        hospitalsCount: 6,
        shoppingCount: 65,
        groceryStoresCount: 22,
        gymsCount: 14
      },
      {
        neighborhoodId: insertedNeighborhoods[4].id, // Malad West
        avgPropertyPrice: 290000.00,
        safetyScore: 78,
        walkabilityScore: 60,
        schoolsScore: 75,
        publicTransportScore: 72,
        diningScore: 70,
        entertainmentScore: 68,
        parkingScore: 65,
        noiseLevel: 68,
        schoolsCount: 14,
        parksCount: 5,
        restaurantsCount: 65,
        hospitalsCount: 4,
        shoppingCount: 55,
        groceryStoresCount: 20,
        gymsCount: 10
      }
    ];

    for (const metrics of metricsData) {
      await db.insert(neighborhoodMetrics).values(metrics);
      console.log(`Added metrics for neighborhood ID: ${metrics.neighborhoodId}`);
    }

    console.log("Neighborhood data seeding completed successfully!");
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch(err => {
    console.error(err);
    process.exit(1);
  });