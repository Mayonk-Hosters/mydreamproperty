<?php
/**
 * API Endpoints for Authentication
 * 
 * This file handles user registration, login, logout, and session management
 */

// Start session
session_start();

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and user model
include_once '../config/database.php';
include_once '../models/User.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create user object
$user = new User($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Register a new user
if ($method === 'POST' && $endpoint === 'register') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->username) &&
        !empty($data->password) &&
        !empty($data->email)
    ) {
        // Check if username already exists
        if ($user->getByUsername($data->username)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Username already exists."));
            exit;
        }
        
        // Set user property values
        $user->username = $data->username;
        $user->password = User::hashPassword($data->password);
        $user->email = $data->email;
        $user->full_name = isset($data->fullName) ? $data->fullName : null;
        $user->profile_image = isset($data->profileImage) ? $data->profileImage : null;
        $user->is_admin = isset($data->isAdmin) ? $data->isAdmin : false;
        
        // Create the user
        if ($user->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Start session for this user
            $_SESSION['user_id'] = $user->id;
            $_SESSION['username'] = $user->username;
            $_SESSION['is_admin'] = $user->is_admin;
            
            // Return the user data
            echo json_encode(array(
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "fullName" => $user->full_name,
                "profileImage" => $user->profile_image,
                "isAdmin" => $user->is_admin
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create user."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create user. Data is incomplete."));
    }
}

// Login a user
else if ($method === 'POST' && $endpoint === 'login') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->username) &&
        !empty($data->password)
    ) {
        // Get the user by username
        if ($user->getByUsername($data->username)) {
            // Verify password
            if (User::verifyPassword($data->password, $user->password)) {
                // Start session for this user
                $_SESSION['user_id'] = $user->id;
                $_SESSION['username'] = $user->username;
                $_SESSION['is_admin'] = $user->is_admin;
                
                // Set response code - 200 OK
                http_response_code(200);
                
                // Return the user data
                echo json_encode(array(
                    "id" => $user->id,
                    "username" => $user->username,
                    "email" => $user->email,
                    "fullName" => $user->full_name,
                    "profileImage" => $user->profile_image,
                    "isAdmin" => $user->is_admin
                ));
            } else {
                // Set response code - 401 Unauthorized
                http_response_code(401);
                
                // Tell the user
                echo json_encode(array("message" => "Invalid password."));
            }
        } else {
            // Set response code - 401 Unauthorized
            http_response_code(401);
            
            // Tell the user
            echo json_encode(array("message" => "User not found."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to login. Data is incomplete."));
    }
}

// Logout a user
else if ($method === 'POST' && $endpoint === 'logout') {
    // Unset all session variables
    $_SESSION = array();
    
    // Destroy the session
    session_destroy();
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Tell the user
    echo json_encode(array("message" => "User logged out successfully."));
}

// Get current user
else if ($method === 'GET' && $endpoint === 'user') {
    // Check if user is logged in
    if (isset($_SESSION['user_id'])) {
        // Get the user by ID
        if ($user->getById($_SESSION['user_id'])) {
            // Set response code - 200 OK
            http_response_code(200);
            
            // Return the user data
            echo json_encode(array(
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "fullName" => $user->full_name,
                "profileImage" => $user->profile_image,
                "isAdmin" => $user->is_admin
            ));
        } else {
            // Set response code - 404 Not found
            http_response_code(404);
            
            // Tell the user
            echo json_encode(array("message" => "User not found."));
        }
    } else {
        // Set response code - 401 Unauthorized
        http_response_code(401);
        
        // Tell the user
        echo json_encode(array("message" => "Not logged in."));
    }
}

// Handle invalid endpoint
else {
    // Set response code - 404 Not found
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "Endpoint not found."));
}
?>