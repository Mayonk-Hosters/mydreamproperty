<?php
/**
 * API Endpoints for States
 * 
 * This file handles CRUD operations for Indian states
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
include_once '../models/State.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create state object
$state = new State($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all states
if ($method === 'GET' && empty($_GET['id'])) {
    $stmt = $state->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // States array
        $states_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create state item
            $state_item = array(
                "id" => $id,
                "name" => $name,
                "code" => $code,
                "createdAt" => $created_at
            );
            
            // Push to states array
            array_push($states_arr, $state_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show states data
        echo json_encode($states_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No states found
        echo json_encode(array());
    }
}

// Get state by ID
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set state ID
    $state->id = $_GET['id'];
    
    // Get the state
    if ($state->getById($state->id)) {
        // Create state array
        $state_arr = array(
            "id" => $state->id,
            "name" => $state->name,
            "code" => $state->code,
            "createdAt" => $state->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($state_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "State not found."));
    }
}

// Create a state - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name)) {
        // Set state values
        $state->name = $data->name;
        $state->code = isset($data->code) ? $data->code : "";
        
        // Create the state
        if ($state->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new state
            echo json_encode(array(
                "id" => $state->id,
                "name" => $state->name,
                "code" => $state->code,
                "createdAt" => $state->created_at
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create state."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create state. Name is required."));
    }
}

// Update a state - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Set state ID
    $state->id = $_GET['id'];
    
    // Check if state exists
    if (!$state->getById($state->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "State not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Update state values if provided
    if (isset($data->name)) {
        $state->name = $data->name;
    }
    
    if (isset($data->code)) {
        $state->code = $data->code;
    }
    
    // Update the state
    if ($state->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated state
        echo json_encode(array(
            "id" => $state->id,
            "name" => $state->name,
            "code" => $state->code,
            "createdAt" => $state->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update state."));
    }
}

// Delete a state - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set state ID
    $state->id = $_GET['id'];
    
    // Check if state exists
    if (!$state->getById($state->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "State not found."));
        exit;
    }
    
    // Delete the state
    if ($state->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "State was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete state."));
    }
}

// Handle invalid endpoint or method
else {
    // Set response code - 404 Not found or 403 Forbidden
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "Endpoint not found or access denied."));
}
?>