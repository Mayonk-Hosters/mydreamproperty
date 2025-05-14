<?php
/**
 * Application Build Script
 * 
 * This script prepares the PHP application for deployment
 * It copies React build files and organizes the directory structure
 */

echo "=== My Dream Property PHP Build Script ===\n\n";

// Define paths
$sourceDir = dirname(__DIR__);
$phpDir = __DIR__;
$buildDir = $phpDir . '/build';

// Create build directory if it doesn't exist
if (!file_exists($buildDir)) {
    mkdir($buildDir, 0755, true);
    echo "Created build directory\n";
}

// Create required directories
$directories = [
    $buildDir . '/dist',
    $buildDir . '/dist/css',
    $buildDir . '/dist/js',
    $buildDir . '/uploads',
    $buildDir . '/uploads/properties',
    $buildDir . '/uploads/agents',
];

foreach ($directories as $dir) {
    if (!file_exists($dir)) {
        mkdir($dir, 0755, true);
        echo "Created directory: $dir\n";
    }
}

// Copy PHP files
$phpDirs = [
    'api' => 'api',
    'config' => 'config',
    'database' => 'database',
    'includes' => 'includes',
    'models' => 'models',
];

foreach ($phpDirs as $dir => $targetDir) {
    if (file_exists($phpDir . '/' . $dir)) {
        rcopy($phpDir . '/' . $dir, $buildDir . '/' . $targetDir);
        echo "Copied $dir directory\n";
    }
}

// Copy React build if it exists
$reactBuildDir = $sourceDir . '/client/dist';
if (file_exists($reactBuildDir)) {
    // Copy CSS files
    $cssFiles = glob($reactBuildDir . '/assets/*.css');
    foreach ($cssFiles as $cssFile) {
        copy($cssFile, $buildDir . '/dist/css/main.css');
        echo "Copied React CSS files\n";
        break; // Only copy the first CSS file as main.css
    }
    
    // Copy JS files
    $jsFiles = glob($reactBuildDir . '/assets/*.js');
    foreach ($jsFiles as $jsFile) {
        if (strpos($jsFile, 'index') !== false) {
            copy($jsFile, $buildDir . '/dist/js/bundle.js');
            echo "Copied React JS bundle\n";
            break;
        }
    }
    
    // Copy other assets (images, etc.)
    $assetTypes = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'ico'];
    foreach ($assetTypes as $type) {
        $assetFiles = glob($reactBuildDir . '/assets/*.' . $type);
        foreach ($assetFiles as $file) {
            $filename = basename($file);
            copy($file, $buildDir . '/dist/' . $filename);
        }
    }
    
    echo "Copied React build assets\n";
}

// Copy individual files
$files = [
    $phpDir . '/index.php' => $buildDir . '/index.php',
    $phpDir . '/install.php' => $buildDir . '/install.php',
    $phpDir . '/.env.example' => $buildDir . '/.env.example',
    $phpDir . '/DEPLOYMENT.md' => $buildDir . '/DEPLOYMENT.md',
];

foreach ($files as $source => $destination) {
    if (file_exists($source)) {
        copy($source, $destination);
        echo "Copied " . basename($source) . "\n";
    }
}

// Create .htaccess file
$htaccess = <<<EOT
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /
    
    # Allow direct access to actual files and directories
    RewriteCond %{REQUEST_FILENAME} -f [OR]
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]
    
    # Rewrite API requests to index.php
    RewriteRule ^api/(.*)$ index.php [L]
    
    # Rewrite everything else to index.php
    RewriteRule ^ index.php [L]
</IfModule>

# PHP settings
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
</IfModule>

# Disable directory listing
Options -Indexes

# Set default character set
AddDefaultCharset UTF-8

# Deny access to sensitive files
<FilesMatch "^\.env">
    Order allow,deny
    Deny from all
</FilesMatch>
EOT;

file_put_contents($buildDir . '/.htaccess', $htaccess);
echo "Created .htaccess file\n";

echo "\nBuild completed successfully!\n";
echo "Your application is ready in the 'build' directory.\n";
echo "Follow the instructions in DEPLOYMENT.md to deploy to your hosting.\n";

/**
 * Recursively copy files from one directory to another
 */
function rcopy($src, $dst) {
    if (!file_exists($dst)) {
        mkdir($dst, 0755, true);
    }
    
    $dir = opendir($src);
    while (($file = readdir($dir)) !== false) {
        if ($file != '.' && $file != '..') {
            $srcFile = $src . '/' . $file;
            $dstFile = $dst . '/' . $file;
            
            if (is_dir($srcFile)) {
                rcopy($srcFile, $dstFile);
            } else {
                copy($srcFile, $dstFile);
            }
        }
    }
    closedir($dir);
}
?>