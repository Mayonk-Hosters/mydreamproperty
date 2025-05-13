import { pool } from "../server/db";

async function addSiteNameColumn() {
  try {
    console.log('Adding site_name column to contact_info table...');
    
    // Check if the column already exists
    const checkResult = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'contact_info' 
      AND column_name = 'site_name'
    `);
    
    if (checkResult.rows.length === 0) {
      // Add the column if it doesn't exist
      await pool.query(`
        ALTER TABLE contact_info 
        ADD COLUMN site_name TEXT NOT NULL DEFAULT 'My Dream Property'
      `);
      console.log('Column site_name successfully added to contact_info table');
    } else {
      console.log('Column site_name already exists in contact_info table');
    }
    
    // Insert a default row if the table is empty
    const countResult = await pool.query('SELECT COUNT(*) FROM contact_info');
    if (parseInt(countResult.rows[0].count) === 0) {
      await pool.query(`
        INSERT INTO contact_info 
        (address, phone1, email1, site_name) 
        VALUES 
        ('123 Real Estate St, Mumbai, India', '+91 9876543210', 'info@mydreamproperty.com', 'My Dream Property')
      `);
      console.log('Default contact info inserted');
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await pool.end();
  }
}

addSiteNameColumn();