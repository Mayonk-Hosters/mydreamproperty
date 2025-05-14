<?php
/**
 * API Endpoints for Talukas
 * 
 * This file handles CRUD operations for Indian talukas
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
include_once '../models/Taluka.php';
include_once '../models/District.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create taluka object
$taluka = new Taluka($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all talukas or filtered by district_id
if ($method === 'GET' && empty($_GET['id'])) {
    // Check if district_id filter is provided
    $district_id = isset($_GET['district_id']) ? $_GET['district_id'] : null;
    
    // Get talukas
    $stmt = $taluka->getAll($district_id);
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Talukas array
        $talukas_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create taluka item
            $taluka_item = array(
                "id" => $id,
                "name" => $name,
                "districtId" => $district_id,
                "districtName" => $district_name,
                "stateId" => $state_id,
                "stateName" => $state_name,
                "createdAt" => $created_at
            );
            
            // Push to talukas array
            array_push($talukas_arr, $taluka_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show talukas data
        echo json_encode($talukas_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No talukas found
        echo json_encode(array());
    }
}

// Get taluka by ID
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set taluka ID
    $taluka->id = $_GET['id'];
    
    // Get the taluka
    if ($taluka->getById($taluka->id)) {
        // Create taluka array
        $taluka_arr = array(
            "id" => $taluka->id,
            "name" => $taluka->name,
            "districtId" => $taluka->district_id,
            "districtName" => $taluka->district_name,
            "stateId" => $taluka->state_id,
            "stateName" => $taluka->state_name,
            "createdAt" => $taluka->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($taluka_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Taluka not found."));
    }
}

// Create a taluka - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name) && !empty($data->districtId)) {
        // Verify district exists
        $district = new District($db);
        $district->id = $data->districtId;
        
        if (!$district->getById($district->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid district ID."));
            exit;
        }
        
        // Set taluka values
        $taluka->name = $data->name;
        $taluka->district_id = $data->districtId;
        
        // Check if taluka already exists in this district
        if ($taluka->checkExists($taluka->name, $taluka->district_id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Taluka already exists in this district."));
            exit;
        }
        
        // Create the taluka
        if ($taluka->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new taluka
            echo json_encode(array(
                "id" => $taluka->id,
                "name" => $taluka->name,
                "districtId" => $taluka->district_id,
                "districtName" => $district->name,
                "stateId" => $district->state_id,
                "stateName" => $district->state_name,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create taluka."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create taluka. Name and districtId are required."));
    }
}

// Update a taluka - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Set taluka ID
    $taluka->id = $_GET['id'];
    
    // Check if taluka exists
    if (!$taluka->getById($taluka->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Taluka not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Store original values for response
    $district_name = $taluka->district_name;
    $state_id = $taluka->state_id;
    $state_name = $taluka->state_name;
    
    // Update taluka values if provided
    if (isset($data->name)) {
        $taluka->name = $data->name;
    }
    
    if (isset($data->districtId)) {
        // Verify district exists
        $district = new District($db);
        $district->id = $data->districtId;
        
        if (!$district->getById($district->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid district ID."));
            exit;
        }
        
        $taluka->district_id = $data->districtId;
        $district_name = $district->name;
        $state_id = $district->state_id;
        $state_name = $district->state_name;
    }
    
    // Update the taluka
    if ($taluka->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated taluka
        echo json_encode(array(
            "id" => $taluka->id,
            "name" => $taluka->name,
            "districtId" => $taluka->district_id,
            "districtName" => $district_name,
            "stateId" => $state_id,
            "stateName" => $state_name,
            "createdAt" => $taluka->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update taluka."));
    }
}

// Delete a taluka - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set taluka ID
    $taluka->id = $_GET['id'];
    
    // Check if taluka exists
    if (!$taluka->getById($taluka->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Taluka not found."));
        exit;
    }
    
    // Delete the taluka
    if ($taluka->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Taluka was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete taluka."));
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