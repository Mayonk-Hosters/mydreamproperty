#!/usr/bin/env node

// Local development runner with dotenv support
import dotenv from 'dotenv';
import { spawn } from 'child_process';
import { existsSync } from 'fs';

// Load environment variables from .env file
dotenv.config();

console.log('🏠 Real Estate Platform - Local Development');
console.log('==========================================');

// Check if .env file exists
if (!existsSync('.env')) {
    console.error('❌ .env file not found!');
    console.error('Please create a .env file with your configuration.');
    console.error('See .env file for template.');
    process.exit(1);
}

// Validate critical environment variables
const requiredEnvVars = ['DATABASE_URL', 'SESSION_SECRET'];
const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
    });
    console.error('Please configure these in your .env file.');
    process.exit(1);
}

// Check for placeholder values
const placeholderChecks = [
    { key: 'DATABASE_URL', placeholder: 'username:password@localhost' },
    { key: 'EMAIL_USER', placeholder: 'your-email@gmail.com' },
    { key: 'SESSION_SECRET', placeholder: 'your-super-secret-session-key' }
];

placeholderChecks.forEach(({ key, placeholder }) => {
    if (process.env[key] && process.env[key].includes(placeholder)) {
        console.warn(`⚠️  ${key} contains placeholder values - please update in .env`);
    }
});

console.log('✅ Environment configuration loaded');
console.log(`📍 Server will run on: http://localhost:${process.env.PORT || 5000}`);
console.log('🚀 Starting development server...\n');

// Start the development server with tsx
const server = spawn('npx', ['tsx', 'server/index.ts'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_ENV: 'development' }
});

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    server.kill('SIGINT');
    process.exit(0);
});

server.on('close', (code) => {
    console.log(`\n📋 Development server exited with code ${code}`);
    process.exit(code);
});