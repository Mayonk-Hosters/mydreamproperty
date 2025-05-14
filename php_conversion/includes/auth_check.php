<?php
/**
 * Authentication Helper Functions
 * 
 * Provides helper functions for user authentication and authorization
 */

/**
 * Check if a user is logged in
 * 
 * @return bool True if logged in, false otherwise
 */
function is_logged_in() {
    return isset($_SESSION['user_id']);
}

/**
 * Check if a user is an admin
 * 
 * @return bool True if admin, false otherwise
 */
function is_admin() {
    // For development mode, skip admin check
    if (getenv('APP_ENV') === 'development') {
        return true;
    }
    
    return is_logged_in() && isset($_SESSION['is_admin']) && $_SESSION['is_admin'];
}

/**
 * Get current user ID
 * 
 * @return int|null User ID if logged in, null otherwise
 */
function get_current_user_id() {
    return is_logged_in() ? $_SESSION['user_id'] : null;
}

/**
 * Require login for API endpoint
 * 
 * If not logged in, sends 401 response and exits
 */
function require_login() {
    if (!is_logged_in()) {
        // Set response code - 401 Unauthorized
        http_response_code(401);
        
        // Tell the user
        echo json_encode(array("message" => "You must be logged in to access this resource."));
        exit;
    }
}

/**
 * Require admin for API endpoint
 * 
 * If not admin, sends 403 response and exits
 */
function require_admin() {
    if (!is_admin()) {
        // Set response code - 403 Forbidden
        http_response_code(403);
        
        // Tell the user
        echo json_encode(array("message" => "You must be an admin to access this resource."));
        exit;
    }
}
?>