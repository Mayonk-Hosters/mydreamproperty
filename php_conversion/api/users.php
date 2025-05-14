<?php
/**
 * API Endpoints for Users
 * 
 * This file handles CRUD operations for users
 */

// Start session
session_start();

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and models
include_once '../config/database.php';
include_once '../models/User.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create user object
$user = new User($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all users - requires admin
if ($method === 'GET' && empty($_GET['id']) && is_admin()) {
    $stmt = $user->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Users array
        $users_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create user item
            $user_item = array(
                "id" => $id,
                "username" => $username,
                "email" => $email,
                "fullName" => $full_name,
                "profileImage" => $profile_image,
                "isAdmin" => (bool)$is_admin,
                "createdAt" => $created_at
            );
            
            // Push to users array
            array_push($users_arr, $user_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show users data
        echo json_encode($users_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No users found
        echo json_encode(array());
    }
}

// Get user by ID - requires admin or own user
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set user ID
    $user->id = $_GET['id'];
    
    // Check permissions: admin or own user
    if (!is_admin() && (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != $user->id)) {
        // Set response code - 403 Forbidden
        http_response_code(403);
        
        // Tell the user
        echo json_encode(array("message" => "Access denied."));
        exit;
    }
    
    // Get the user
    if ($user->getById($user->id)) {
        // Create user array
        $user_arr = array(
            "id" => $user->id,
            "username" => $user->username,
            "email" => $user->email,
            "fullName" => $user->full_name,
            "profileImage" => $user->profile_image,
            "isAdmin" => (bool)$user->is_admin,
            "createdAt" => $user->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($user_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "User not found."));
    }
}

// Create a user - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->username) &&
        !empty($data->password) &&
        !empty($data->email)
    ) {
        // Check if username already exists
        if ($user->checkUsernameExists($data->username)) {
            // Set response code - 400 Bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Username already exists."));
            exit;
        }
        
        // Set user values
        $user->username = $data->username;
        $user->password = $data->password; // This will be hashed in the model
        $user->email = $data->email;
        $user->full_name = isset($data->fullName) ? $data->fullName : "";
        $user->profile_image = isset($data->profileImage) ? $data->profileImage : "";
        $user->is_admin = isset($data->isAdmin) ? $data->isAdmin : false;
        
        // Create the user
        if ($user->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new user
            echo json_encode(array(
                "id" => $user->id,
                "username" => $user->username,
                "email" => $user->email,
                "fullName" => $user->full_name,
                "profileImage" => $user->profile_image,
                "isAdmin" => (bool)$user->is_admin,
                "createdAt" => $user->created_at
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

// Update a user - requires admin or own user
else if ($method === 'PUT' && isset($_GET['id'])) {
    // Set user ID
    $user->id = $_GET['id'];
    
    // Check permissions: admin or own user
    if (!is_admin() && (!isset($_SESSION['user_id']) || $_SESSION['user_id'] != $user->id)) {
        // Set response code - 403 Forbidden
        http_response_code(403);
        
        // Tell the user
        echo json_encode(array("message" => "Access denied."));
        exit;
    }
    
    // Check if user exists
    if (!$user->getById($user->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "User not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Only admin can change isAdmin status
    if (isset($data->isAdmin) && !is_admin()) {
        // Set response code - 403 Forbidden
        http_response_code(403);
        
        // Tell the user
        echo json_encode(array("message" => "Access denied. Only admins can change admin status."));
        exit;
    }
    
    // Update user values if provided
    if (isset($data->username)) {
        // Check if new username already exists and it's not this user's username
        if ($data->username !== $user->username && $user->checkUsernameExists($data->username)) {
            // Set response code - 400 Bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Username already exists."));
            exit;
        }
        $user->username = $data->username;
    }
    
    if (isset($data->password)) {
        $user->password = $data->password; // Will be hashed in model
    }
    
    if (isset($data->email)) {
        $user->email = $data->email;
    }
    
    if (isset($data->fullName)) {
        $user->full_name = $data->fullName;
    }
    
    if (isset($data->profileImage)) {
        $user->profile_image = $data->profileImage;
    }
    
    if (isset($data->isAdmin) && is_admin()) {
        $user->is_admin = $data->isAdmin;
    }
    
    // Update the user
    if ($user->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated user
        echo json_encode(array(
            "id" => $user->id,
            "username" => $user->username,
            "email" => $user->email,
            "fullName" => $user->full_name,
            "profileImage" => $user->profile_image,
            "isAdmin" => (bool)$user->is_admin,
            "createdAt" => $user->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update user."));
    }
}

// Delete a user - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set user ID
    $user->id = $_GET['id'];
    
    // Check if user exists
    if (!$user->getById($user->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "User not found."));
        exit;
    }
    
    // Delete the user
    if ($user->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "User was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete user."));
    }
}

// Handle invalid endpoint or method
else {
    // Set response code - 404 Not found or 403 Forbidden
    http_response_code(403);
    
    // Tell the user
    echo json_encode(array("message" => "Access denied or endpoint not found."));
}
?>