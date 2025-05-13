import { properties } from '../shared/schema';
import { db } from '../server/db';
import { eq } from 'drizzle-orm';

async function addPropertyNumbers() {
  try {
    console.log('Starting migration: Adding property numbers...');
    
    // Get all properties
    const allProperties = await db.select().from(properties);
    console.log(`Found ${allProperties.length} properties to update`);
    
    // Update each property with a unique MDP-XXX number
    for (let i = 0; i < allProperties.length; i++) {
      const property = allProperties[i];
      
      // Create the property number (MDP-001, MDP-002, etc.)
      const paddedNumber = String(i + 1).padStart(3, '0');
      const propertyNumber = `MDP-${paddedNumber}`;
      
      // Update the property
      console.log(`Updating property ${property.id} with property number ${propertyNumber}`);
      await db.update(properties)
        .set({ propertyNumber })
        .where(eq(properties.id, property.id));
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the migration
addPropertyNumbers();