import { db } from "../server/db";
import { users, properties, agents, states, districts, talukas, tehsils, contactMessages, homeLoanInquiries, propertyInquiries } from "../shared/schema";
import bcrypt from "bcrypt";

async function hashPassword(password: string) {
  return await bcrypt.hash(password, 10);
}

async function seedPostgres() {
  console.log("🌱 Seeding PostgreSQL database...");

  try {
    // Create admin user
    const hashedPassword = await hashPassword("admin123");
    const [adminUser] = await db.insert(users).values({
      id: "1",
      username: "admin",
      password: hashedPassword,
      fullName: "Admin User",
      email: "admin@realestate.com",
      isAdmin: true
    }).returning();
    console.log("✓ Admin user created");

    // Create states
    const [maharashtra] = await db.insert(states).values({
      name: "Maharashtra",
      active: true
    }).returning();

    // Create districts
    const [ahmednagar] = await db.insert(districts).values({
      name: "Ahmednagar",
      stateId: maharashtra.id,
      active: true
    }).returning();

    // Create talukas
    const [ahmednagarTaluka] = await db.insert(talukas).values({
      name: "Ahmednagar",
      districtId: ahmednagar.id,
      active: true
    }).returning();

    // Create tehsils
    const [savediTehsil] = await db.insert(tehsils).values({
      name: "Savedi",
      talukaId: ahmednagarTaluka.id,
      active: true
    }).returning();

    console.log("✓ Location hierarchy created");

    // Create agent
    const [agent] = await db.insert(agents).values({
      name: "Rahul Sharma",
      title: "Senior Property Consultant",
      image: "/api/placeholder/150/150",
      contactNumber: "9876543210",
      email: "rahul@realestate.com",
      deals: 25,
      rating: 4.8
    }).returning();
    console.log("✓ Agent created");

    // Create sample properties
    const propertyData = [
      {
        propertyNumber: "MDP-0001",
        title: "Luxury 3BHK Apartment in Savedi",
        description: "Spacious 3BHK apartment with modern amenities in prime location",
        price: 4500000,
        location: "Savedi, Ahmednagar",
        address: "Plot No. 123, Savedi Road, Ahmednagar",
        beds: 3,
        baths: 2,
        area: 1200,
        propertyType: "Apartment",
        type: "sale",
        status: "available",
        featured: true,
        features: ["parking", "security", "garden", "gym"],
        agentId: agent.id,
        maharera_registered: true,
        maharera_number: "P52100047890",
        stateId: maharashtra.id,
        districtId: ahmednagar.id,
        talukaId: ahmednagarTaluka.id,
        tehsilId: savediTehsil.id
      },
      {
        propertyNumber: "MDP-0002", 
        title: "Modern 2BHK Flat with Garden View",
        description: "Beautiful 2BHK flat with garden view and premium amenities",
        price: 3200000,
        location: "Savedi, Ahmednagar",
        address: "Building No. 456, Garden Colony, Savedi",
        beds: 2,
        baths: 2,
        area: 950,
        propertyType: "Apartment",
        type: "sale",
        status: "available",
        featured: false,
        features: ["parking", "garden", "security"],
        agentId: agent.id,
        maharera_registered: true,
        maharera_number: "P52100047891",
        stateId: maharashtra.id,
        districtId: ahmednagar.id,
        talukaId: ahmednagarTaluka.id,
        tehsilId: savediTehsil.id
      }
    ];

    await db.insert(properties).values(propertyData);
    console.log("✓ Sample properties created");

    // Create sample contact messages
    const contactData = [
      {
        name: "John Smith",
        email: "john@example.com",
        phone: "9876543210",
        subject: "Property Inquiry",
        message: "I am interested in the luxury apartment in Savedi",
        isRead: false
      },
      {
        name: "Priya Patel",
        email: "priya@example.com", 
        phone: "8765432109",
        subject: "Home Loan Assistance",
        message: "Need help with home loan approval process",
        isRead: false
      }
    ];

    await db.insert(contactMessages).values(contactData);
    console.log("✓ Sample contact messages created");

    // Create sample home loan inquiries
    const loanData = [
      {
        name: "Amit Kumar",
        email: "amit@example.com",
        phone: "7654321098",
        loanType: "home-purchase",
        loanAmount: 3500000,
        propertyLocation: "Savedi, Ahmednagar",
        monthlyIncome: 75000,
        employment: "salaried",
        message: "Looking for home loan for first property purchase",
        isRead: false
      },
      {
        name: "Sneha Desai",
        email: "sneha@example.com",
        phone: "6543210987", 
        loanType: "home-construction",
        loanAmount: 2800000,
        propertyLocation: "Ahmednagar",
        monthlyIncome: 65000,
        employment: "self-employed-business",
        message: "Need construction loan for new house",
        isRead: false
      }
    ];

    await db.insert(homeLoanInquiries).values(loanData);
    console.log("✓ Sample home loan inquiries created");

    // Create sample property inquiries
    const propertyInquiryData = [
      {
        name: "Rajesh Khanna",
        email: "rajesh@example.com",
        phone: "5432109876",
        message: "Interested in MDP-0001 property. Please contact me",
        propertyId: 1,
        inquiryType: "Purchase",
        budget: 4500000,
        isRead: false
      }
    ];

    await db.insert(propertyInquiries).values(propertyInquiryData);
    console.log("✓ Sample property inquiries created");

    console.log("🎉 PostgreSQL database seeded successfully!");
    console.log("Admin credentials: username='admin', password='admin123'");

  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seedPostgres().catch(console.error);