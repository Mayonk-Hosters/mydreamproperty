# Real Estate Management Platform

A modern, full-stack real estate management platform built with React, Express, and PostgreSQL. Features property listings, user management, admin dashboard, and email notifications.

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Installation

1. **Clone and install dependencies:**
```bash
git clone <repository-url>
cd real-estate-platform
npm install
```

2. **Configure environment:**
```bash
# Copy the environment template
cp .env .env.local

# Edit .env with your actual values:
# - DATABASE_URL: Your PostgreSQL connection string
# - EMAIL_USER/EMAIL_PASS: Gmail credentials for notifications
# - SESSION_SECRET: Random secure string
```

3. **Setup database:**
```bash
npm run db:push
```

4. **Start development server:**
```bash
# Option 1: Using the local runner (recommended)
node run-local.js

# Option 2: Using bash script
./start-local.sh

# Option 3: Direct npm command
npm run dev
```

The application will be available at `http://localhost:5000`

## Environment Variables

Create a `.env` file with these variables:

```env
# Required
DATABASE_URL=postgresql://user:password@localhost:5432/database
SESSION_SECRET=your-secure-random-string

# Optional (for email notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
ADMIN_EMAIL=admin@yourdomain.com

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

## Features

- **Property Management**: Create, edit, and manage property listings
- **User Authentication**: Secure login system with admin/client roles
- **Admin Dashboard**: Complete administrative interface
- **Email Notifications**: Automated email alerts for inquiries
- **Image Uploads**: Property and agent photo management
- **Responsive Design**: Mobile-first, modern UI
- **Search & Filtering**: Advanced property search capabilities

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session management
- **Email**: Nodemailer with Gmail SMTP
- **Build**: Vite, ESBuild

## Project Structure

```
├── client/src/           # React frontend
│   ├── components/       # Reusable UI components
│   ├── pages/           # Page components
│   └── lib/             # Client utilities
├── server/              # Express backend
│   ├── routes.ts        # API endpoints
│   ├── db-storage.ts    # Database operations
│   └── email-service.ts # Email functionality
├── shared/              # Shared types and schemas
└── scripts/             # Database utilities
```

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Apply database schema changes
- `node run-local.js` - Enhanced local development runner

## Database Setup

The application supports PostgreSQL. For local development:

1. **Local PostgreSQL:**
   - Install PostgreSQL
   - Create database and user
   - Update `DATABASE_URL` in `.env`

2. **Cloud Database (Recommended):**
   - Use Neon, Supabase, or similar
   - Get connection string
   - Add to `DATABASE_URL`

## Email Configuration

For email notifications, configure Gmail SMTP:

1. Enable 2-factor authentication on Gmail
2. Generate App Password (Google Account → Security → App passwords)
3. Use App Password in `EMAIL_PASS` (not your regular password)

## Deployment

The application is optimized for deployment on platforms like:
- Replit Deployments
- Vercel
- Railway
- Heroku

Ensure all environment variables are configured in your deployment platform.

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database server status
- Ensure firewall allows connections

### Email Not Working
- Confirm Gmail App Password is correct
- Verify 2FA is enabled on Gmail account
- Check `EMAIL_USER` and `EMAIL_PASS` values

### Port Conflicts
- Change `PORT` in `.env` to different value
- Kill processes using port: `lsof -ti:5000 | xargs kill -9`

## License

MIT License - see LICENSE file for details