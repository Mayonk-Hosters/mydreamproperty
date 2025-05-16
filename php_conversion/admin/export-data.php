<?php
// php_conversion/admin/export-data.php - Data export functionality for admin

// Include necessary files
include_once '../includes/admin_check.php';
require_once '../config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Check if export type is specified
if (isset($_GET['export'])) {
    $export_type = $_GET['export'];
    
    if ($export_type === 'inquiries') {
        // Export inquiries data
        // Set headers for Excel download
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="inquiries_' . date('Y-m-d') . '.xls"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Start the Excel file
        echo "<!DOCTYPE html>";
        echo "<html>";
        echo "<head>";
        echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";
        echo "<title>Property Inquiries</title>";
        echo "</head>";
        echo "<body>";
        echo "<table border='1'>";
        
        // Excel headers
        echo "<tr>";
        echo "<th>ID</th>";
        echo "<th>Property</th>";
        echo "<th>Property Number</th>";
        echo "<th>Name</th>";
        echo "<th>Email</th>";
        echo "<th>Mobile</th>";
        echo "<th>Message</th>";
        echo "<th>Date</th>";
        echo "</tr>";
        
        // Get all inquiries
        $query = "SELECT i.*, p.title as property_title, p.property_number 
                  FROM inquiries i 
                  LEFT JOIN properties p ON i.property_id = p.id
                  ORDER BY i.created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        // Excel data rows
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . htmlspecialchars($row['property_title'] ?? 'Unknown') . "</td>";
            echo "<td>" . htmlspecialchars($row['property_number'] ?? 'N/A') . "</td>";
            echo "<td>" . htmlspecialchars($row['name']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['mobile'] ?? 'Not provided') . "</td>";
            echo "<td>" . htmlspecialchars($row['message']) . "</td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($row['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        echo "</body>";
        echo "</html>";
        exit;
    }
    
    elseif ($export_type === 'contacts') {
        // Export contact messages data
        // Set headers for Excel download
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="contact_messages_' . date('Y-m-d') . '.xls"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Start the Excel file
        echo "<!DOCTYPE html>";
        echo "<html>";
        echo "<head>";
        echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";
        echo "<title>Contact Messages</title>";
        echo "</head>";
        echo "<body>";
        echo "<table border='1'>";
        
        // Excel headers
        echo "<tr>";
        echo "<th>ID</th>";
        echo "<th>Name</th>";
        echo "<th>Email</th>";
        echo "<th>Mobile</th>";
        echo "<th>Subject</th>";
        echo "<th>Message</th>";
        echo "<th>Read</th>";
        echo "<th>Date</th>";
        echo "</tr>";
        
        // Get all contact messages
        $query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        // Excel data rows
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . htmlspecialchars($row['name']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['mobile'] ?? 'Not provided') . "</td>";
            echo "<td>" . htmlspecialchars($row['subject']) . "</td>";
            echo "<td>" . htmlspecialchars($row['message']) . "</td>";
            echo "<td>" . ($row['is_read'] ? 'Yes' : 'No') . "</td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($row['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        echo "</body>";
        echo "</html>";
        exit;
    }
    
    elseif ($export_type === 'phone_numbers') {
        // Export phone numbers data
        // Set headers for Excel download
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="phone_numbers_' . date('Y-m-d') . '.xls"');
        header('Pragma: no-cache');
        header('Expires: 0');
        
        // Start the Excel file
        echo "<!DOCTYPE html>";
        echo "<html>";
        echo "<head>";
        echo "<meta http-equiv=\"Content-Type\" content=\"text/html; charset=utf-8\">";
        echo "<title>Phone Numbers</title>";
        echo "</head>";
        echo "<body>";
        echo "<table border='1'>";
        
        // Excel headers
        echo "<tr>";
        echo "<th>Source</th>";
        echo "<th>Name</th>";
        echo "<th>Email</th>";
        echo "<th>Phone Number</th>";
        echo "<th>Date</th>";
        echo "</tr>";
        
        // Get all phone numbers from both inquiries and contact messages
        $query = "
            (SELECT 'Property Inquiry' as source, name, email, mobile as phone, created_at 
             FROM inquiries 
             WHERE mobile IS NOT NULL AND mobile != '')
            UNION ALL
            (SELECT 'Contact Message' as source, name, email, mobile as phone, created_at 
             FROM contact_messages 
             WHERE mobile IS NOT NULL AND mobile != '')
            ORDER BY created_at DESC";
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        // Excel data rows
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['source'] . "</td>";
            echo "<td>" . htmlspecialchars($row['name']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['phone']) . "</td>";
            echo "<td>" . date('Y-m-d H:i', strtotime($row['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
        echo "</body>";
        echo "</html>";
        exit;
    }
    
    else {
        // Invalid export type
        die("Invalid export type specified.");
    }
} else {
    // No export type specified
    die("No export type specified.");
}
?>