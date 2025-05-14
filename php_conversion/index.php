<?php
/**
 * API Router
 * 
 * Routes incoming requests to the appropriate API endpoint
 */

// Set environment
if (!getenv('APP_ENV')) {
    putenv('APP_ENV=development');
}

// Handle CORS preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: *");
    header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
    exit(0);
}

// Parse the URL
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($request_uri, '/');
$path_parts = explode('/', $path);

// Set default API path
$api_path = '';

// Find the 'api' part in the URL
$api_index = array_search('api', $path_parts);
if ($api_index !== false) {
    // Get the API endpoint (next part after 'api')
    if (isset($path_parts[$api_index + 1])) {
        $api_path = $path_parts[$api_index + 1];
    }
    
    // Get additional parameters
    $endpoint = '';
    if (isset($path_parts[$api_index + 2])) {
        $endpoint = $path_parts[$api_index + 2];
    }
    
    // Set query string parameters
    if ($endpoint) {
        $_GET['endpoint'] = $endpoint;
    }
    
    // Handle ID if present
    if (isset($path_parts[$api_index + 3])) {
        $_GET['id'] = $path_parts[$api_index + 3];
    }
}

// Route to appropriate API file
switch ($api_path) {
    case 'auth':
        include_once 'api/auth.php';
        break;
    
    case 'users':
        include_once 'api/users.php';
        break;
    
    case 'properties':
        include_once 'api/properties.php';
        break;
    
    case 'agents':
        include_once 'api/agents.php';
        break;
    
    case 'inquiries':
        include_once 'api/inquiries.php';
        break;
    
    case 'states':
        include_once 'api/states.php';
        break;
    
    case 'districts':
        include_once 'api/districts.php';
        break;
    
    case 'talukas':
        include_once 'api/talukas.php';
        break;
    
    case 'tehsils':
        include_once 'api/tehsils.php';
        break;
    
    case 'property-types':
        include_once 'api/property-types.php';
        break;
    
    case 'contact-info':
        include_once 'api/contact-info.php';
        break;
    
    case 'contact-messages':
        include_once 'api/contact-messages.php';
        break;
    
    default:
        if ($api_path) {
            // Unknown API endpoint
            header("HTTP/1.1 404 Not Found");
            echo json_encode(array("message" => "API endpoint not found."));
        } else {
            // Serve the main index.html file for frontend routes
            include_once 'public/index.html';
        }
        break;
}
?>