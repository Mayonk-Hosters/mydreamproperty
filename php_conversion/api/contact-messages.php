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

// Get all contact messages - requires admin
if ($method === 'GET' && empty($_GET['id']) && empty($_GET['count']) && is_admin()) {
    // Get contact messages
    $stmt = $contactMessage->getAll();
    $num = $stmt->rowCount();
    
    // Check if more than 0 record found
    if ($num > 0) {
        // Contact messages array
        $contact_messages_arr = array();
        
        // Retrieve table contents
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract row
            extract($row);
            
            // Create contact message item
            $contact_message_item = array(
                "id" => $id,
                "name" => $name,
                "email" => $email,
                "phone" => $phone,
                "subject" => $subject,
                "message" => $message,
                "isRead" => (int)$is_read,
                "createdAt" => $created_at
            );
            
            // Push to contact messages array
            array_push($contact_messages_arr, $contact_message_item);
        }
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Show contact messages data
        echo json_encode($contact_messages_arr);
    } else {
        // Set response code - 200 OK
        http_response_code(200);
        
        // No contact messages found
        echo json_encode(array());
    }
}

// Get unread count - requires admin
else if ($method === 'GET' && isset($_GET['count']) && $_GET['count'] === 'unread' && is_admin()) {
    $unread_count = $contactMessage->countUnread();
    
    // Set response code - 200 OK
    http_response_code(200);
    
    // Return count
    echo json_encode(array("unreadCount" => $unread_count));
}

// Get contact message by ID - requires admin
else if ($method === 'GET' && isset($_GET['id']) && is_admin()) {
    // Set contact message ID
    $contactMessage->id = $_GET['id'];
    
    // Get the contact message
    if ($contactMessage->getById($contactMessage->id)) {
        // Create contact message array
        $contact_message_arr = array(
            "id" => $contactMessage->id,
            "name" => $contactMessage->name,
            "email" => $contactMessage->email,
            "phone" => $contactMessage->phone,
            "subject" => $contactMessage->subject,
            "message" => $contactMessage->message,
            "isRead" => (int)$contactMessage->is_read,
            "createdAt" => $contactMessage->created_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($contact_message_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message not found."));
    }
}

// Create contact message - public endpoint
else if ($method === 'POST') {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (!empty($data->name) && !empty($data->email) && !empty($data->message)) {
        // Set contact message values
        $contactMessage->name = $data->name;
        $contactMessage->email = $data->email;
        $contactMessage->phone = isset($data->phone) ? $data->phone : "";
        $contactMessage->subject = isset($data->subject) ? $data->subject : "Contact Form Submission";
        $contactMessage->message = $data->message;
        
        // Create the contact message
        if ($contactMessage->create()) {
            // Set response code - 201 created
            http_response_code(201);
            
            // Send email notification to admin
            $email_service = new EmailService();
            $admin_email = getenv('ADMIN_EMAIL');
            
            if ($admin_email) {
                // Prepare email content
                $subject = "New Contact Form Submission";
                $body = "
                    <h2>New Contact Form Submission</h2>
                    <p><strong>Name:</strong> {$contactMessage->name}</p>
                    <p><strong>Email:</strong> {$contactMessage->email}</p>
                    <p><strong>Phone:</strong> {$contactMessage->phone}</p>
                    <p><strong>Subject:</strong> {$contactMessage->subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>{$contactMessage->message}</p>
                    <hr>
                    <p>You can view this message in your admin panel.</p>
                ";
                
                // Send the email
                $email_service->sendEmail($admin_email, $subject, $body);
            }
            
            // Return success message
            echo json_encode(array("message" => "Contact message was created."));
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
        echo json_encode(array("message" => "Unable to create contact message. Name, email, and message are required."));
    }
}

// Mark message as read - requires admin
else if ($method === 'PUT' && isset($_GET['id']) && isset($_GET['action']) && $_GET['action'] === 'read' && is_admin()) {
    // Set contact message ID
    $contactMessage->id = $_GET['id'];
    
    // Check if contact message exists
    if (!$contactMessage->getById($contactMessage->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message not found."));
        exit;
    }
    
    // Mark as read
    if ($contactMessage->markAsRead()) {
        // Set response code - 200 OK
        http_response_code(200);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message marked as read."));
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to mark contact message as read."));
    }
}

// Delete contact message - requires admin
else if ($method === 'DELETE' && isset($_GET['id']) && is_admin()) {
    // Set contact message ID
    $contactMessage->id = $_GET['id'];
    
    // Check if contact message exists
    if (!$contactMessage->getById($contactMessage->id)) {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact message not found."));
        exit;
    }
    
    // Delete the contact message
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

// Handle invalid endpoint or method
else {
    // Set response code - 404 Not found or 403 Forbidden
    http_response_code(404);
    
    // Tell the user
    echo json_encode(array("message" => "Endpoint not found or access denied."));
}
?>