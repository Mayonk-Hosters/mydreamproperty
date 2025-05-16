import { db } from '../server/db';
import { properties } from '../shared/schema';
import { getPropertyImage, getInteriorImage } from "../client/src/lib/utils";

async function generateMDPProperties() {
  console.log("Starting to add MDP properties...");

  // Define rent properties
  const rentProperties = [
    {
      propertyNumber: "MDP-R001",
      title: "Modern Apartment in Downtown",
      description: "Luxury 2-bedroom apartment with stunning city views and modern amenities. Walking distance to restaurants and shops.",
      price: 22000,
      location: "Downtown",
      address: "123 City Center, Mumbai",
      beds: 2,
      baths: 2,
      area: 1200,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(1), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 1
    },
    {
      propertyNumber: "MDP-R002",
      title: "Spacious Family Home",
      description: "4-bedroom house with large backyard, perfect for families. Close to schools and parks.",
      price: 35000,
      location: "Andheri",
      address: "45 Garden Colony, Mumbai",
      beds: 4,
      baths: 3,
      area: 2200,
      propertyType: "House",
      type: "rent",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(2), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 2
    },
    {
      propertyNumber: "MDP-R003",
      title: "Cozy Studio Apartment",
      description: "Perfect studio apartment for singles or young couples. All utilities included.",
      price: 15000,
      location: "Bandra",
      address: "78 Urban Heights, Mumbai",
      beds: 1,
      baths: 1,
      area: 650,
      propertyType: "Studio",
      type: "rent",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(3), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 3
    },
    {
      propertyNumber: "MDP-R004",
      title: "Luxury Penthouse with Terrace",
      description: "Exclusive penthouse with private terrace and panoramic sea views. High-end finishes throughout.",
      price: 80000,
      location: "Marine Drive",
      address: "200 Oceanic Towers, Mumbai",
      beds: 3,
      baths: 3.5,
      area: 3000,
      propertyType: "Penthouse",
      type: "rent",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(4), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 1
    },
    {
      propertyNumber: "MDP-R005",
      title: "Furnished Apartment Near Metro",
      description: "Well-furnished 2-bedroom apartment with excellent connectivity. Close to metro station.",
      price: 28000,
      location: "Powai",
      address: "123 Metro Heights, Mumbai",
      beds: 2,
      baths: 2,
      area: 1100,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(5), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 2
    },
    {
      propertyNumber: "MDP-R006",
      title: "Riverside Apartment with Balcony",
      description: "Beautiful 3-bedroom apartment with balcony overlooking the river. Quiet neighborhood.",
      price: 40000,
      location: "Dadar",
      address: "56 Riverside View, Mumbai",
      beds: 3,
      baths: 2,
      area: 1800,
      propertyType: "Apartment",
      type: "rent",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(0), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 3
    },
    {
      propertyNumber: "MDP-R007",
      title: "Modern Villa with Pool",
      description: "Exclusive villa with private pool and garden. Perfect for luxury living.",
      price: 150000,
      location: "Juhu",
      address: "10 Luxury Lane, Mumbai",
      beds: 5,
      baths: 5.5,
      area: 5000,
      propertyType: "Villa",
      type: "rent",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(7), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 1
    },
    {
      propertyNumber: "MDP-R008",
      title: "Bachelor's Studio Apartment",
      description: "Compact studio apartment, ideal for students or young professionals.",
      price: 12000,
      location: "Malad",
      address: "89 College Road, Mumbai",
      beds: 1,
      baths: 1,
      area: 500,
      propertyType: "Studio",
      type: "rent",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(8), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 2
    }
  ];
  
  // Define buy properties
  const buyProperties = [
    {
      propertyNumber: "MDP-B001",
      title: "Luxury Apartment with Sea View",
      description: "Exquisite 3-bedroom apartment with panoramic sea views. Premium finishes and amenities.",
      price: 18000000,
      location: "Marine Drive",
      address: "501 Ocean Towers, Mumbai",
      beds: 3,
      baths: 3,
      area: 2200,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(9), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 3
    },
    {
      propertyNumber: "MDP-B002",
      title: "Modern Family Bungalow",
      description: "Spacious 4-bedroom bungalow with garden and modern amenities. Perfect for families.",
      price: 35000000,
      location: "Worli",
      address: "25 Green Avenue, Mumbai",
      beds: 4,
      baths: 4,
      area: 3500,
      propertyType: "Bungalow",
      type: "buy",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(10), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 1
    },
    {
      propertyNumber: "MDP-B003",
      title: "Investment Apartment in Business District",
      description: "Great investment opportunity. 2-bedroom apartment in prime business district with high rental potential.",
      price: 12000000,
      location: "BKC",
      address: "78 Business Park, Mumbai",
      beds: 2,
      baths: 2,
      area: 1100,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(11), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 2
    },
    {
      propertyNumber: "MDP-B004",
      title: "Penthouse with Private Terrace",
      description: "Luxury penthouse with private terrace and 360-degree city views. Premium fittings and finishes.",
      price: 42000000,
      location: "Pali Hill",
      address: "100 Skyline Heights, Mumbai",
      beds: 4,
      baths: 4.5,
      area: 4000,
      propertyType: "Penthouse",
      type: "buy",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(12), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 3
    },
    {
      propertyNumber: "MDP-B005",
      title: "First-time Buyer's Apartment",
      description: "Affordable 1-bedroom apartment, perfect for first-time buyers. Good connectivity.",
      price: 7500000,
      location: "Kandivali",
      address: "45 Starter Homes, Mumbai",
      beds: 1,
      baths: 1,
      area: 650,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(13), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 2
    },
    {
      propertyNumber: "MDP-B006",
      title: "Luxury Villa in Gated Community",
      description: "Exclusive 5-bedroom villa in premium gated community with clubhouse and amenities.",
      price: 85000000,
      location: "Juhu",
      address: "10 Elite Enclave, Mumbai",
      beds: 5,
      baths: 6,
      area: 6000,
      propertyType: "Villa",
      type: "buy",
      status: "active",
      featured: true,
      images: JSON.stringify([getPropertyImage(14), getInteriorImage(3), getInteriorImage(4)]),
      agentId: 1
    },
    {
      propertyNumber: "MDP-B007",
      title: "Heritage Apartment with Modern Touches",
      description: "Unique 3-bedroom apartment in heritage building with modern renovations and character.",
      price: 22000000,
      location: "Colaba",
      address: "25 Heritage Lane, Mumbai",
      beds: 3,
      baths: 2,
      area: 1800,
      propertyType: "Apartment",
      type: "buy",
      status: "active",
      featured: false,
      images: JSON.stringify([getPropertyImage(15), getInteriorImage(1), getInteriorImage(2)]),
      agentId: 3
    }
  ];

  try {
    // Insert rent properties
    console.log("Adding rent properties...");
    for (const prop of rentProperties) {
      await db.insert(properties).values(prop);
    }
    console.log(`Successfully added ${rentProperties.length} rent properties`);

    // Insert buy properties
    console.log("Adding buy properties...");
    for (const prop of buyProperties) {
      await db.insert(properties).values(prop);
    }
    console.log(`Successfully added ${buyProperties.length} buy properties`);

    console.log("All MDP properties added successfully");
    console.log(`Total properties added: ${rentProperties.length + buyProperties.length}`);
  } catch (error) {
    console.error("Error adding MDP properties:", error);
  } finally {
    process.exit(0);
  }
}

// Run the function
generateMDPProperties();