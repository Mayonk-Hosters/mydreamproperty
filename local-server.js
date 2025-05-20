// Local development server that bypasses Replit authentication
require('dotenv').config();

// Set environment variables needed for local development
process.env.REPLIT_DOMAINS = 'localhost';
process.env.NODE_ENV = 'development';
process.env.SESSION_SECRET = 'local-dev-secret';

// Run the server
require('./server/index.js');