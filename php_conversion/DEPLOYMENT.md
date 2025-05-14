# My Dream Property - PHP Deployment Guide

This guide provides step-by-step instructions for deploying the PHP version of the My Dream Property website on a GoDaddy shared hosting environment.

## Prerequisites

1. GoDaddy hosting account with:
   - PHP 7.4 or higher
   - MySQL database
   - SSH access (preferred but not required)

2. Access to your current PostgreSQL database for migration

## Deployment Steps

### 1. Database Setup

1. Create a new MySQL database through your GoDaddy cPanel
2. Note your database name, username, and password

### 2. Upload Files

1. Download the PHP version of the application
2. Upload all files to your GoDaddy hosting using FTP or cPanel File Manager
3. Make sure to place files in the public_html directory (or your preferred subdirectory)

### 3. Configure Environment

1. Rename `.env.example` to `.env`
2. Update the database configuration:
   ```
   DB_HOST=localhost
   DB_NAME=your_database_name
   DB_USER=your_database_username
   DB_PASS=your_database_password
   ```
3. Set your email configuration:
   ```
   ADMIN_EMAIL=your_admin_email@example.com
   ```
4. Save the file

### 4. Database Migration

#### Option 1: Using Migration Script (if you have access to PostgreSQL database)

1. Set your PostgreSQL connection details in the `.env` file:
   ```
   PG_HOST=your_postgres_host
   PG_PORT=5432
   PG_DBNAME=your_postgres_dbname
   PG_USER=your_postgres_username
   PG_PASSWORD=your_postgres_password
   ```
2. Navigate to the migration script via your browser:
   ```
   https://yourdomain.com/database/migrate.php
   ```
3. Follow the on-screen instructions to migrate your data

#### Option 2: Fresh Installation

1. Navigate to the installation script via your browser:
   ```
   https://yourdomain.com/install.php
   ```
2. The script will create the necessary database tables
3. An admin user will be created with:
   - Username: admin
   - Password: admin123
4. **Important**: Change the admin password immediately after installation

### 5. Directory Permissions

Ensure these directories have write permissions:
- uploads/
- uploads/properties/
- uploads/agents/

```bash
chmod 755 uploads
chmod 755 uploads/properties
chmod 755 uploads/agents
```

### 6. Final Configuration

1. Update site settings by logging in as admin
2. Test all functionality
3. Set up redirects if you're migrating from an existing site

## Frontend Assets

The application assumes your React frontend has been built and the assets are located in:
- `dist/css/main.css`
- `dist/js/bundle.js`

If you need to rebuild the frontend:

1. Make sure Node.js and npm are installed on your development machine
2. From the original project:
   ```bash
   npm run build
   ```
3. Copy the generated files to the appropriate directories

## Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Verify your database credentials in `.env`
   - Check if your database server is accessible

2. **File Permission Issues**:
   - Ensure upload directories have proper write permissions
   - Check PHP error logs for permission problems

3. **Blank White Screen**:
   - Enable error reporting in PHP:
     ```php
     ini_set('display_errors', 1);
     error_reporting(E_ALL);
     ```
   - Check PHP and server error logs

4. **API Endpoints Not Working**:
   - Ensure mod_rewrite is enabled
   - Verify .htaccess file is uploaded and has proper permissions

### Getting Help

For additional support, please contact:
- Email: support@mydreamproperty.com
- Phone: Your Support Number

## Security Recommendations

1. Change the default admin password immediately after installation
2. Keep PHP and MySQL updated to the latest versions
3. Set up regular database backups
4. Use HTTPS for all connections
5. Remove installation scripts after successful deployment:
   - install.php
   - database/migrate.php

## Post-Deployment Checklist

- [ ] Successfully connected to database
- [ ] Admin can log in and access dashboard
- [ ] Property listings display correctly
- [ ] Property images upload properly
- [ ] Contact forms work correctly
- [ ] Email notifications are sent
- [ ] Website is accessible via HTTPS
- [ ] Mobile responsiveness is working
- [ ] All installation scripts removed or secured