# Local Development Setup Guide

This guide will help you set up and run the Real Estate Management Platform on your local computer.

## Prerequisites

1. **Node.js** (version 18 or higher)
2. **PostgreSQL** (for database)
3. **Git** (for version control)

## Installation Steps

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd real-estate-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Copy the `.env` file and update it with your local configuration:

```bash
cp .env .env.local
```

Edit `.env` with your actual values:

```env
# Environment Configuration for Local Development
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

### 4. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a new database:
```sql
CREATE DATABASE real_estate_db;
CREATE USER real_estate_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE real_estate_db TO real_estate_user;
```
3. Update your `DATABASE_URL` in `.env`

#### Option B: Cloud Database (Recommended for testing)
- Use services like Neon, Supabase, or PlanetScale
- Get your connection string and add it to `DATABASE_URL`

### 5. Database Migration
```bash
npm run db:push
```

### 6. Email Configuration (Optional)

For email functionality, you'll need Gmail App Password:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. Use this password in `EMAIL_PASS`

## Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at: `http://localhost:5000`

### Production Build
Note: The production build requires both frontend and backend compilation. Due to the large number of dependencies, building may take several minutes.

```bash
# Build frontend and backend (may take 3-5 minutes)
npm run build

# Run production server
npm start
```

If the build times out or fails, use development mode instead:
```bash
npm run dev
```

## Project Structure

```
├── client/               # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/       # Page components
│   │   └── lib/         # Utilities and configurations
├── server/              # Express backend
│   ├── routes.ts        # API routes
│   ├── db-storage.ts    # Database operations
│   └── index.ts         # Server entry point
├── shared/              # Shared schemas and types
│   └── schema.ts        # Database schema definitions
├── scripts/             # Database seeding scripts
└── static/              # Static file uploads
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run check` - Type checking
- `npm run db:push` - Push database schema changes

## Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NODE_ENV` | Environment mode | No | development |
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `EMAIL_HOST` | SMTP host | No | smtp.gmail.com |
| `EMAIL_PORT` | SMTP port | No | 587 |
| `EMAIL_USER` | Email username | No | - |
| `EMAIL_PASS` | Email password/app password | No | - |
| `SESSION_SECRET` | Session encryption key | Yes | - |
| `PORT` | Server port | No | 5000 |
| `HOST` | Server host | No | 0.0.0.0 |

## Troubleshooting

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check firewall settings

### Email Not Working
- Verify Gmail App Password is correct
- Check 2-Factor Authentication is enabled
- Ensure `EMAIL_USER` and `EMAIL_PASS` are set

### Port Already in Use
- Change `PORT` in `.env` to a different value (e.g., 3000, 8000)
- Kill existing processes: `lsof -ti:5000 | xargs kill -9`

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

## Features

- Property listing and management
- User authentication and authorization
- Email notifications
- Image upload and management
- Admin dashboard
- Responsive design
- Real-time property search and filtering

## Development Tips

1. The application uses dotenv for environment management
2. Database schema changes require running `npm run db:push`
3. Frontend changes auto-reload in development mode
4. Backend changes require server restart
5. Static files are served from `/static/uploads/`

## Support

If you encounter issues:
1. Check this guide first
2. Verify environment variables are correctly set
3. Ensure all dependencies are installed
4. Check database connectivity