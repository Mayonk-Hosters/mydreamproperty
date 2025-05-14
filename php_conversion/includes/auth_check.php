<?php
/**
 * Authentication Check Functions
 * 
 * This file provides authentication-related utility functions
 */

/**
 * Check if a user is authenticated
 * 
 * @return bool True if authenticated, false otherwise
 */
function is_authenticated() {
    return isset($_SESSION['user_id']);
}

/**
 * Check if the authenticated user is an admin
 * 
 * @return bool True if admin, false otherwise
 */
function is_admin() {
    if (!is_authenticated()) {
        return false;
    }
    
    // Get user from database
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/User.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    $user = new User($db);
    if ($user->getById($_SESSION['user_id'])) {
        return (bool)$user->is_admin;
    }
    
    return false;
}

/**
 * Get the current authenticated user
 * 
 * @return User|false User object if authenticated, false otherwise
 */
function get_current_user() {
    if (!is_authenticated()) {
        return false;
    }
    
    // Get user from database
    require_once __DIR__ . '/../config/database.php';
    require_once __DIR__ . '/../models/User.php';
    
    $database = new Database();
    $db = $database->getConnection();
    
    $user = new User($db);
    if ($user->getById($_SESSION['user_id'])) {
        return $user;
    }
    
    return false;
}

/**
 * CORS preflight request handler
 * 
 * This function handles OPTIONS requests for CORS preflight
 */
function handle_preflight() {
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        header("Access-Control-Allow-Origin: *");
        header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
        header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");
        exit;
    }
}
?>