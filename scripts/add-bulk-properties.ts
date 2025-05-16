import { db } from '../server/db';
import { properties } from '../shared/schema';
import { faker } from '@faker-js/faker';

async function addBulkProperties() {
  try {
    console.log('Starting bulk property insertion...');
    
    // Property Types
    const propertyTypes = ['House', 'Apartment', 'Villa', 'Penthouse', 'Commercial'];
    
    // Generate properties for purchase
    const buyProperties = Array(25).fill(null).map((_, index) => {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const price = Math.floor(Math.random() * 10000000) + 3000000; // 3M to 13M price range
      const beds = Math.floor(Math.random() * 4) + 2; // 2-5 beds
      const baths = Math.floor(Math.random() * 3) + 2; // 2-4 baths
      const area = Math.floor(Math.random() * 2000) + 1000; // 1000-3000 sqft

      return {
        property_number: `MDP-B${index + 101}`, // MDP-B series for buying
        title: `${faker.location.city()} ${propertyType} for Sale`,
        description: faker.lorem.paragraphs(2),
        price,
        location: faker.location.city(),
        address: faker.location.streetAddress({ useFullAddress: true }),
        beds,
        baths,
        area,
        property_type: propertyType,
        agent_id: Math.floor(Math.random() * 3) + 1, // Random agent ID (1-3)
        type: 'buy',
        status: 'active',
        featured: Math.random() > 0.7, // 30% chance to be featured
        images: [
          "https://placehold.co/600x400/webp?text=Property+Image+1",
          "https://placehold.co/600x400/webp?text=Property+Image+2",
          "https://placehold.co/600x400/webp?text=Property+Image+3"
        ]
      };
    });

    // Generate properties for rent
    const rentProperties = Array(25).fill(null).map((_, index) => {
      const propertyType = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
      const price = Math.floor(Math.random() * 50000) + 20000; // 20k to 70k monthly rent
      const beds = Math.floor(Math.random() * 3) + 1; // 1-3 beds
      const baths = Math.floor(Math.random() * 2) + 1; // 1-2 baths
      const area = Math.floor(Math.random() * 1000) + 500; // 500-1500 sqft

      return {
        property_number: `MDP-R${index + 101}`, // MDP-R series for renting
        title: `${faker.location.city()} ${propertyType} for Rent`,
        description: faker.lorem.paragraphs(2),
        price,
        location: faker.location.city(),
        address: faker.location.streetAddress({ useFullAddress: true }),
        beds,
        baths,
        area,
        property_type: propertyType,
        agent_id: Math.floor(Math.random() * 3) + 1, // Random agent ID (1-3)
        type: 'rent',
        status: 'active',
        featured: Math.random() > 0.7, // 30% chance to be featured
        images: [
          "https://placehold.co/600x400/webp?text=Property+Image+1",
          "https://placehold.co/600x400/webp?text=Property+Image+2",
          "https://placehold.co/600x400/webp?text=Property+Image+3"
        ]
      };
    });

    const allProperties = [...buyProperties, ...rentProperties];
    
    // Insert all properties to database in chunks to avoid overwhelming the database
    const chunkSize = 10;
    for (let i = 0; i < allProperties.length; i += chunkSize) {
      const chunk = allProperties.slice(i, i + chunkSize);
      console.log(`Inserting chunk ${i/chunkSize + 1} (${chunk.length} properties)...`);
      await db.insert(properties).values(chunk);
    }
    
    console.log(`Successfully added ${allProperties.length} properties (25 for buying, 25 for renting)`);
    
    return { success: true, count: allProperties.length };
  } catch (error) {
    console.error('Error adding bulk properties:', error);
    return { success: false, error };
  }
}

addBulkProperties().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});