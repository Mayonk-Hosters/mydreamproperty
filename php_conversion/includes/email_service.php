<?php
/**
 * Email Service
 * 
 * Provides functionality for sending emails
 */

/**
 * Send an email using PHP mail function
 * 
 * @param string $to Recipient email address
 * @param string $subject Email subject
 * @param string $message Email message (HTML)
 * @param array $headers Additional headers
 * @return bool True if email was sent, false otherwise
 */
function send_email($to, $subject, $message, $headers = []) {
    // Set default headers
    $default_headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=utf-8',
        'From: ' . getenv('ADMIN_EMAIL'),
    ];
    
    // Merge with custom headers
    $all_headers = array_merge($default_headers, $headers);
    $header_string = implode("\r\n", $all_headers);
    
    // Send email
    return mail($to, $subject, $message, $header_string);
}

/**
 * Send inquiry notification to admin
 * 
 * @param array $inquiry The inquiry data
 * @param string $propertyTitle The property title
 * @return bool True if email was sent, false otherwise
 */
function send_inquiry_notification($inquiry, $propertyTitle) {
    // Admin email from environment variable or use default
    $admin_email = getenv('ADMIN_EMAIL') ?: 'admin@example.com';
    
    // Email subject
    $subject = "New Property Inquiry: {$propertyTitle}";
    
    // Email message
    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            .inquiry-details { background-color: #f9fafb; padding: 15px; border-radius: 5px; }
            .property-info { margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>New Property Inquiry</h1>
            <p>A new inquiry has been received for <strong>{$propertyTitle}</strong>.</p>
            
            <div class='inquiry-details'>
                <p><strong>Name:</strong> {$inquiry['name']}</p>
                <p><strong>Email:</strong> {$inquiry['email']}</p>
                " . (!empty($inquiry['phone']) ? "<p><strong>Phone:</strong> {$inquiry['phone']}</p>" : "") . "
                <p><strong>Message:</strong> {$inquiry['message']}</p>
                <p><strong>Property ID:</strong> {$inquiry['property_id']}</p>
                " . (!empty($inquiry['property_number']) ? "<p><strong>Property Number:</strong> {$inquiry['property_number']}</p>" : "") . "
                <p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>
            </div>
            
            <div class='footer'>
                <p>This is an automated message from My Dream Property.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Send the email
    return send_email($admin_email, $subject, $message);
}

/**
 * Send contact form message notification to admin
 * 
 * @param array $message The contact message data
 * @return bool True if email was sent, false otherwise
 */
function send_contact_message_notification($message) {
    // Admin email from environment variable or use default
    $admin_email = getenv('ADMIN_EMAIL') ?: 'admin@example.com';
    
    // Email subject
    $subject = "New Contact Form Message: {$message['subject']}";
    
    // Email message
    $email_content = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            h1 { color: #2563eb; }
            .message-details { background-color: #f9fafb; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 30px; font-size: 12px; color: #6b7280; }
        </style>
    </head>
    <body>
        <div class='container'>
            <h1>New Contact Form Message</h1>
            
            <div class='message-details'>
                <p><strong>Name:</strong> {$message['name']}</p>
                <p><strong>Email:</strong> {$message['email']}</p>
                <p><strong>Subject:</strong> {$message['subject']}</p>
                <p><strong>Message:</strong> {$message['message']}</p>
                <p><strong>Date:</strong> " . date('Y-m-d H:i:s') . "</p>
            </div>
            
            <div class='footer'>
                <p>This is an automated message from My Dream Property.</p>
            </div>
        </div>
    </body>
    </html>
    ";
    
    // Send the email
    return send_email($admin_email, $subject, $email_content);
}
?>