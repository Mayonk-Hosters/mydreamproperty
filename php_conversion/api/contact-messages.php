<?php
/**
 * API Endpoints for Contact Messages
 * 
 * This file handles CRUD operations for contact form messages
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
include_once '../models/ContactMessage.php';
include_once '../includes/auth_check.php';
include_once '../includes/email_service.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create contact message object
$contactMessage = new ContactMessage($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Handle different endpoints
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

// Get all contact messages - requires admin
if ($method === 'GET' && $endpoint === '' && is_admin()) {
    // Get contact messages
    $stmt = $contactMessage->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Contact messages array
        $messages_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create message item
            $message_item = array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "subject" => $subject,
                "message" => $message,
                "isRead" => (bool)$is_read,
                "createdAt" => $created_at
            );
            
            // Push to messages array
            array_push($messages_arr, $message_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show messages data
        echo json_encode($messages_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No messages found
        echo json_encode(array());
    }
}

// Get a single contact message - requires admin
else if ($method === 'GET' && isset($_GET['id']) && is_admin()) {
    // Set message ID from query string
    $contactMessage->id = $_GET['id'];
    
    // Get the message
    if ($contactMessage->getById($contactMessage->id)) {
        // Create message array
        $message_arr = array(
            "id" => $contactMessage->id,
            "name" => $contactMessage->name,
            "email" => $contactMessage->email,
            "subject" => $contactMessage->subject,
            "message" => $contactMessage->message,
            "isRead" => (bool)$contactMessage->is_read,
            "createdAt" => $contactMessage->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($message_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user message does not exist
        echo json_encode(array("message" => "Contact message not found."));
    }
}

// Create a contact message
else if ($method === 'POST' && $endpoint === '') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (
        !empty($data->name) &&
        !empty($data->email) &&
        !empty($data->subject) &&
        !empty($data->message)
    ) {
        // Set contact message values
        $contactMessage->name = $data->name;
        $contactMessage->email = $data->email;
        $contactMessage->subject = $data->subject;
        $contactMessage->message = $data->message;
        $contactMessage->is_read = false;
        
        // Create the contact message
        if ($contactMessage->create()) {
            // Prepare message details for email
            $message_data = [
                'name' => $contactMessage->name,
                'email' => $contactMessage->email,
                'subject' => $contactMessage->subject,
                'message' => $contactMessage->message
            ];
            
            // Send email notification
            send_contact_message_notification($message_data);
            
            // Set response code - 201 created
            http_response_code(201);
            
            // Return the new message
            echo json_encode(array(
                "id" => $contactMessage->id,
                "name" => $contactMessage->name,
                "email" => $contactMessage->email,
                "subject" => $contactMessage->subject,
                "message" => $contactMessage->message,
                "isRead" => false,
                "createdAt" => date('Y-m-d H:i:s')
            ));
        } else {
            // Set response code - 503 service unavailable
            http_response_code(503);
            
            // Tell the user
            echo json_encode(array("message" => "Unable to create contact message."));
        }
    } else {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to create contact message. Data is incomplete."));
    }
}

// Mark contact message as read - requires admin
else if ($method === 'PUT' && $endpoint === 'mark-read' && isset($_GET['id']) && is_admin()) {
    // Set message ID from query string
    $contactMessage->id = $_GET['id'];
    
    // Check if message exists
    if (!$contactMessage->getById($contactMessage->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message not found."));
        exit;
    }
    
    // Mark the message as read
    if ($contactMessage->markAsRead()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message was marked as read."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to mark contact message as read."));
    }
}

// Delete a contact message - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set message ID from query string
    $contactMessage->id = $_GET['id'];
    
    // Check if message exists
    if (!$contactMessage->getById($contactMessage->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message not found."));
        exit;
    }
    
    // Delete the message
    if ($contactMessage->delete()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message was deleted."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to delete contact message."));
    }
}

// Get unread messages count - requires admin
else if ($method === 'GET' && $endpoint === 'unread-count' && is_admin()) {
    // Get unread count
    $count = $contactMessage->countUnread();
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return the count
    echo json_encode(array("count" => $count));
}

// Handle invalid endpoint
else {
    // Set response code - 404 Not found
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "Endpoint not found or access denied."));
}
?>