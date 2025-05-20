// Simple test script to verify TiDB Cloud connection
import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Connecting to TiDB Cloud...');
    console.log('Using connection string:', DATABASE_URL);
    
    // Connect to TiDB Cloud
    const conn = connect({url: DATABASE_URL});
    
    // Run a simple test query
    console.log('Running test query...');
    const result = await conn.execute('SELECT 1 as test');
    console.log('Connection successful!');
    console.log('Query result:', result);
    
  } catch (error) {
    console.error('Error connecting to TiDB Cloud:', error);
  }
}

// Run the test
testConnection();