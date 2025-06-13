#!/bin/bash

# Local Development Startup Script for Real Estate Platform
echo "🏠 Starting Real Estate Platform in Local Development Mode"

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please copy and configure your .env file:"
    echo "cp .env .env.local"
    echo "Then edit .env with your actual configuration values"
    exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if DATABASE_URL is configured
if grep -q "username:password@localhost" .env; then
    echo "⚠️  Please configure your DATABASE_URL in .env file"
    echo "Current placeholder detected. Update it with your actual database credentials."
fi

# Check if email credentials are configured
if grep -q "your-email@gmail.com" .env; then
    echo "⚠️  Email configuration uses placeholder values"
    echo "Update EMAIL_USER and EMAIL_PASS in .env for email functionality"
fi

echo "🚀 Starting development server..."
echo "Application will be available at: http://localhost:5000"
echo ""
echo "To stop the server, press Ctrl+C"
echo ""

# Start the development server
npm run dev