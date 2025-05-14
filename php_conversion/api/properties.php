<?php
/**
 * API Endpoints for Properties
 * 
 * This file handles CRUD operations for properties
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
include_once '../models/Property.php';
include_once '../models/Agent.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create property object
$property = new Property($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Get all properties or filtered properties
if ($method === 'GET' && $endpoint === '') {
    // Initialize filters array
    $filters = array();
    
    // Apply filters from query string
    if (isset($_GET['type'])) $filters['type'] = $_GET['type'];
    if (isset($_GET['property_type'])) $filters['property_type'] = $_GET['property_type'];
    if (isset($_GET['location'])) $filters['location'] = $_GET['location'];
    if (isset($_GET['min_price'])) $filters['min_price'] = $_GET['min_price'];
    if (isset($_GET['max_price'])) $filters['max_price'] = $_GET['max_price'];
    if (isset($_GET['min_beds'])) $filters['min_beds'] = $_GET['min_beds'];
    if (isset($_GET['min_baths'])) $filters['min_baths'] = $_GET['min_baths'];
    if (isset($_GET['featured'])) $filters['featured'] = $_GET['featured'] === 'true';
    
    // Get properties
    $stmt = $property->getAll($filters);
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Properties array
        $properties_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create property item
            $property_item = array(
                "id" => $id,
                "propertyNumber" => $property_number,
                "title" => $title,
                "description" => $description,
                "price" => $price,
                "location" => $location,
                "address" => $address,
                "beds" => $beds,
                "baths" => $baths,
                "area" => $area,
                "propertyType" => $property_type,
                "type" => $type,
                "status" => $status,
                "featured" => (bool)$featured,
                "images" => json_decode($images),
                "agentId" => $agent_id,
                "createdAt" => $created_at,
                "agent" => array(
                    "name" => $agent_name,
                    "image" => $agent_image,
                    "title" => $agent_title
                )
            );
            
            // Push to properties array
            array_push($properties_arr, $property_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show properties data
        echo json_encode($properties_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No properties found
        echo json_encode(array());
    }
}

// Get counts by property type
else if ($method === 'GET' && $endpoint === 'counts-by-type') {
    // Create agent object
    $agent = new Agent($db);
    
    // Get all agents
    $stmt = $agent->getAll();
    $agent_count = $stmt->rowCount();
    
    // Query all property types
    $query = "SELECT DISTINCT property_type FROM properties";
    $stmt = $db->prepare($query);
    $stmt->execute();
    
    // Counts array
    $counts_arr = array();
    
    // Add agent count
    $counts_arr[] = array(
        "propertyType" => "Agents",
        "count" => $agent_count
    );
    
    // Get counts for each property type
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $property_type = $row['property_type'];
        $count = $property->countByType($property_type);
        
        $counts_arr[] = array(
            "propertyType" => $property_type,
            "count" => $count
        );
    }
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return counts
    echo json_encode($counts_arr);
}

// Get a single property
else if ($method === 'GET' && isset($_GET['id'])) {
    // Set property ID from query string
    $property->id = $_GET['id'];
    
    // Get the property
    if ($property->getById($property->id)) {
        // Create property array
        $property_arr = array(
            "id" => $property->id,
            "propertyNumber" => $property->property_number,
            "title" => $property->title,
            "description" => $property->description,
            "price" => $property->price,
            "location" => $property->location,
            "address" => $property->address,
            "beds" => $property->beds,
            "baths" => $property->baths,
            "area" => $property->area,
            "propertyType" => $property->property_type,
            "type" => $property->type,
            "status" => $property->status,
            "featured" => (bool)$property->featured,
            "images" => $property->images,
            "agentId" => $property->agent_id,
            "createdAt" => $property->created_at,
            "agent" => array(
                "name" => $property->agent_name,
                "image" => $property->agent_image,
                "title" => $property->agent_title
            )
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($property_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user property does not exist
        echo json_encode(array("message" => "Property not found."));
    }
}

// Create a property - requires admin
else if ($method === 'POST' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->title) &&
        !empty($data->description) &&
        !empty($data->price) &&
        !empty($data->location) &&
        !empty($data->address) &&
        !empty($data->beds) &&
        !empty($data->baths) &&
        !empty($data->area) &&
        !empty($data->propertyType) &&
        !empty($data->agentId)
    ) {
        // Generate property number if not provided
        if (empty($data->propertyNumber)) {
            $data->propertyNumber = $property->generatePropertyNumber();
        }
        
        // Set property values
        $property->property_number = $data->propertyNumber;
        $property->title = $data->title;
        $property->description = $data->description;
        $property->price = $data->price;
        $property->location = $data->location;
        $property->address = $data->address;
        $property->beds = $data->beds;
        $property->baths = $data->baths;
        $property->area = $data->area;
        $property->property_type = $data->propertyType;
        $property->type = isset($data->type) ? $data->type : "buy";
        $property->status = isset($data->status) ? $data->status : "active";
        $property->featured = isset($data->featured) ? $data->featured : false;
        $property->images = isset($data->images) ? $data->images : [];
        $property->agent_id = $data->agentId;
        
        // Create the property
        if ($property->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Create agent object to get agent details
            $agent = new Agent($db);
            $agent->id = $property->agent_id;
            $agent->getById($agent->id);
            
            // Return the new property
            echo json_encode(array(
                "id" => $property->id,
                "propertyNumber" => $property->property_number,
                "title" => $property->title,
                "description" => $property->description,
                "price" => $property->price,
                "location" => $property->location,
                "address" => $property->address,
                "beds" => $property->beds,
                "baths" => $property->baths,
                "area" => $property->area,
                "propertyType" => $property->property_type,
                "type" => $property->type,
                "status" => $property->status,
                "featured" => (bool)$property->featured,
                "images" => $property->images,
                "agentId" => $property->agent_id,
                "agent" => array(
                    "name" => $agent->name,
                    "image" => $agent->image,
                    "title" => $agent->title
                )
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create property."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create property. Data is incomplete."));
    }
}

// Update a property - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && is_admin()) {
    // Get property ID from query string
    $property->id = $_GET['id'];
    
    // Check if property exists
    if (!$property->getById($property->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Property not found."));
        exit;
    }
    
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->title) &&
        !empty($data->description) &&
        !empty($data->price) &&
        !empty($data->location) &&
        !empty($data->address) &&
        !empty($data->beds) &&
        !empty($data->baths) &&
        !empty($data->area) &&
        !empty($data->propertyType) &&
        !empty($data->agentId)
    ) {
        // Set property values
        $property->property_number = $data->propertyNumber;
        $property->title = $data->title;
        $property->description = $data->description;
        $property->price = $data->price;
        $property->location = $data->location;
        $property->address = $data->address;
        $property->beds = $data->beds;
        $property->baths = $data->baths;
        $property->area = $data->area;
        $property->property_type = $data->propertyType;
        $property->type = isset($data->type) ? $data->type : "buy";
        $property->status = isset($data->status) ? $data->status : "active";
        $property->featured = isset($data->featured) ? $data->featured : false;
        $property->images = isset($data->images) ? $data->images : [];
        $property->agent_id = $data->agentId;
        
        // Update the property
        if ($property->update()) {
            // Create agent object to get agent details
            $agent = new Agent($db);
            $agent->id = $property->agent_id;
            $agent->getById($agent->id);
            
            // Set response code - 200 OK
            http_response_code(200);
            
            // Return the updated property
            echo json_encode(array(
                "id" => $property->id,
                "propertyNumber" => $property->property_number,
                "title" => $property->title,
                "description" => $property->description,
                "price" => $property->price,
                "location" => $property->location,
                "address" => $property->address,
                "beds" => $property->beds,
                "baths" => $property->baths,
                "area" => $property->area,
                "propertyType" => $property->property_type,
                "type" => $property->type,
                "status" => $property->status,
                "featured" => (bool)$property->featured,
                "images" => $property->images,
                "agentId" => $property->agent_id,
                "agent" => array(
                    "name" => $agent->name,
                    "image" => $agent->image,
                    "title" => $agent->title
                )
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to update property."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update property. Data is incomplete."));
    }
}

// Delete a property - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Get property ID from query string
    $property->id = $_GET['id'];
    
    // Check if property exists
    if (!$property->getById($property->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Property not found."));
        exit;
    }
    
    // Delete the property
    if ($property->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Property was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete property."));
    }
}

// Handle invalid endpoint
else {
    // Set response code - 404 Not found
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "Endpoint not found or access denied."));
}
?>