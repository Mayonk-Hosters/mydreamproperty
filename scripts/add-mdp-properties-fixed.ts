import { db } from "../server/db";
import { properties, agents } from "../shared/schema";

/**
 * This script adds MDP prefixed properties to the database
 */
async function addMDPProperties() {
  try {
    console.log("Starting to add MDP properties...");
    
    // First, check if we already have agents
    const existingAgents = await db.select().from(agents);
    
    // If no agents exist, we need at least one
    let agentId = 1;
    if (existingAgents.length === 0) {
      console.log("No agents found. Creating a default agent...");
      const [newAgent] = await db.insert(agents).values({
        name: "Jessica Williams",
        title: "Luxury Property Specialist",
        image: "https://randomuser.me/api/portraits/women/32.jpg",
        deals: 24,
        rating: 4.8
      }).returning();
      agentId = newAgent.id;
      console.log(`Created agent with ID: ${agentId}`);
    } else {
      agentId = existingAgents[0].id;
    }
    
    // Define rental properties with MDP-R prefix
    const rentalProperties = [
      {
        propertyNumber: "MDP-R001",
        title: "Modern Apartment in Downtown",
        description: "Stylish, fully furnished apartment in the heart of downtown. Features high ceilings, modern appliances, and a spacious balcony with city views.",
        price: 1800,
        location: "New York, NY",
        address: "123 Downtown Blvd, New York, NY 10001",
        beds: 2,
        baths: 2,
        area: 1200,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R002",
        title: "Spacious Family Home",
        description: "Beautiful 4-bedroom home in a family-friendly neighborhood with large backyard, modern kitchen, and close to schools and parks.",
        price: 2500,
        location: "Chicago, IL",
        address: "456 Family Lane, Chicago, IL 60007",
        beds: 4,
        baths: 3,
        area: 2400,
        propertyType: "House",
        type: "rent",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R003",
        title: "Cozy Studio Apartment",
        description: "Efficient and stylish studio apartment in a prime location. Perfect for professionals or students with easy access to public transport.",
        price: 950,
        location: "Boston, MA",
        address: "789 Studio St, Boston, MA 02108",
        beds: 1,
        baths: 1,
        area: 500,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1630699144867-37acec97df5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560448075-57d0285fc478?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R004",
        title: "Luxury Penthouse with Terrace",
        description: "Stunning penthouse featuring panoramic city views, private terrace, high-end finishes, and premium building amenities including pool and gym.",
        price: 5000,
        location: "Miami, FL",
        address: "1000 Ocean Dr, Miami, FL 33139",
        beds: 3,
        baths: 3.5,
        area: 2800,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1594741158104-971a385d7ded?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R005",
        title: "Furnished Apartment Near Metro",
        description: "Convenient and comfortable 2-bedroom apartment within walking distance to metro station. Fully furnished with modern amenities.",
        price: 1650,
        location: "Washington, DC",
        address: "234 Metro Ave, Washington, DC 20001",
        beds: 2,
        baths: 1,
        area: 950,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1577052794934-0755a8ce8cfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R006",
        title: "Riverside Apartment with Balcony",
        description: "Beautiful apartment overlooking the river with private balcony, modern finishes, and in-unit laundry. Close to restaurants and shops.",
        price: 2100,
        location: "Portland, OR",
        address: "567 Riverside Dr, Portland, OR 97201",
        beds: 2,
        baths: 2,
        area: 1100,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1565182999561-18d7dc61c393?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R007",
        title: "Modern Villa with Pool",
        description: "Luxurious villa with private pool, spacious living areas, gourmet kitchen, and beautifully landscaped garden. Perfect for entertaining.",
        price: 4500,
        location: "Los Angeles, CA",
        address: "890 Beverly Blvd, Los Angeles, CA 90048",
        beds: 5,
        baths: 4.5,
        area: 3800,
        propertyType: "Villa",
        type: "rent",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-R008",
        title: "Bachelor's Studio Apartment",
        description: "Compact and efficient studio apartment with modern furnishings, high-speed internet, and all utilities included. Ideal for singles.",
        price: 850,
        location: "Seattle, WA",
        address: "123 Downtown St, Seattle, WA 98101",
        beds: 1,
        baths: 1,
        area: 450,
        propertyType: "Apartment",
        type: "rent",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560448075-cae9f775244d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      }
    ];
    
    // Define properties for sale with MDP-B prefix
    const saleProperties = [
      {
        propertyNumber: "MDP-B001",
        title: "Luxury Apartment with Sea View",
        description: "Stunning luxury apartment with panoramic sea views, premium finishes, and access to exclusive building amenities including pool and spa.",
        price: 1250000,
        location: "Miami, FL",
        address: "789 Ocean Drive, Miami, FL 33139",
        beds: 3,
        baths: 3.5,
        area: 2200,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B002",
        title: "Modern Family Bungalow",
        description: "Spacious single-story bungalow with open floor plan, updated kitchen, large backyard, and attached 2-car garage in a quiet neighborhood.",
        price: 675000,
        location: "Austin, TX",
        address: "456 Woodland Drive, Austin, TX 78703",
        beds: 4,
        baths: 3,
        area: 2400,
        propertyType: "House",
        type: "buy",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B003",
        title: "Investment Apartment in Business District",
        description: "Prime investment property in the heart of the business district. Currently leased with excellent rental returns and growth potential.",
        price: 450000,
        location: "Chicago, IL",
        address: "123 Financial St, Chicago, IL 60601",
        beds: 2,
        baths: 2,
        area: 1050,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560448075-57d0285fc478?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B004",
        title: "Penthouse with Private Terrace",
        description: "Exclusive penthouse featuring private terrace, floor-to-ceiling windows, custom finishes, and breathtaking city views from every room.",
        price: 1850000,
        location: "New York, NY",
        address: "555 High Rise Blvd, New York, NY 10022",
        beds: 3,
        baths: 3.5,
        area: 2600,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560185009-5bf9f2849488?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B005",
        title: "First-time Buyer's Apartment",
        description: "Perfect starter home in a well-maintained building with modern updates, secure entry, and convenient location near shops and transport.",
        price: 320000,
        location: "Denver, CO",
        address: "789 Starter St, Denver, CO 80202",
        beds: 1,
        baths: 1,
        area: 750,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560448202-e02f742333c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B006",
        title: "Luxury Villa in Gated Community",
        description: "Spectacular villa in exclusive gated community with chef's kitchen, home theater, wine cellar, infinity pool, and landscaped gardens.",
        price: 3250000,
        location: "Los Angeles, CA",
        address: "123 Luxury Lane, Los Angeles, CA 90210",
        beds: 6,
        baths: 7.5,
        area: 6500,
        propertyType: "Villa",
        type: "buy",
        status: "active",
        featured: true,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      },
      {
        propertyNumber: "MDP-B007",
        title: "Heritage Apartment with Modern Touches",
        description: "Beautifully renovated heritage apartment featuring original architectural details blended with contemporary design and modern conveniences.",
        price: 585000,
        location: "Boston, MA",
        address: "456 Heritage Ave, Boston, MA 02108",
        beds: 2,
        baths: 2,
        area: 1200,
        propertyType: "Apartment",
        type: "buy",
        status: "active",
        featured: false,
        images: JSON.stringify([
          "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1560185009-5bf9f2849488?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400",
          "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"
        ]),
        agentId
      }
    ];
    
    // Insert all properties
    const allProperties = [...rentalProperties, ...saleProperties];
    
    // Check if properties with these numbers already exist
    for (const property of allProperties) {
      const existingProperty = await db.select()
        .from(properties)
        .where({ propertyNumber: property.propertyNumber })
        .limit(1);
      
      if (existingProperty.length === 0) {
        await db.insert(properties).values(property);
        console.log(`Added property: ${property.propertyNumber} - ${property.title}`);
      } else {
        console.log(`Property ${property.propertyNumber} already exists. Skipping.`);
      }
    }
    
    console.log("Successfully added all MDP properties!");
  } catch (error) {
    console.error("Error adding MDP properties:", error);
  }
}

// Run the function
addMDPProperties()
  .then(() => {
    console.log("Script completed successfully.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Script failed:", error);
    process.exit(1);
  });