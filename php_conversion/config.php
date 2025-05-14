<?php
/**
 * Application Configuration
 * 
 * This file contains the application configuration settings
 */

// Database configuration
define('DB_HOST', 'localhost');        // Database host
define('DB_NAME', 'mydreamproperty');  // Database name
define('DB_USER', 'root');             // Database username
define('DB_PASS', '');                 // Database password

// Application settings
define('SITE_NAME', 'My Dream Property');
define('ADMIN_EMAIL', 'admin@example.com');
define('UPLOADS_DIR', __DIR__ . '/uploads/');
define('SITE_URL', 'http://localhost/mydreamproperty');

// Environment settings
define('APP_ENV', 'development');  // Options: development, production

// Email settings (optional for SMTP configuration if not using mail())
define('SMTP_HOST', '');
define('SMTP_PORT', '587');
define('SMTP_USER', '');
define('SMTP_PASS', '');

// Set this to true after installation is complete
define('INSTALLED', false);

/**
 * Load environment variables from .env file if it exists
 */
function load_env() {
    $env_file = __DIR__ . '/.env';
    if (file_exists($env_file)) {
        $lines = file($env_file, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            // Skip comments
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value);
            
            // Remove quotes if present
            if (strpos($value, '"') === 0 && strrpos($value, '"') === strlen($value) - 1) {
                $value = substr($value, 1, -1);
            }
            
            putenv("$name=$value");
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load environment variables
load_env();
?>