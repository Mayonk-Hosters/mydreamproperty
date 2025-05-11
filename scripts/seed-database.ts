import { db } from "../server/db";
import { users, agents, properties, inquiries } from "../shared/schema";
import { getPropertyImage, getAgentImage, getInteriorImage } from "../client/src/lib/utils";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("Seeding database...");
  
  try {
    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    await db.insert(users).values({
      username: "admin",
      password: hashedPassword,
      isAdmin: true
    }).onConflictDoNothing();
    console.log("✅ Admin user created");
    
    // Create sample agents
    const agentTitles = [
      "Luxury Property Specialist",
      "Urban Property Expert",
      "Commercial Specialist",
      "First-time Buyer Expert"
    ];
    
    const agentNames = [
      "Jessica Williams",
      "Michael Chen",
      "Robert Taylor",
      "Sarah Johnson"
    ];
    
    for (let i = 0; i < 4; i++) {
      await db.insert(agents).values({
        name: agentNames[i],
        title: agentTitles[i],
        image: getAgentImage(i),
        deals: 75 + Math.floor(Math.random() * 50),
        rating: 4.5 + (Math.random() * 0.5)
      }).onConflictDoNothing();
    }
    console.log("✅ Sample agents created");
    
    // Create sample properties
    const propertyTitles = [
      "Modern Luxury Villa",
      "Downtown Apartment",
      "Suburban Family Home",
      "Luxury Penthouse",
      "Beachfront Villa",
      "Minimalist Modern Home"
    ];
    
    const locations = ["Beverly Hills, CA", "San Francisco, CA", "Austin, TX", "New York, NY", "Malibu, CA", "Seattle, WA"];
    const addresses = [
      "123 Luxury Lane, Beverly Hills, CA 90210",
      "456 Downtown Ave, San Francisco, CA 94105",
      "789 Suburban Dr, Austin, TX 78701",
      "101 Penthouse Blvd, New York, NY 10001",
      "202 Beachfront Way, Malibu, CA 90265",
      "303 Modern St, Seattle, WA 98101"
    ];
    
    const prices = [2850000, 775000, 925000, 1950000, 3500000, 1375000];
    const beds = [5, 2, 4, 3, 6, 3];
    const baths = [6, 2, 3, 3.5, 7, 2.5];
    const areas = [6500, 1200, 2800, 3200, 7500, 2400];
    
    for (let i = 0; i < 6; i++) {
      const propertyType = i % 2 === 0 ? "House" : (i % 3 === 0 ? "Apartment" : (i % 4 === 0 ? "Commercial" : "Villa"));
      const status = i % 5 === 0 ? "sold" : (i % 3 === 0 ? "pending" : "active");
      
      await db.insert(properties).values({
        title: propertyTitles[i],
        description: `This beautiful ${propertyType.toLowerCase()} features ${beds[i]} bedrooms, ${baths[i]} bathrooms, and ${areas[i]} square feet of living space. Located in ${locations[i]}, it offers modern amenities and a great location.`,
        price: prices[i],
        location: locations[i],
        address: addresses[i],
        beds: beds[i],
        baths: baths[i],
        area: areas[i],
        propertyType: propertyType,
        status: status,
        featured: i < 2, // First two properties are featured
        images: [
          getPropertyImage(i),
          getPropertyImage((i + 1) % 6),
          getInteriorImage(i % 4),
          getInteriorImage((i + 1) % 4)
        ],
        agentId: (i % 4) + 1
      }).onConflictDoNothing();
    }
    console.log("✅ Sample properties created");
    
    // Create sample inquiries
    const inquiryNames = ["Emily Robertson", "David Wilson", "Thomas Anderson"];
    const inquiryEmails = ["emily.r@example.com", "david.w@example.com", "thomas.a@example.com"];
    const inquiryMessages = [
      "I'd like to schedule a viewing this weekend if possible. Is the property still available?",
      "What are the HOA fees for this property? Also, is parking included?",
      "I'm an investor looking for properties in this area. Is the seller open to negotiations?"
    ];
    
    for (let i = 0; i < 3; i++) {
      await db.insert(inquiries).values({
        name: inquiryNames[i],
        email: inquiryEmails[i],
        message: inquiryMessages[i],
        propertyId: i + 1
      }).onConflictDoNothing();
    }
    console.log("✅ Sample inquiries created");
    
    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();