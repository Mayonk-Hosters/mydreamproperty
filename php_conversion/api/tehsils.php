<?php
/**
 * API Endpoints for Tehsils
 * 
 * This file handles CRUD operations for Indian tehsils
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
include_once '../models/Tehsil.php';
include_once '../models/Taluka.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create tehsil object
$tehsil = new Tehsil($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all tehsils or filtered by taluka_id
if ($method === 'GET' && empty($_GET['id'])) {
    // Check if taluka_id filter is provided
    $taluka_id = isset($_GET['taluka_id']) ? $_GET['taluka_id'] : null;
    
    // Get tehsils
    $stmt = $tehsil->getAll($taluka_id);
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Tehsils array
        $tehsils_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create tehsil item
            $tehsil_item = array(
                "id" => $id,
                "name" => $name,
                "talukaId" => $taluka_id,
                "talukaName" => $taluka_name,
                "districtId" => $district_id,
                "districtName" => $district_name,
                "stateId" => $state_id,
                "stateName" => $state_name,
                "createdAt" => $created_at
            );
            
            // Push to tehsils array
            array_push($tehsils_arr, $tehsil_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show tehsils data
        echo json_encode($tehsils_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No tehsils found
        echo json_encode(array());
    }
}

// Get tehsil by ID
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set tehsil ID
    $tehsil->id = $_GET['id'];
    
    // Get the tehsil
    if ($tehsil->getById($tehsil->id)) {
        // Create tehsil array
        $tehsil_arr = array(
            "id" => $tehsil->id,
            "name" => $tehsil->name,
            "talukaId" => $tehsil->taluka_id,
            "talukaName" => $tehsil->taluka_name,
            "districtId" => $tehsil->district_id,
            "districtName" => $tehsil->district_name,
            "stateId" => $tehsil->state_id,
            "stateName" => $tehsil->state_name,
            "createdAt" => $tehsil->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($tehsil_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Tehsil not found."));
    }
}

// Create a tehsil - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name) && !empty($data->talukaId)) {
        // Verify taluka exists
        $taluka = new Taluka($db);
        $taluka->id = $data->talukaId;
        
        if (!$taluka->getById($taluka->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid taluka ID."));
            exit;
        }
        
        // Set tehsil values
        $tehsil->name = $data->name;
        $tehsil->taluka_id = $data->talukaId;
        
        // Check if tehsil already exists in this taluka
        if ($tehsil->checkExists($tehsil->name, $tehsil->taluka_id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Tehsil already exists in this taluka."));
            exit;
        }
        
        // Create the tehsil
        if ($tehsil->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new tehsil
            echo json_encode(array(
                "id" => $tehsil->id,
                "name" => $tehsil->name,
                "talukaId" => $tehsil->taluka_id,
                "talukaName" => $taluka->name,
                "districtId" => $taluka->district_id,
                "districtName" => $taluka->district_name,
                "stateId" => $taluka->state_id,
                "stateName" => $taluka->state_name,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create tehsil."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create tehsil. Name and talukaId are required."));
    }
}

// Update a tehsil - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Set tehsil ID
    $tehsil->id = $_GET['id'];
    
    // Check if tehsil exists
    if (!$tehsil->getById($tehsil->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Tehsil not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Store original values for response
    $taluka_name = $tehsil->taluka_name;
    $district_id = $tehsil->district_id;
    $district_name = $tehsil->district_name;
    $state_id = $tehsil->state_id;
    $state_name = $tehsil->state_name;
    
    // Update tehsil values if provided
    if (isset($data->name)) {
        $tehsil->name = $data->name;
    }
    
    if (isset($data->talukaId)) {
        // Verify taluka exists
        $taluka = new Taluka($db);
        $taluka->id = $data->talukaId;
        
        if (!$taluka->getById($taluka->id)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Invalid taluka ID."));
            exit;
        }
        
        $tehsil->taluka_id = $data->talukaId;
        $taluka_name = $taluka->name;
        $district_id = $taluka->district_id;
        $district_name = $taluka->district_name;
        $state_id = $taluka->state_id;
        $state_name = $taluka->state_name;
    }
    
    // Update the tehsil
    if ($tehsil->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated tehsil
        echo json_encode(array(
            "id" => $tehsil->id,
            "name" => $tehsil->name,
            "talukaId" => $tehsil->taluka_id,
            "talukaName" => $taluka_name,
            "districtId" => $district_id,
            "districtName" => $district_name,
            "stateId" => $state_id,
            "stateName" => $state_name,
            "createdAt" => $tehsil->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update tehsil."));
    }
}

// Delete a tehsil - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set tehsil ID
    $tehsil->id = $_GET['id'];
    
    // Check if tehsil exists
    if (!$tehsil->getById($tehsil->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Tehsil not found."));
        exit;
    }
    
    // Delete the tehsil
    if ($tehsil->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Tehsil was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete tehsil."));
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