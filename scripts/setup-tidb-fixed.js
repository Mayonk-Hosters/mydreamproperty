// TiDB Cloud setup script with individual statements
import { connect } from '@tidbcloud/serverless';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Individual table creation statements
const createUserTable = `
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255),
  username VARCHAR(255),
  password VARCHAR(255),
  fullName VARCHAR(255),
  profileImage VARCHAR(255),
  isAdmin BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createAgentsTable = `
CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  contactNumber VARCHAR(255),
  image VARCHAR(255) NOT NULL,
  rating FLOAT,
  deals INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createPropertyTypesTable = `
CREATE TABLE IF NOT EXISTS property_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createPropertiesTable = `
CREATE TABLE IF NOT EXISTS properties (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(15, 2) NOT NULL,
  location VARCHAR(255) NOT NULL,
  address VARCHAR(255) NOT NULL,
  beds INT NOT NULL,
  baths INT NOT NULL,
  area DECIMAL(15, 2) NOT NULL,
  propertyType VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'sell',
  status VARCHAR(50) DEFAULT 'active',
  featured BOOLEAN DEFAULT false,
  propertyNumber VARCHAR(255),
  images JSON,
  features JSON,
  agentId INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  yearBuilt INT,
  parking INT,
  map_url TEXT,
  FOREIGN KEY (agentId) REFERENCES agents(id)
);`;

const createContactMessagesTable = `
CREATE TABLE IF NOT EXISTS contact_messages (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  message TEXT NOT NULL,
  subject VARCHAR(255) NOT NULL,
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

const createInquiriesTable = `
CREATE TABLE IF NOT EXISTS inquiries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(255),
  message TEXT NOT NULL,
  propertyId INT NOT NULL,
  userId VARCHAR(255),
  isRead BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (propertyId) REFERENCES properties(id),
  FOREIGN KEY (userId) REFERENCES users(id)
);`;

const createContactInfoTable = `
CREATE TABLE IF NOT EXISTS contact_info (
  id INT AUTO_INCREMENT PRIMARY KEY,
  siteName VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  phone1 VARCHAR(255) NOT NULL,
  phone2 VARCHAR(255),
  email1 VARCHAR(255) NOT NULL,
  email2 VARCHAR(255),
  mapUrl TEXT,
  businessHours JSON,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);`;

const createSessionsTable = `
CREATE TABLE IF NOT EXISTS sessions (
  sid VARCHAR(255) NOT NULL PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);`;

// Seed data statements
const seedPropertyTypes = `
INSERT INTO property_types (name, active) VALUES 
('House', true),
('Apartment', true),
('Condo', true),
('Townhouse', true),
('Land', true);`;

const seedAgents = `
INSERT INTO agents (id, name, title, email, contactNumber, image, rating, deals) VALUES
(1, 'Jessica Williams', 'Luxury Property Specialist', 'jessica@example.com', '+1-555-123-4567', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250', 4.9, 149),
(2, 'Michael Chen', 'Commercial Real Estate Agent', 'michael@example.com', '+1-555-987-6543', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250', 4.7, 87),
(3, 'Sarah Johnson', 'Residential Property Expert', 'sarah@example.com', '+1-555-789-0123', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=250&h=250', 4.8, 132);`;

const seedUsers = `
INSERT INTO users (id, username, password, email, fullName, isAdmin) VALUES 
('admin-1', 'Smileplz004', '$2b$10$4tHWoP1YcgTBHsXQHrgNIOSHsD/zG.UmKQdNbBtf.vEe9zmKzjsNS', 'admin@example.com', 'Admin User', true);`;

const seedProperties = `
INSERT INTO properties (title, description, price, location, address, beds, baths, area, propertyType, type, status, featured, images, agentId) VALUES
('Suburban Family Home', 'This beautiful house features 4 bedrooms, 3 bathrooms, and 2800 square feet of living space. Located in Austin, TX, it offers modern amenities and a great location.', 925000, 'Austin, TX', '789 Suburban Dr, Austin, TX 78701', 4, 3, 2800, 'House', 'sell', 'active', false, '["https://images.unsplash.com/photo-1570129477492-45c003edd2be?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1600210492493-0946911123ea?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 3);`;

const seedMoreProperties = `
INSERT INTO properties (title, description, price, location, address, beds, baths, area, propertyType, type, status, featured, images, agentId) VALUES
('Beachfront Villa', 'This beautiful house features 6 bedrooms, 7 bathrooms, and 8500 square feet of luxury living space. Located in Miami Beach, FL, it offers panoramic ocean views and direct beach access.', 12500000, 'Miami Beach, FL', '123 Ocean Drive, Miami Beach, FL 33139', 6, 7, 8500, 'House', 'sell', 'active', true, '["https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1613545325278-f24b0cae1224?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400","https://images.unsplash.com/photo-1628624747186-a941c476b7ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400"]', 1);`;

async function setupDatabase() {
  try {
    console.log('Setting up TiDB Cloud database...');

    // Connect to TiDB Cloud
    const conn = connect({url: DATABASE_URL});
    console.log('Connected to TiDB Cloud');
    
    // Test connection with a simple query first
    console.log('Testing connection...');
    const testResult = await conn.execute('SELECT 1 as test');
    console.log('Connection test successful:', testResult);
    
    // Execute each statement individually to identify any specific errors
    console.log('Creating tables...');
    
    try {
      console.log('Creating users table...');
      await conn.execute(createUserTable);
      console.log('Users table created successfully');
    } catch (error) {
      console.error('Error creating users table:', error.message);
    }
    
    try {
      console.log('Creating agents table...');
      await conn.execute(createAgentsTable);
      console.log('Agents table created successfully');
    } catch (error) {
      console.error('Error creating agents table:', error.message);
    }
    
    try {
      console.log('Creating property types table...');
      await conn.execute(createPropertyTypesTable);
      console.log('Property types table created successfully');
    } catch (error) {
      console.error('Error creating property types table:', error.message);
    }
    
    try {
      console.log('Creating properties table...');
      await conn.execute(createPropertiesTable);
      console.log('Properties table created successfully');
    } catch (error) {
      console.error('Error creating properties table:', error.message);
    }
    
    try {
      console.log('Creating contact messages table...');
      await conn.execute(createContactMessagesTable);
      console.log('Contact messages table created successfully');
    } catch (error) {
      console.error('Error creating contact messages table:', error.message);
    }
    
    try {
      console.log('Creating inquiries table...');
      await conn.execute(createInquiriesTable);
      console.log('Inquiries table created successfully');
    } catch (error) {
      console.error('Error creating inquiries table:', error.message);
    }
    
    try {
      console.log('Creating contact info table...');
      await conn.execute(createContactInfoTable);
      console.log('Contact info table created successfully');
    } catch (error) {
      console.error('Error creating contact info table:', error.message);
    }
    
    try {
      console.log('Creating sessions table...');
      await conn.execute(createSessionsTable);
      console.log('Sessions table created successfully');
    } catch (error) {
      console.error('Error creating sessions table:', error.message);
    }
    
    // Seed the database if tables were created successfully
    console.log('Seeding database with initial data...');
    
    try {
      console.log('Seeding property types...');
      await conn.execute(seedPropertyTypes);
      console.log('Property types seeded successfully');
    } catch (error) {
      console.error('Error seeding property types:', error.message);
    }
    
    try {
      console.log('Seeding agents...');
      await conn.execute(seedAgents);
      console.log('Agents seeded successfully');
    } catch (error) {
      console.error('Error seeding agents:', error.message);
    }
    
    try {
      console.log('Seeding users...');
      await conn.execute(seedUsers);
      console.log('Users seeded successfully');
    } catch (error) {
      console.error('Error seeding users:', error.message);
    }
    
    try {
      console.log('Seeding properties...');
      await conn.execute(seedProperties);
      console.log('First property seeded successfully');
      
      await conn.execute(seedMoreProperties);
      console.log('Second property seeded successfully');
    } catch (error) {
      console.error('Error seeding properties:', error.message);
    }
    
    console.log('TiDB Cloud database setup completed');
    
  } catch (error) {
    console.error('Error setting up TiDB Cloud database:', error);
    process.exit(1);
  }
}

// Run the setup
setupDatabase();