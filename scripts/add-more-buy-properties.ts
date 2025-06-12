import { db } from "../server/db";
import { properties } from "../shared/schema";

/**
 * Script to add more buy properties (both featured and non-featured)
 */
async function addMoreBuyProperties() {
  console.log("Adding more buy properties to database...");

  const buyPropertiesData = [
    {
      propertyNumber: "MDP-B002",
      title: "Elegant 3BHK Villa for Sale",
      description: "Beautiful 3BHK villa with spacious rooms, modern kitchen, private garden, and covered parking. Located in premium gated community with 24/7 security and amenities.",
      price: "12500000",
      location: "Baner",
      address: "Baner-Balewadi Road",
      beds: 3,
      baths: 3,
      area: 1800,
      areaUnit: "sqft",
      yearBuilt: 2023,
      parking: 2,
      propertyType: "Villa",
      type: "buy",
      status: "active",
      featured: false,
      features: ["PRIVATE GARDEN", "GATED COMMUNITY", "CLUBHOUSE", "SWIMMING POOL", "GYM"],
      images: ["https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: true,
      maharera_number: "P52100049012"
    },
    {
      propertyNumber: "MDP-B003",
      title: "Spacious 2BHK Apartment for Sale",
      description: "Well-designed 2BHK apartment with excellent ventilation, modern amenities, and prime location. Perfect for small families with easy access to schools and shopping centers.",
      price: "7800000",
      location: "Hadapsar",
      address: "Hadapsar Main Road",
      beds: 2,
      baths: 2,
      area: 1100,
      areaUnit: "sqft",
      yearBuilt: 2022,
      parking: 1,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: false,
      features: ["LIFT", "PARKING", "SECURITY", "POWER BACKUP"],
      images: ["https://images.unsplash.com/photo-1600585154526-990dced4db0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: false,
      maharera_number: null
    },
    {
      propertyNumber: "MDP-B004",
      title: "Luxury 4BHK Penthouse for Sale",
      description: "Premium 4BHK penthouse with terrace, city views, high-end finishes, and exclusive amenities. Located in prestigious tower with world-class facilities.",
      price: "25000000",
      location: "Koregaon Park",
      address: "Koregaon Park Road",
      beds: 4,
      baths: 4,
      area: 2500,
      areaUnit: "sqft",
      yearBuilt: 2024,
      parking: 3,
      propertyType: "Penthouse",
      type: "buy",
      status: "active",
      featured: true,
      features: ["TERRACE", "CITY VIEW", "LUXURY FITTINGS", "CONCIERGE", "VALET PARKING"],
      images: ["https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: true,
      maharera_number: "P52100049123"
    },
    {
      propertyNumber: "MDP-B005",
      title: "Affordable 1BHK Flat for Sale",
      description: "Compact and well-planned 1BHK flat perfect for first-time buyers. Good connectivity, basic amenities, and reasonable pricing make it an ideal investment.",
      price: "4200000",
      location: "Vishrantwadi",
      address: "Vishrantwadi Circle",
      beds: 1,
      baths: 1,
      area: 580,
      areaUnit: "sqft",
      yearBuilt: 2021,
      parking: 1,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: false,
      features: ["PARKING", "SECURITY", "WATER SUPPLY"],
      images: ["https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"],
      agentId: 6,
      maharera_registered: false,
      maharera_number: null
    }
  ];

  try {
    // Insert buy properties
    const insertedProperties = await db.insert(properties).values(buyPropertiesData).returning();
    
    console.log(`✅ Successfully added ${insertedProperties.length} buy properties:`);
    insertedProperties.forEach(property => {
      console.log(`- ${property.propertyNumber}: ${property.title} (₹${Number(property.price).toLocaleString()})`);
    });
    
  } catch (error) {
    console.error("❌ Error adding buy properties:", error);
  }
}

// Run the script
addMoreBuyProperties().then(() => {
  console.log("Buy properties addition completed!");
  process.exit(0);
}).catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});