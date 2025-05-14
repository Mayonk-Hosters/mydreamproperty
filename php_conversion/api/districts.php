<?php
/**
 * API Endpoints for Districts
 * 
 * This file handles CRUD operations for Indian districts
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
include_once '../models/District.php';
include_once '../models/State.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create district object
$district = new District($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all districts or filtered by state_id
if ($method === 'GET' && empty($_GET['id'])) {
    // Check if state_id filter is provided
    $state_id = isset($_GET['state_id']) ? $_GET['state_id'] : null;
    
    // Get districts
    $stmt = $district->getAll($state_id);
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Districts array
        $districts_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create district item
            $district_item = array(
                "id" => $id,
                "name" => $name,
                "stateId" => $state_id,
                "stateName" => $state_name,
                "createdAt" => $created_at
            );
            
            // Push to districts array
            array_push($districts_arr, $district_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show districts data
        echo json_encode($districts_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No districts found
        echo json_encode(array());
    }
}

// Get district by ID
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set district ID
    $district->id = $_GET['id'];
    
    // Get the district
    if ($district->getById($district->id)) {
        // Create district array
        $district_arr = array(
            "id" => $district->id,
            "name" => $district->name,
            "stateId" => $district->state_id,
            "stateName" => $district->state_name,
            "createdAt" => $district->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($district_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "District not found."));
    }
}

// Create a district - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name) && !empty($data->stateId)) {
        // Verify state exists
        $state = new State($db);
        $state->id = $data->stateId;
        
        if (!$state->getById($state->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid state ID."));
            exit;
        }
        
        // Set district values
        $district->name = $data->name;
        $district->state_id = $data->stateId;
        
        // Check if district already exists in this state
        if ($district->checkExists($district->name, $district->state_id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "District already exists in this state."));
            exit;
        }
        
        // Create the district
        if ($district->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new district
            echo json_encode(array(
                "id" => $district->id,
                "name" => $district->name,
                "stateId" => $district->state_id,
                "stateName" => $state->name,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create district."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create district. Name and stateId are required."));
    }
}

// Update a district - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Set district ID
    $district->id = $_GET['id'];
    
    // Check if district exists
    if (!$district->getById($district->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "District not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Update district values if provided
    if (isset($data->name)) {
        $district->name = $data->name;
    }
    
    if (isset($data->stateId)) {
        // Verify state exists
        $state = new State($db);
        $state->id = $data->stateId;
        
        if (!$state->getById($state->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid state ID."));
            exit;
        }
        
        $district->state_id = $data->stateId;
        $state_name = $state->name;
    } else {
        $state_name = $district->state_name;
    }
    
    // Update the district
    if ($district->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated district
        echo json_encode(array(
            "id" => $district->id,
            "name" => $district->name,
            "stateId" => $district->state_id,
            "stateName" => $state_name,
            "createdAt" => $district->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update district."));
    }
}

// Delete a district - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set district ID
    $district->id = $_GET['id'];
    
    // Check if district exists
    if (!$district->getById($district->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "District not found."));
        exit;
    }
    
    // Delete the district
    if ($district->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "District was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete district."));
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