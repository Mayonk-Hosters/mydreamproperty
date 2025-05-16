import { db } from '../server/db';
import { faker } from '@faker-js/faker';

async function addPropertiesWithSQL() {
  try {
    console.log('Starting bulk property insertion using SQL...');
    
    // Property Types
    const propertyTypes = ['House', 'Apartment', 'Villa', 'Penthouse', 'Commercial'];
    
    // Get existing agent IDs
    const agentResult = await db.execute('SELECT id FROM agents LIMIT 5');
    const agentIds = agentResult.rows.map(row => Number(row.id));
    
    if (agentIds.length === 0) {
      console.log('Warning: No agents found in database. Creating a default agent...');
      // Insert a default agent if none exist
      const agentResult = await db.execute(`
        INSERT INTO agents (name, title, image, deals, rating)
        VALUES ('Default Agent', 'Real Estate Agent', 'https://placehold.co/200x200/webp?text=Agent', 0, 4)
        RETURNING id
      `);
      agentIds.push(Number(agentResult.rows[0].id));
    }

    // Generate Buy Properties
    for (let i = 0; i < 25; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const price = Math.floor(Math.random() * 10000000) + 3000000; // 3M to 13M price range
      const beds = Math.floor(Math.random() * 4) + 2; // 2-5 beds
      const baths = Math.floor(Math.random() * 3) + 2; // 2-4 baths
      const area = Math.floor(Math.random() * 2000) + 1000; // 1000-3000 sqft
      const featured = Math.random() > 0.7; // 30% chance to be featured
      const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      
      try {
        await db.execute(`
          INSERT INTO properties (
            property_number, title, description, price, location, address, 
            beds, baths, area, property_type, agent_id, type,
            status, featured, images, neighborhood_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
        `, [
          `MDP-B${i + 101}`,
          `${faker.location.city()} ${propertyType} for Sale`,
          faker.lorem.paragraphs(2),
          price,
          faker.location.city(),
          faker.location.streetAddress({ useFullAddress: true }),
          beds,
          baths,
          area,
          propertyType,
          agentId,
          'buy',
          'active',
          featured,
          JSON.stringify([
            "https://placehold.co/600x400/webp?text=Property+Image+1",
            "https://placehold.co/600x400/webp?text=Property+Image+2",
            "https://placehold.co/600x400/webp?text=Property+Image+3"
          ]),
          null // neighborhood_id
        ]);
        
        console.log(`Added buy property #${i + 1} (MDP-B${i + 101})`);
      } catch (error) {
        console.error(`Error adding buy property #${i + 1}:`, error);
      }
    }

    // Generate Rent Properties
    for (let i = 0; i < 25; i++) {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const price = Math.floor(Math.random() * 50000) + 20000; // 20k to 70k monthly rent
      const beds = Math.floor(Math.random() * 3) + 1; // 1-3 beds
      const baths = Math.floor(Math.random() * 2) + 1; // 1-2 baths
      const area = Math.floor(Math.random() * 1000) + 500; // 500-1500 sqft
      const featured = Math.random() > 0.7; // 30% chance to be featured
      const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      
      try {
        await db.execute(`
          INSERT INTO properties (
            property_number, title, description, price, location, address, 
            beds, baths, area, property_type, agent_id, type,
            status, featured, images, neighborhood_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16
          )
        `, [
          `MDP-R${i + 101}`,
          `${faker.location.city()} ${propertyType} for Rent`,
          faker.lorem.paragraphs(2),
          price,
          faker.location.city(),
          faker.location.streetAddress({ useFullAddress: true }),
          beds,
          baths,
          area,
          propertyType,
          agentId,
          'rent',
          'active',
          featured,
          JSON.stringify([
            "https://placehold.co/600x400/webp?text=Property+Image+1",
            "https://placehold.co/600x400/webp?text=Property+Image+2",
            "https://placehold.co/600x400/webp?text=Property+Image+3"
          ]),
          null // neighborhood_id
        ]);
        
        console.log(`Added rent property #${i + 1} (MDP-R${i + 101})`);
      } catch (error) {
        console.error(`Error adding rent property #${i + 1}:`, error);
      }
    }
    
    console.log('Successfully added bulk properties (25 for buying, 25 for renting)');
    
    return { success: true, count: 50 };
  } catch (error) {
    console.error('Error in bulk property insertion:', error);
    return { success: false, error };
  }
}

addPropertiesWithSQL().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});