<?php
/**
 * API Endpoints for Contact Information
 * 
 * This file handles operations for website contact information
 */

// Start session
session_start();

// Set response headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and models
include_once '../config/database.php';
include_once '../models/ContactInfo.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Create contact info object
$contactInfo = new ContactInfo($db);

// Get the HTTP method
$method = $_SERVER['REQUEST_METHOD'];

// Get contact information
if ($method === 'GET') {
    // Get the contact info
    if ($contactInfo->get()) {
        // Create contact info array
        $contact_info_arr = array(
            "id" => $contactInfo->id,
            "siteName" => $contactInfo->site_name,
            "address" => $contactInfo->address,
            "phone" => $contactInfo->phone,
            "email" => $contactInfo->email,
            "openingHours" => $contactInfo->opening_hours,
            "facebookUrl" => $contactInfo->facebook_url,
            "twitterUrl" => $contactInfo->twitter_url,
            "instagramUrl" => $contactInfo->instagram_url,
            "linkedinUrl" => $contactInfo->linkedin_url,
            "aboutUs" => $contactInfo->about_us,
            "privacyPolicy" => $contactInfo->privacy_policy,
            "termsConditions" => $contactInfo->terms_conditions,
            "updatedAt" => $contactInfo->updated_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Make it json format
        echo json_encode($contact_info_arr);
    } else {
        // Set response code - 404 Not found
        http_response_code(404);
        
        // Tell the user
        echo json_encode(array("message" => "Contact information not found."));
    }
}

// Update contact information - requires admin
else if ($method === 'PUT' && is_admin()) {
    // Get posted data
    $data = json_decode(file_get_contents("php://input"));
    
    // Make sure data is not empty
    if (empty($data)) {
        // Set response code - 400 bad request
        http_response_code(400);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update contact information. Data is empty."));
        exit;
    }
    
    // Get current contact info
    $contactInfo->get();
    
    // Set contact info values from request or keep current values
    $contactInfo->site_name = isset($data->siteName) ? $data->siteName : $contactInfo->site_name;
    $contactInfo->address = isset($data->address) ? $data->address : $contactInfo->address;
    $contactInfo->phone = isset($data->phone) ? $data->phone : $contactInfo->phone;
    $contactInfo->email = isset($data->email) ? $data->email : $contactInfo->email;
    $contactInfo->opening_hours = isset($data->openingHours) ? $data->openingHours : $contactInfo->opening_hours;
    $contactInfo->facebook_url = isset($data->facebookUrl) ? $data->facebookUrl : $contactInfo->facebook_url;
    $contactInfo->twitter_url = isset($data->twitterUrl) ? $data->twitterUrl : $contactInfo->twitter_url;
    $contactInfo->instagram_url = isset($data->instagramUrl) ? $data->instagramUrl : $contactInfo->instagram_url;
    $contactInfo->linkedin_url = isset($data->linkedinUrl) ? $data->linkedinUrl : $contactInfo->linkedin_url;
    $contactInfo->about_us = isset($data->aboutUs) ? $data->aboutUs : $contactInfo->about_us;
    $contactInfo->privacy_policy = isset($data->privacyPolicy) ? $data->privacyPolicy : $contactInfo->privacy_policy;
    $contactInfo->terms_conditions = isset($data->termsConditions) ? $data->termsConditions : $contactInfo->terms_conditions;
    
    // Update the contact info
    if ($contactInfo->update()) {
        // Get updated contact info
        $contactInfo->get();
        
        // Create contact info array
        $contact_info_arr = array(
            "id" => $contactInfo->id,
            "siteName" => $contactInfo->site_name,
            "address" => $contactInfo->address,
            "phone" => $contactInfo->phone,
            "email" => $contactInfo->email,
            "openingHours" => $contactInfo->opening_hours,
            "facebookUrl" => $contactInfo->facebook_url,
            "twitterUrl" => $contactInfo->twitter_url,
            "instagramUrl" => $contactInfo->instagram_url,
            "linkedinUrl" => $contactInfo->linkedin_url,
            "aboutUs" => $contactInfo->about_us,
            "privacyPolicy" => $contactInfo->privacy_policy,
            "termsConditions" => $contactInfo->terms_conditions,
            "updatedAt" => $contactInfo->updated_at
        );
        
        // Set response code - 200 OK
        http_response_code(200);
        
        // Return the updated contact info
        echo json_encode($contact_info_arr);
    } else {
        // Set response code - 503 service unavailable
        http_response_code(503);
        
        // Tell the user
        echo json_encode(array("message" => "Unable to update contact information."));
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