# My Dream Property - PHP/MySQL Version

This is the PHP/MySQL version of the My Dream Property real estate website, designed to be compatible with standard hosting environments like GoDaddy.

## Requirements

- PHP 7.4 or higher
- MySQL 5.7 or higher
- Composer (for installing dependencies)
- PHPMailer (for email functionality)

## Installation

### 1. Database Setup

1. Create a new MySQL database on your hosting
2. Import the `database/schema.sql` file to create all required tables
3. If migrating from the Node.js version, use the `database/migrate.php` script to transfer data

### 2. Configuration

1. Copy the `.env.example` file to `.env` and update with your settings:

```
# Database Settings
DB_HOST=your_database_host
DB_NAME=your_database_name
DB_USER=your_database_username
DB_PASS=your_database_password

# Email Settings
MAIL_HOST=your_mail_host
MAIL_PORT=587
MAIL_USERNAME=your_mail_username
MAIL_PASSWORD=your_mail_password
MAIL_FROM=your_email@example.com
MAIL_FROM_NAME="My Dream Property"
ADMIN_EMAIL=admin@example.com

# Application Settings
APP_ENV=production
SITE_URL=https://yourdomain.com
```

2. Alternatively, you can directly edit the `config.php` file with your settings

### 3. Dependencies

1. Install required PHP packages:

```bash
composer install
```

2. Make sure the `uploads` directory is writable:

```bash
chmod 755 uploads
```

### 4. Frontend Integration

1. Build the React frontend from the original project:

```bash
cd client
npm run build
```

2. Copy the built files (from `client/dist`) to the `public` directory in the PHP version

### 5. File Structure

```
/
├── api/                  # API endpoints
├── config/               # Configuration files
├── database/             # Database schema and migrations
├── includes/             # Shared functionality 
├── models/               # Database models
├── public/               # Frontend assets (React build)
├── uploads/              # File uploads directory
├── vendor/               # Composer dependencies
├── .env                  # Environment variables
├── config.php            # Main configuration
├── index.php             # Main entry point
└── install.php           # Installation script
```

## Setup for GoDaddy Hosting

1. Upload all files to your GoDaddy hosting via FTP or cPanel
2. Create a new MySQL database in cPanel
3. Set up the `.env` file with your GoDaddy database credentials
4. Make sure the `uploads` directory has write permissions
5. Point your domain to the public directory

## Data Migration

If you need to migrate data from the existing PostgreSQL database:

1. Set up PostgreSQL connection details in `.env`:

```
PG_HOST=your_postgres_host
PG_PORT=5432
PG_DBNAME=your_postgres_database
PG_USER=your_postgres_username
PG_PASSWORD=your_postgres_password
```

2. Run the migration script:

```bash
php database/migrate.php
```

This will transfer all data from PostgreSQL to MySQL.

## Email Configuration

The application uses PHPMailer for sending email notifications. You can configure it to use:

1. SMTP: Provide SMTP details in `.env` (recommended for production)
2. PHP's mail() function: Leave SMTP settings empty to use PHP's built-in mail

## API Endpoints

The PHP version maintains the same API endpoints as the Node.js version:

- `/api/auth` - Authentication (login, register, logout)
- `/api/users` - User management
- `/api/properties` - Property listings
- `/api/agents` - Real estate agents
- `/api/inquiries` - Property inquiries
- `/api/states` - Indian states
- `/api/districts` - Districts
- `/api/talukas` - Talukas
- `/api/tehsils` - Tehsils
- `/api/property-types` - Property types
- `/api/contact-info` - Contact information
- `/api/contact-messages` - Contact form submissions

## Admin Access

By default, development mode allows all admin actions. In production, you'll need to:

1. Create an admin user through the registration page
2. Manually set the `is_admin` flag to `1` in the database for that user
3. Log in with the admin credentials to access admin features

## Troubleshooting

- **Database Connection Issues**: Check your database credentials in `.env` or `config.php`
- **File Upload Problems**: Ensure the `uploads` directory has proper write permissions
- **Email Not Sending**: Verify your email settings and check server logs for more details

---

For any questions or issues, please contact the development team.