<?php
/**
 * Email Service
 * 
 * Handles sending emails for various purposes like inquiry notifications
 */

// Include PHPMailer if not already included
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    require_once '../vendor/autoload.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class EmailService {
    // Email configuration
    private $mail_host;
    private $mail_port;
    private $mail_username;
    private $mail_password;
    private $mail_from;
    private $mail_from_name;
    private $admin_email;
    
    // Constructor
    public function __construct() {
        // Get email configuration from environment or constants
        $this->mail_host = defined('MAIL_HOST') ? MAIL_HOST : getenv('MAIL_HOST');
        $this->mail_port = defined('MAIL_PORT') ? MAIL_PORT : getenv('MAIL_PORT');
        $this->mail_username = defined('MAIL_USERNAME') ? MAIL_USERNAME : getenv('MAIL_USERNAME');
        $this->mail_password = defined('MAIL_PASSWORD') ? MAIL_PASSWORD : getenv('MAIL_PASSWORD');
        $this->mail_from = defined('MAIL_FROM') ? MAIL_FROM : getenv('MAIL_FROM');
        $this->mail_from_name = defined('MAIL_FROM_NAME') ? MAIL_FROM_NAME : getenv('MAIL_FROM_NAME');
        $this->admin_email = defined('ADMIN_EMAIL') ? ADMIN_EMAIL : getenv('ADMIN_EMAIL');
    }
    
    /**
     * Send an email
     * 
     * @param string $to Recipient email
     * @param string $subject Email subject
     * @param string $body Email body (HTML)
     * @param string $alt_body Alternative plain text body
     * @return bool True if sent, false otherwise
     */
    public function sendMail($to, $subject, $body, $alt_body = '') {
        // Check if email configuration is set
        if (empty($this->mail_host) || empty($this->mail_username) || empty($this->mail_password)) {
            error_log("Email configuration not set. Check environment variables or constants.");
            return false;
        }
        
        // Create a new PHPMailer instance
        $mail = new PHPMailer(true);
        
        try {
            // Server settings
            if (strtolower($this->mail_host) === 'localhost' || $this->mail_host === '127.0.0.1') {
                // Use PHP's mail function
                $mail->isMail();
            } else {
                // Use SMTP
                $mail->isSMTP();
                $mail->Host = $this->mail_host;
                $mail->SMTPAuth = true;
                $mail->Username = $this->mail_username;
                $mail->Password = $this->mail_password;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = $this->mail_port;
            }
            
            // Recipients
            $mail->setFrom($this->mail_from, $this->mail_from_name);
            $mail->addAddress($to);
            
            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->AltBody = $alt_body ? $alt_body : strip_tags($body);
            
            // Send email
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("Email could not be sent. Mailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
    
    /**
     * Send an inquiry notification to admin
     * 
     * @param array $inquiry Inquiry data
     * @param array $property Property data
     * @return bool True if sent, false otherwise
     */
    public function sendInquiryNotification($inquiry, $property) {
        // Check if admin email is set
        if (empty($this->admin_email)) {
            error_log("Admin email not set. Check environment variables or constants.");
            return false;
        }
        
        // Create email subject
        $subject = "New Property Inquiry: {$property['title']} ({$property['propertyNumber']})";
        
        // Create email body
        $body = "<h2>New Property Inquiry</h2>";
        $body .= "<p><strong>Property:</strong> {$property['title']} ({$property['propertyNumber']})</p>";
        $body .= "<p><strong>From:</strong> {$inquiry['name']}</p>";
        $body .= "<p><strong>Email:</strong> {$inquiry['email']}</p>";
        
        if (!empty($inquiry['phone'])) {
            $body .= "<p><strong>Phone:</strong> {$inquiry['phone']}</p>";
        }
        
        $body .= "<p><strong>Message:</strong></p>";
        $body .= "<p>{$inquiry['message']}</p>";
        $body .= "<hr>";
        $body .= "<p><small>This is an automated notification from My Dream Property.</small></p>";
        
        // Send the email
        return $this->sendMail($this->admin_email, $subject, $body);
    }
    
    /**
     * Send a contact form notification to admin
     * 
     * @param array $message Contact message data
     * @return bool True if sent, false otherwise
     */
    public function sendContactNotification($message) {
        // Check if admin email is set
        if (empty($this->admin_email)) {
            error_log("Admin email not set. Check environment variables or constants.");
            return false;
        }
        
        // Create email subject
        $subject = "New Contact Form Message: {$message['subject']}";
        
        // Create email body
        $body = "<h2>New Contact Form Message</h2>";
        $body .= "<p><strong>From:</strong> {$message['name']}</p>";
        $body .= "<p><strong>Email:</strong> {$message['email']}</p>";
        $body .= "<p><strong>Subject:</strong> {$message['subject']}</p>";
        $body .= "<p><strong>Message:</strong></p>";
        $body .= "<p>{$message['message']}</p>";
        $body .= "<hr>";
        $body .= "<p><small>This is an automated notification from My Dream Property.</small></p>";
        
        // Send the email
        return $this->sendMail($this->admin_email, $subject, $body);
    }
    
    /**
     * Check email configuration
     * 
     * @return bool True if configuration is valid, false otherwise
     */
    public function checkConfig() {
        return !empty($this->mail_host) && 
               !empty($this->mail_username) && 
               !empty($this->mail_password) && 
               !empty($this->mail_from) && 
               !empty($this->admin_email);
    }
}
?>