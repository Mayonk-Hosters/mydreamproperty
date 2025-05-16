import { db } from "../server/db";
import { properties } from "../shared/schema";
import { sql } from "drizzle-orm";

/**
 * This script adds MDP prefixed properties directly to the database
 */
async function addMDPProperties() {
  try {
    console.log("Starting to add MDP properties...");
    
    // Check for existing properties with MDP prefix
    const existingMdpProperties = await db.select({count: sql<number>`count(*)`})
      .from(properties)
      .where(sql`property_number LIKE 'MDP%'`);
    
    const count = existingMdpProperties[0]?.count || 0;
    
    if (count > 0) {
      console.log(`Found ${count} existing MDP properties. Clearing them first...`);
      await db.delete(properties).where(sql`property_number LIKE 'MDP%'`);
      console.log("Cleared existing MDP properties.");
    }
    
    // Insert rental properties (MDP-R prefix)
    await db.execute(sql`
      INSERT INTO properties 
        (property_number, title, description, price, location, address, beds, baths, area, property_type, type, status, featured, images, agent_id)
      VALUES
        ('MDP-R001', 'Modern Apartment in Downtown', 'Stylish, fully furnished apartment in the heart of downtown. Features high ceilings, modern appliances, and a spacious balcony with city views.', 1800, 'New York, NY', '123 Downtown Blvd, New York, NY 10001', 2, 2, 1200, 'Apartment', 'rent', 'active', true, '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R002', 'Spacious Family Home', 'Beautiful 4-bedroom home in a family-friendly neighborhood with large backyard, modern kitchen, and close to schools and parks.', 2500, 'Chicago, IL', '456 Family Lane, Chicago, IL 60007', 4, 3, 2400, 'House', 'rent', 'active', false, '["https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R003', 'Cozy Studio Apartment', 'Efficient and stylish studio apartment in a prime location. Perfect for professionals or students with easy access to public transport.', 950, 'Boston, MA', '789 Studio St, Boston, MA 02108', 1, 1, 500, 'Apartment', 'rent', 'active', false, '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1630699144867-37acec97df5a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560448075-57d0285fc478?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R004', 'Luxury Penthouse with Terrace', 'Stunning penthouse featuring panoramic city views, private terrace, high-end finishes, and premium building amenities including pool and gym.', 5000, 'Miami, FL', '1000 Ocean Dr, Miami, FL 33139', 3, 3.5, 2800, 'Apartment', 'rent', 'active', true, '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1594741158104-971a385d7ded?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1522156373667-4c7234bbd804?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R005', 'Furnished Apartment Near Metro', 'Convenient and comfortable 2-bedroom apartment within walking distance to metro station. Fully furnished with modern amenities.', 1650, 'Washington, DC', '234 Metro Ave, Washington, DC 20001', 2, 1, 950, 'Apartment', 'rent', 'active', false, '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1577052794934-0755a8ce8cfd?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R006', 'Riverside Apartment with Balcony', 'Beautiful apartment overlooking the river with private balcony, modern finishes, and in-unit laundry. Close to restaurants and shops.', 2100, 'Portland, OR', '567 Riverside Dr, Portland, OR 97201', 2, 2, 1100, 'Apartment', 'rent', 'active', false, '["https://images.unsplash.com/photo-1565182999561-18d7dc61c393?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1484154218962-a197022b5858?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R007', 'Modern Villa with Pool', 'Luxurious villa with private pool, spacious living areas, gourmet kitchen, and beautifully landscaped garden. Perfect for entertaining.', 4500, 'Los Angeles, CA', '890 Beverly Blvd, Los Angeles, CA 90048', 5, 4.5, 3800, 'Villa', 'rent', 'active', true, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1576941089067-2de3c901e126?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-R008', 'Bachelor's Studio Apartment', 'Compact and efficient studio apartment with modern furnishings, high-speed internet, and all utilities included. Ideal for singles.', 850, 'Seattle, WA', '123 Downtown St, Seattle, WA 98101', 1, 1, 450, 'Apartment', 'rent', 'active', false, '["https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560448075-cae9f775244d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1)
    `);
    
    console.log("Successfully added rental properties (MDP-R prefix)");
    
    // Insert properties for sale (MDP-B prefix)
    await db.execute(sql`
      INSERT INTO properties 
        (property_number, title, description, price, location, address, beds, baths, area, property_type, type, status, featured, images, agent_id)
      VALUES
        ('MDP-B001', 'Luxury Apartment with Sea View', 'Stunning luxury apartment with panoramic sea views, premium finishes, and access to exclusive building amenities including pool and spa.', 1250000, 'Miami, FL', '789 Ocean Drive, Miami, FL 33139', 3, 3.5, 2200, 'Apartment', 'buy', 'active', true, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B002', 'Modern Family Bungalow', 'Spacious single-story bungalow with open floor plan, updated kitchen, large backyard, and attached 2-car garage in a quiet neighborhood.', 675000, 'Austin, TX', '456 Woodland Drive, Austin, TX 78703', 4, 3, 2400, 'House', 'buy', 'active', false, '["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1598228723793-52759bba239c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B003', 'Investment Apartment in Business District', 'Prime investment property in the heart of the business district. Currently leased with excellent rental returns and growth potential.', 450000, 'Chicago, IL', '123 Financial St, Chicago, IL 60601', 2, 2, 1050, 'Apartment', 'buy', 'active', false, '["https://images.unsplash.com/photo-1493809842364-78817add7ffb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560448075-57d0285fc478?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B004', 'Penthouse with Private Terrace', 'Exclusive penthouse featuring private terrace, floor-to-ceiling windows, custom finishes, and breathtaking city views from every room.', 1850000, 'New York, NY', '555 High Rise Blvd, New York, NY 10022', 3, 3.5, 2600, 'Apartment', 'buy', 'active', true, '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560184897-ae75f418493e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560185009-5bf9f2849488?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B005', 'First-time Buyer\'s Apartment', 'Perfect starter home in a well-maintained building with modern updates, secure entry, and convenient location near shops and transport.', 320000, 'Denver, CO', '789 Starter St, Denver, CO 80202', 1, 1, 750, 'Apartment', 'buy', 'active', false, '["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560448202-e02f742333c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B006', 'Luxury Villa in Gated Community', 'Spectacular villa in exclusive gated community with chef\'s kitchen, home theater, wine cellar, infinity pool, and landscaped gardens.', 3250000, 'Los Angeles, CA', '123 Luxury Lane, Los Angeles, CA 90210', 6, 7.5, 6500, 'Villa', 'buy', 'active', true, '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1),
        
        ('MDP-B007', 'Heritage Apartment with Modern Touches', 'Beautifully renovated heritage apartment featuring original architectural details blended with contemporary design and modern conveniences.', 585000, 'Boston, MA', '456 Heritage Ave, Boston, MA 02108', 2, 2, 1200, 'Apartment', 'buy', 'active', false, '["https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1560185009-5bf9f2849488?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400", "https://images.unsplash.com/photo-1600121848594-d8644e57abab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1)
    `);
    
    console.log("Successfully added properties for sale (MDP-B prefix)");
    console.log("Successfully completed adding MDP properties!");
    
    // Count added properties
    const addedProperties = await db.select({count: sql<number>`count(*)`})
      .from(properties)
      .where(sql`property_number LIKE 'MDP%'`);
      
    console.log(`Total MDP properties now in database: ${addedProperties[0]?.count || 0}`);
    
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