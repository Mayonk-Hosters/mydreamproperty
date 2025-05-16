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
        // Get source filter if provided
        $source_filter = isset($_GET['source']) ? $_GET['source'] : 'all';
        
        // Get date range if provided
        $date_from = isset($_GET['date_from']) ? $_GET['date_from'] : '';
        $date_to = isset($_GET['date_to']) ? $_GET['date_to'] : '';
        
        // Build filename with filters
        $filename = "phone_numbers";
        if ($source_filter !== 'all') {
            $filename .= "_" . strtolower(str_replace(' ', '_', $source_filter));
        }
        if (!empty($date_from)) {
            $filename .= "_from_" . $date_from;
        }
        if (!empty($date_to)) {
            $filename .= "_to_" . $date_to;
        }
        $filename .= "_" . date('Y-m-d') . ".xls";
        
        // Export phone numbers data
        // Set headers for Excel download
        header('Content-Type: application/vnd.ms-excel');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
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
        if ($source_filter === 'Property Inquiry') {
            echo "<th>Property</th>";
            echo "<th>Property Number</th>";
        } elseif ($source_filter === 'Contact Message') {
            echo "<th>Subject</th>";
        }
        echo "<th>Date</th>";
        echo "</tr>";
        
        // Build query based on filters
        if ($source_filter === 'all') {
            $query = "(SELECT 'Property Inquiry' as source, i.name, i.email, i.mobile as phone, i.created_at, 
                      p.title as property_title, p.property_number, NULL as subject, i.message 
                      FROM inquiries i
                      LEFT JOIN properties p ON i.property_id = p.id
                      WHERE i.mobile IS NOT NULL AND i.mobile != ''";
            
            // Add date filter if provided
            if (!empty($date_from)) {
                $query .= " AND i.created_at >= '$date_from 00:00:00'";
            }
            if (!empty($date_to)) {
                $query .= " AND i.created_at <= '$date_to 23:59:59'";
            }
            
            $query .= ")
                     UNION ALL
                     (SELECT 'Contact Message' as source, name, email, mobile as phone, created_at, 
                      NULL as property_title, NULL as property_number, subject, message
                      FROM contact_messages 
                      WHERE mobile IS NOT NULL AND mobile != ''";
            
            // Add date filter if provided
            if (!empty($date_from)) {
                $query .= " AND created_at >= '$date_from 00:00:00'";
            }
            if (!empty($date_to)) {
                $query .= " AND created_at <= '$date_to 23:59:59'";
            }
            
            $query .= ")
                     ORDER BY created_at DESC";
        } elseif ($source_filter === 'Property Inquiry') {
            $query = "SELECT 'Property Inquiry' as source, i.name, i.email, i.mobile as phone, i.created_at,
                     p.title as property_title, p.property_number, NULL as subject, i.message
                     FROM inquiries i
                     LEFT JOIN properties p ON i.property_id = p.id
                     WHERE i.mobile IS NOT NULL AND i.mobile != ''";
            
            // Add date filter if provided
            if (!empty($date_from)) {
                $query .= " AND i.created_at >= '$date_from 00:00:00'";
            }
            if (!empty($date_to)) {
                $query .= " AND i.created_at <= '$date_to 23:59:59'";
            }
            
            $query .= " ORDER BY i.created_at DESC";
        } elseif ($source_filter === 'Contact Message') {
            $query = "SELECT 'Contact Message' as source, name, email, mobile as phone, created_at,
                     NULL as property_title, NULL as property_number, subject, message
                     FROM contact_messages
                     WHERE mobile IS NOT NULL AND mobile != ''";
            
            // Add date filter if provided
            if (!empty($date_from)) {
                $query .= " AND created_at >= '$date_from 00:00:00'";
            }
            if (!empty($date_to)) {
                $query .= " AND created_at <= '$date_to 23:59:59'";
            }
            
            $query .= " ORDER BY created_at DESC";
        }
        
        $stmt = $db->prepare($query);
        $stmt->execute();
        
        // Excel data rows
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            echo "<tr>";
            echo "<td>" . $row['source'] . "</td>";
            echo "<td>" . htmlspecialchars($row['name']) . "</td>";
            echo "<td>" . htmlspecialchars($row['email']) . "</td>";
            echo "<td>" . htmlspecialchars($row['phone']) . "</td>";
            
            if ($source_filter === 'Property Inquiry') {
                echo "<td>" . htmlspecialchars($row['property_title'] ?? 'Unknown') . "</td>";
                echo "<td>" . htmlspecialchars($row['property_number'] ?? 'N/A') . "</td>";
            } elseif ($source_filter === 'Contact Message') {
                echo "<td>" . htmlspecialchars($row['subject'] ?? 'No Subject') . "</td>";
            } elseif ($source_filter === 'all') {
                if ($row['source'] === 'Property Inquiry') {
                    echo "<td>" . htmlspecialchars($row['property_title'] ?? 'Unknown') . "</td>";
                    echo "<td>" . htmlspecialchars($row['property_number'] ?? 'N/A') . "</td>";
                } else {
                    echo "<td>" . htmlspecialchars($row['subject'] ?? 'No Subject') . "</td>";
                }
            }
            
            echo "<td>" . date('Y-m-d H:i', strtotime($row['created_at'])) . "</td>";
            echo "</tr>";
        }
        
        // Add a summary sheet
        echo "</table>";
        
        // Add summary statistics
        echo "<br><br>";
        echo "<table border='1'>";
        echo "<tr><th colspan='2'>Export Summary</th></tr>";
        echo "<tr><td>Export Date</td><td>" . date('Y-m-d H:i:s') . "</td></tr>";
        echo "<tr><td>Source Filter</td><td>" . $source_filter . "</td></tr>";
        if (!empty($date_from)) {
            echo "<tr><td>From Date</td><td>" . $date_from . "</td></tr>";
        }
        if (!empty($date_to)) {
            echo "<tr><td>To Date</td><td>" . $date_to . "</td></tr>";
        }
        echo "<tr><td>Total Records</td><td>" . $stmt->rowCount() . "</td></tr>";
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