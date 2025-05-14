<?php
/**
 * API Endpoints for Property Types
 * 
 * This file handles CRUD operations for property types
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
include_once '../models/PropertyType.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create property type object
$propertyType = new PropertyType($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get all property types
if ($method === 'GET' && empty($_GET['id']) && empty($_GET['counts'])) {
    // Get property types
    $stmt = $propertyType->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Property types array
        $property_types_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create property type item
            $property_type_item = array(
                "id" => $id,
                "name" => $name,
                "description" => $description,
                "createdAt" => $created_at
            );
            
            // Push to property types array
            array_push($property_types_arr, $property_type_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show property types data
        echo json_encode($property_types_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No property types found
        echo json_encode(array());
    }
}

// Get property counts by type
else if ($method === 'GET' && isset($_GET['counts']) && $_GET['counts'] === 'by-type') {
    // Get counts by type
    $stmt = $propertyType->getCountsByType();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Counts array
        $counts_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create count item
            $count_item = array(
                "propertyType" => $propertyType,
                "count" => (int)$count
            );
            
            // Push to counts array
            array_push($counts_arr, $count_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show counts data
        echo json_encode($counts_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No counts found
        echo json_encode(array());
    }
}

// Get property type by ID
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set property type ID
    $propertyType->id = $_GET['id'];
    
    // Get the property type
    if ($propertyType->getById($propertyType->id)) {
        // Create property type array
        $property_type_arr = array(
            "id" => $propertyType->id,
            "name" => $propertyType->name,
            "description" => $propertyType->description,
            "createdAt" => $propertyType->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($property_type_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Property type not found."));
    }
}

// Create a property type - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name)) {
        // Set property type values
        $propertyType->name = $data->name;
        $propertyType->description = isset($data->description) ? $data->description : "";
        
        // Check if property type already exists
        if ($propertyType->checkExists($propertyType->name)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Property type already exists."));
            exit;
        }
        
        // Create the property type
        if ($propertyType->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new property type
            echo json_encode(array(
                "id" => $propertyType->id,
                "name" => $propertyType->name,
                "description" => $propertyType->description,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create property type."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create property type. Name is required."));
    }
}

// Update a property type - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Set property type ID
    $propertyType->id = $_GET['id'];
    
    // Check if property type exists
    if (!$propertyType->getById($propertyType->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Property type not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Update property type values if provided
    if (isset($data->name)) {
        $propertyType->name = $data->name;
    }
    
    if (isset($data->description)) {
        $propertyType->description = $data->description;
    }
    
    // Update the property type
    if ($propertyType->update()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated property type
        echo json_encode(array(
            "id" => $propertyType->id,
            "name" => $propertyType->name,
            "description" => $propertyType->description,
            "createdAt" => $propertyType->created_at
        ));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update property type."));
    }
}

// Delete a property type - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set property type ID
    $propertyType->id = $_GET['id'];
    
    // Check if property type exists
    if (!$propertyType->getById($propertyType->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Property type not found."));
        exit;
    }
    
    // Delete the property type
    if ($propertyType->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Property type was deleted."));
    } else {
        // Set response code - 400 Bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete property type. It may be in use by properties."));
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