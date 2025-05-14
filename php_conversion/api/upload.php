<?php
/**
 * API Endpoint for File Uploads
 * 
 * This file handles file uploads for the application
 */

// Start session
session_start();

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include authentication check
include_once '../includes/auth_check.php';

// Define upload directory
$upload_dir = '../uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0755, true);
}

// Handle file upload - requires admin
if ($_SERVER['REQUEST_METHOD'] === 'POST' && is_admin()) {
    // Check if file was uploaded
    if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
        // Get file details
        $file_name = $_FILES['file']['name'];
        $file_tmp = $_FILES['file']['tmp_name'];
        $file_size = $_FILES['file']['size'];
        $file_type = $_FILES['file']['type'];
        
        // Generate a unique file name to prevent overwriting
        $unique_file_name = uniqid() . '_' . $file_name;
        
        // File upload path
        $upload_path = $upload_dir . $unique_file_name;
        
        // Check file type (only allow images)
        $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($file_type, $allowed_types)) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "Only image files are allowed."));
            exit;
        }
        
        // Check file size (limit to 5MB)
        if ($file_size > 5 * 1024 * 1024) {
            // Set response code - 400 bad request
            http_response_code(400);
            
            // Tell the user
            echo json_encode(array("message" => "File is too large. Maximum size is 5MB."));
            exit;
        }
        
        // Move the uploaded file
        if (move_uploaded_file($file_tmp, $upload_path)) {
            // Create URL for the file
            $file_url = '/uploads/' . $unique_file_name;
            
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the file URL
            echo json_encode(array(
                "url" => $file_url,
                "name" => $file_name,
                "type" => $file_type,
                "size" => $file_size
            ));
        } else {
            // Set response code - 500 internal server error
            http_response_code(500);
            
            // Tell the user
            echo json_encode(array("message" => "Failed to upload file."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "No file was uploaded or an error occurred."));
    }
} else {
    // Set response code - 405 method not allowed or 403 forbidden
    http_response_code($_SERVER['REQUEST_METHOD'] === 'POST' ? 403 : 405);
    
    // Tell the user
    echo json_encode(array("message" => "Method not allowed or access denied."));
}
?>