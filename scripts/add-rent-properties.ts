import { db } from "../server/db";
import { properties } from "../shared/schema";

/**
 * Script to add rent properties to the database
 */
async function addRentProperties() {
  console.log("Adding rent properties to database...");

  const rentPropertiesData = [
    {
      propertyNumber: "MDP-R001",
      title: "Modern 3BHK Apartment for Rent",
      description: "Spacious 3BHK apartment in prime location with modern amenities, gym, swimming pool, and 24/7 security. Perfect for families looking for comfortable living.",
      price: "35000",
      location: "Kharadi",
      address: "EON IT Park Road",
      beds: 3,
      baths: 3,
      area: 1450,
      areaUnit: "sqft",
      yearBuilt: 2023,
      parking: 2,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: true,
      features: ["LIFT", "GYM", "SWIMMING POOL", "CCTV", "PARKING", "GARDEN"],
      images: ["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: true,
      maharera_number: "P52100047890"
    },
    {
      propertyNumber: "MDP-R002", 
      title: "Luxury 2BHK Villa for Rent",
      description: "Beautiful 2BHK villa with private garden, covered parking, and modern kitchen. Located in peaceful residential area with easy access to schools and hospitals.",
      price: "28000",
      location: "Wagholi",
      address: "Wagholi Main Road",
      beds: 2,
      baths: 2,
      area: 1200,
      areaUnit: "sqft",
      yearBuilt: 2022,
      parking: 1,
      propertyType: "Villa",
      type: "rent",
      status: "active",
      featured: false,
      features: ["PRIVATE GARDEN", "PARKING", "MODULAR KITCHEN", "CCTV"],
      images: ["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: false,
      maharera_number: null
    },
    {
      propertyNumber: "MDP-R003",
      title: "Affordable 1BHK Flat for Rent", 
      description: "Compact 1BHK flat perfect for bachelors or small families. Well-ventilated with basic amenities and good connectivity to IT parks.",
      price: "18000",
      location: "Hadapsar",
      address: "Hadapsar Industrial Estate",
      beds: 1,
      baths: 1,
      area: 650,
      areaUnit: "sqft", 
      yearBuilt: 2021,
      parking: 1,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: false,
      features: ["PARKING", "CCTV", "WATER SUPPLY"],
      images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: false,
      maharera_number: null
    },
    {
      propertyNumber: "MDP-R004",
      title: "Premium 4BHK Penthouse for Rent",
      description: "Luxurious 4BHK penthouse with terrace garden, premium fittings, and panoramic city views. Ideal for executives and large families.",
      price: "65000",
      location: "Baner",
      address: "Baner Main Road",
      beds: 4,
      baths: 4,
      area: 2200,
      areaUnit: "sqft",
      yearBuilt: 2024,
      parking: 3,
      propertyType: "Penthouse",
      type: "rent",
      status: "active",
      featured: true,
      features: ["TERRACE GARDEN", "PREMIUM FITTINGS", "CITY VIEW", "LIFT", "GYM", "PARKING"],
      images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: true,
      maharera_number: "P52100048901"
    },
    {
      propertyNumber: "MDP-R005",
      title: "Cozy 2BHK Apartment for Rent",
      description: "Well-maintained 2BHK apartment in family-friendly neighborhood with playground, shopping complex nearby, and excellent public transport connectivity.",
      price: "22000",
      location: "Vishrantwadi",
      address: "Vishrantwadi Main Road",
      beds: 2,
      baths: 2,
      area: 950,
      areaUnit: "sqft",
      yearBuilt: 2020,
      parking: 1,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: false,
      features: ["PLAYGROUND", "SHOPPING COMPLEX", "PARKING", "CCTV"],
      images: ["https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: false,
      maharera_number: null
    }
  ];

  try {
    // Insert rent properties
    const insertedProperties = await db.insert(properties).values(rentPropertiesData).returning();
    
    console.log(`✅ Successfully added ${insertedProperties.length} rent properties:`);
    insertedProperties.forEach(property => {
      console.log(`- ${property.propertyNumber}: ${property.title} (₹${property.price}/month)`);
    });
    
  } catch (error) {
    console.error("❌ Error adding rent properties:", error);
  }
}

// Run the script
addRentProperties().then(() => {
  console.log("Rent properties addition completed!");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});