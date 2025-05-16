import { db } from '../server/db';
import { states } from '../shared/schema';

async function addMaharashtraStates() {
  try {
    console.log('Adding Maharashtra states to database...');
    
    const maharashtraStates = [
      'Ahmednagar', 'Akola', 'Amravati', 'Aurangabad', 'Beed', 'Bhandara', 'Buldhana', 
      'Chandrapur', 'Dhule', 'Gadchiroli', 'Gondia', 'Hingoli', 'Jalgaon', 'Jalna', 
      'Kolhapur', 'Latur', 'Mumbai City', 'Mumbai Suburban', 'Nagpur', 'Nanded', 
      'Nandurbar', 'Nashik', 'Parbhani', 'Palghar', 'Pune', 'Raigarh', 'Ratnagiri', 
      'Satara', 'Sindhudurg', 'Solapur', 'Thane', 'Wardha', 'Washim', 'Yavatmal'
    ];
    
    // Check existing states to avoid duplicates
    const existingStatesResult = await db.execute('SELECT name FROM states');
    const existingStateNames = existingStatesResult.rows.map(row => row.name.toLowerCase());
    
    // Filter out states that already exist
    const newStates = maharashtraStates.filter(state => 
      !existingStateNames.includes(state.toLowerCase())
    );
    
    if (newStates.length === 0) {
      console.log('All Maharashtra states already exist in the database.');
      return { success: true, count: 0 };
    }
    
    console.log(`Adding ${newStates.length} new states...`);
    
    // Insert states in batches
    for (const stateName of newStates) {
      try {
        // Create a code from state name (first 3 letters uppercase)
        const stateCode = stateName.slice(0, 3).toUpperCase();
        
        await db.execute(`
          INSERT INTO states (name, code)
          VALUES ('${stateName}', '${stateCode}')
        `);
        console.log(`Added state: ${stateName} (${stateCode})`);
      } catch (error) {
        console.error(`Error adding state ${stateName}:`, error);
      }
    }
    
    console.log('Successfully added Maharashtra states');
    
    return { success: true, count: newStates.length };
  } catch (error) {
    console.error('Error adding Maharashtra states:', error);
    return { success: false, error };
  }
}

addMaharashtraStates().then(() => {
  console.log('Script completed');
  process.exit(0);
}).catch(err => {
  console.error('Script failed:', err);
  process.exit(1);
});