// Local development server that bypasses Replit authentication
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// Configure environment
config();

// Set environment variables needed for local development
process.env.REPLIT_DOMAINS = 'localhost';
process.env.NODE_ENV = 'development';
process.env.SESSION_SECRET = 'local-dev-secret';

// Create require function to import the main server file
const require = createRequire(import.meta.url);
require('./server/index.js');