// This script starts the application using TiDB Cloud database
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Set environment variables for TiDB Cloud
process.env.REPLIT_DOMAINS = 'localhost';
process.env.REPL_ID = 'local-dev';
process.env.NODE_ENV = 'development';
process.env.USE_TIDB = 'true';

// Start the server
import('./server/index.js').catch(err => {
  console.error('Error starting server:', err);
});