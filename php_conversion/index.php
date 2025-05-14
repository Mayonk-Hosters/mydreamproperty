<?php
/**
 * Main Entry Point
 * 
 * This file serves the React application and handles API requests
 */

// Start session
session_start();

// Define constants
define('BASE_PATH', __DIR__);
define('API_PATH', BASE_PATH . '/api');

// Handle API requests
if (strpos($_SERVER['REQUEST_URI'], '/api/') === 0) {
    // Get the endpoint from the URL
    $endpoint = substr($_SERVER['REQUEST_URI'], 5);
    $endpoint = strtok($endpoint, '?'); // Remove query string
    $endpoint = rtrim($endpoint, '/');  // Remove trailing slash
    
    // Map endpoint to PHP file
    $mappings = [
        'users' => 'users.php',
        'login' => 'login.php',
        'logout' => 'logout.php',
        'register' => 'register.php',
        'user' => 'user.php',
        'properties' => 'properties.php',
        'properties/counts-by-type' => 'properties-counts.php',
        'property-types' => 'property-types.php',
        'agents' => 'agents.php',
        'inquiries' => 'inquiries.php',
        'contact-info' => 'contact-info.php',
        'contact-messages' => 'contact-messages.php',
        'states' => 'states.php',
        'districts' => 'districts.php',
        'talukas' => 'talukas.php',
        'tehsils' => 'tehsils.php'
    ];
    
    // Check if the endpoint exists in our mappings
    if (isset($mappings[$endpoint])) {
        // Include the API file
        include_once API_PATH . '/' . $mappings[$endpoint];
        exit;
    }
    
    // Dynamic endpoints with IDs
    foreach ($mappings as $base => $file) {
        if (preg_match('#^' . $base . '/(\d+)$#', $endpoint, $matches)) {
            // Set the ID in $_GET
            $_GET['id'] = $matches[1];
            
            // Include the API file
            include_once API_PATH . '/' . $file;
            exit;
        }
    }
    
    // If no matching endpoint found
    header("HTTP/1.1 404 Not Found");
    echo json_encode(['message' => 'API endpoint not found']);
    exit;
}

// Serve the React application for non-API requests
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Dream Property</title>
    
    <!-- Favicon -->
    <link rel="icon" href="favicon.ico" type="image/x-icon">
    
    <!-- Open Graph tags for social sharing -->
    <meta property="og:title" content="My Dream Property - Real Estate Platform">
    <meta property="og:description" content="Find your dream property with our comprehensive real estate platform.">
    <meta property="og:image" content="https://yourdomain.com/images/og-image.jpg">
    <meta property="og:url" content="https://yourdomain.com">
    <meta property="og:type" content="website">
    
    <!-- Meta description -->
    <meta name="description" content="My Dream Property is a comprehensive real estate platform to help you find your perfect property. Browse listings, contact agents, and more.">
    
    <!-- PWA manifest -->
    <link rel="manifest" href="manifest.json">
    
    <!-- SEO-friendly metadata -->
    <meta name="keywords" content="real estate, property, house, apartment, commercial property, land, real estate agent">
    <meta name="author" content="My Dream Property">
    
    <!-- App styles -->
    <link rel="stylesheet" href="dist/css/main.css">
</head>
<body>
    <div id="root"></div>
    
    <!-- React application bundle -->
    <script src="dist/js/bundle.js"></script>
    
    <!-- Inline script to set environment variables -->
    <script>
        window.env = {
            apiUrl: '<?php echo $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST']; ?>'
        };
    </script>
</body>
</html>