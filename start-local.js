// This script redirects database access to use MySQL instead of PostgreSQL
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Set environment variables for local development
process.env.REPLIT_DOMAINS = 'localhost';
process.env.REPL_ID = 'local-dev';
process.env.NODE_ENV = 'development';
process.env.USE_MYSQL = 'true';

// Override the db.ts module to use our local database
import('./server/index.js').catch(err => {
  console.error('Error starting server:', err);
});