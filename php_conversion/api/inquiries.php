<?php
/**
 * API Endpoints for Inquiries
 * 
 * This file handles CRUD operations for property inquiries
 */

// Start session
session_start();

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and models
include_once '../config/database.php';
include_once '../models/Inquiry.php';
include_once '../models/Property.php';
include_once '../includes/auth_check.php';
include_once '../includes/email_service.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create inquiry object
$inquiry = new Inquiry($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Get all inquiries - requires admin
if ($method === 'GET' && $endpoint === '' && is_admin()) {
    // Get inquiries
    $stmt = $inquiry->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Inquiries array
        $inquiries_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create inquiry item
            $inquiry_item = array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "phone" => $phone,
                "message" => $message,
                "propertyId" => $property_id,
                "userId" => $user_id,
                "createdAt" => $created_at,
                "propertyTitle" => $property_title,
                "propertyNumber" => $property_number
            );
            
            // Push to inquiries array
            array_push($inquiries_arr, $inquiry_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show inquiries data
        echo json_encode($inquiries_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No inquiries found
        echo json_encode(array());
    }
}

// Get a single inquiry - requires admin
else if ($method === 'GET' && isset($_GET['id']) && is_admin()) {
    // Set inquiry ID from query string
    $inquiry->id = $_GET['id'];
    
    // Get the inquiry
    if ($inquiry->getById($inquiry->id)) {
        // Create inquiry array
        $inquiry_arr = array(
            "id" => $inquiry->id,
            "name" => $inquiry->name,
            "email" => $inquiry->email,
            "phone" => $inquiry->phone,
            "message" => $inquiry->message,
            "propertyId" => $inquiry->property_id,
            "userId" => $inquiry->user_id,
            "createdAt" => $inquiry->created_at,
            "propertyTitle" => $inquiry->property_title,
            "propertyNumber" => $inquiry->property_number
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($inquiry_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user inquiry does not exist
        echo json_encode(array("message" => "Inquiry not found."));
    }
}

// Create an inquiry
else if ($method === 'POST' && $endpoint === '') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->name) &&
        !empty($data->email) &&
        !empty($data->message) &&
        !empty($data->propertyId)
    ) {
        // Set inquiry values
        $inquiry->name = $data->name;
        $inquiry->email = $data->email;
        $inquiry->phone = isset($data->phone) ? $data->phone : null;
        $inquiry->message = $data->message;
        $inquiry->property_id = $data->propertyId;
        $inquiry->user_id = get_current_user_id();
        
        // Create the inquiry
        if ($inquiry->create()) {
            // Get property details
            $property = new Property($db);
            $property->id = $inquiry->property_id;
            $property->getById($property->id);
            
            // Prepare inquiry details for email
            $inquiry_data = [
                'name' => $inquiry->name,
                'email' => $inquiry->email,
                'phone' => $inquiry->phone,
                'message' => $inquiry->message,
                'property_id' => $inquiry->property_id,
                'property_number' => $property->property_number
            ];
            
            // Send email notification using email service
            $email_service = new EmailService();
            
            // Prepare property data for email
            $property_data = [
                'title' => $property->title,
                'propertyNumber' => $property->property_number
            ];
            
            // Send email notification
            $email_service->sendInquiryNotification($inquiry_data, $property_data);
            
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new inquiry
            echo json_encode(array(
                "id" => $inquiry->id,
                "name" => $inquiry->name,
                "email" => $inquiry->email,
                "phone" => $inquiry->phone,
                "message" => $inquiry->message,
                "propertyId" => $inquiry->property_id,
                "userId" => $inquiry->user_id,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create inquiry."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create inquiry. Data is incomplete."));
    }
}

// Get inquiries by property ID - requires admin
else if ($method === 'GET' && $endpoint === 'by-property' && isset($_GET['property_id']) && is_admin()) {
    // Get property ID from query string
    $property_id = $_GET['property_id'];
    
    // Get inquiries
    $stmt = $inquiry->getByPropertyId($property_id);
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Inquiries array
        $inquiries_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create inquiry item
            $inquiry_item = array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "phone" => $phone,
                "message" => $message,
                "propertyId" => $property_id,
                "userId" => $user_id,
                "createdAt" => $created_at
            );
            
            // Push to inquiries array
            array_push($inquiries_arr, $inquiry_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show inquiries data
        echo json_encode($inquiries_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No inquiries found
        echo json_encode(array());
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