// Set environment variables before importing the server
process.env.REPLIT_DOMAINS = 'localhost';
process.env.REPL_ID = 'local-dev';
process.env.NODE_ENV = 'development';
process.env.USE_MYSQL = 'true'; // Flag to indicate we want to use MySQL

// Start the server
import('./server/index.js').catch(err => {
  console.error('Error starting server:', err);
});