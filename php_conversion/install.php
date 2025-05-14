<?php
/**
 * Database Installation Script
 * 
 * This script creates the necessary database and tables
 */

// Display all errors for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Include database configuration
include_once 'config/database.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Read the SQL schema file
$sql_file = file_get_contents('database/schema.sql');

// Execute the SQL commands
try {
    $db->exec($sql_file);
    echo "<h1>Database Setup Complete</h1>";
    echo "<p>The database schema has been created successfully.</p>";
    
    // Create admin user
    $query = "INSERT INTO users (username, password, email, is_admin, full_name) 
              VALUES ('admin', :password, 'admin@example.com', 1, 'Administrator')";
              
    $stmt = $db->prepare($query);
    
    // Generate hashed password for admin
    $hashed_password = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt->bindParam(':password', $hashed_password);
    
    if ($stmt->execute()) {
        echo "<p>Admin user created with username 'admin' and password 'admin123'.</p>";
    } else {
        echo "<p>Error creating admin user.</p>";
    }
    
    echo "<p><a href='index.php'>Go to Home Page</a></p>";
} catch (PDOException $e) {
    echo "<h1>Database Setup Error</h1>";
    echo "<p>Error: " . $e->getMessage() . "</p>";
    
    // More detailed error information
    echo "<h2>Error Details</h2>";
    echo "<pre>";
    print_r($db->errorInfo());
    echo "</pre>";
}
?>