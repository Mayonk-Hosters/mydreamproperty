<?php
/**
 * Database Migration Script
 * 
 * This script migrates data from the PostgreSQL database to MySQL
 */

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Start timer
$start_time = microtime(true);

// Include database configuration for MySQL
require_once '../config/database.php';

echo "Starting database migration from PostgreSQL to MySQL...\n";

// PostgreSQL connection details (to be filled in)
$pg_host = getenv('PG_HOST') ?: '';
$pg_port = getenv('PG_PORT') ?: '5432';
$pg_dbname = getenv('PG_DBNAME') ?: '';
$pg_user = getenv('PG_USER') ?: '';
$pg_password = getenv('PG_PASSWORD') ?: '';

// Check if PostgreSQL credentials are set
if (empty($pg_host) || empty($pg_dbname) || empty($pg_user)) {
    echo "Error: PostgreSQL connection details not provided!\n";
    echo "Please provide the following environment variables:\n";
    echo "PG_HOST, PG_PORT, PG_DBNAME, PG_USER, PG_PASSWORD\n";
    exit(1);
}

// Establish PostgreSQL connection
try {
    $pg_conn_string = "pgsql:host=$pg_host;port=$pg_port;dbname=$pg_dbname;user=$pg_user;password=$pg_password";
    $pg_conn = new PDO($pg_conn_string);
    $pg_conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Successfully connected to PostgreSQL database.\n";
} catch (PDOException $e) {
    echo "PostgreSQL Connection Error: " . $e->getMessage() . "\n";
    exit(1);
}

// Get MySQL database connection
$db = new Database();
$mysql_conn = $db->getConnection();
echo "Successfully connected to MySQL database.\n";

// Initialize database with schema
try {
    echo "Initializing MySQL database schema...\n";
    $schema_sql = file_get_contents(__DIR__ . '/schema.sql');
    $mysql_conn->exec($schema_sql);
    echo "MySQL schema initialized successfully.\n";
} catch (PDOException $e) {
    echo "Schema initialization error: " . $e->getMessage() . "\n";
    exit(1);
}

// Migration functions
function migrateTable($pg_conn, $mysql_conn, $table_name, $id_column = 'id') {
    echo "Migrating table '$table_name'...\n";
    
    // Get table data from PostgreSQL
    $stmt = $pg_conn->query("SELECT * FROM $table_name ORDER BY $id_column");
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($rows) === 0) {
        echo "No data found in '$table_name'.\n";
        return 0;
    }
    
    // Get column names from first row
    $columns = array_keys($rows[0]);
    $column_list = implode(', ', $columns);
    $placeholder_list = implode(', ', array_fill(0, count($columns), '?'));
    
    // Prepare MySQL insert statement
    $mysql_stmt = $mysql_conn->prepare("INSERT INTO $table_name ($column_list) VALUES ($placeholder_list)");
    
    // Insert each row
    $count = 0;
    foreach ($rows as $row) {
        try {
            $mysql_stmt->execute(array_values($row));
            $count++;
        } catch (PDOException $e) {
            echo "Error inserting row in '$table_name': " . $e->getMessage() . "\n";
            // Continue with next row
        }
    }
    
    echo "Migrated $count rows in '$table_name'.\n";
    return $count;
}

// Start transaction for MySQL
$mysql_conn->beginTransaction();

try {
    // Disable foreign key checks during migration
    $mysql_conn->exec("SET FOREIGN_KEY_CHECKS = 0");
    
    // Migrate users
    $users_count = migrateTable($pg_conn, $mysql_conn, "users");
    
    // Migrate agents
    $agents_count = migrateTable($pg_conn, $mysql_conn, "agents");
    
    // Migrate property_types
    $property_types_count = migrateTable($pg_conn, $mysql_conn, "property_types");
    
    // Migrate properties
    $properties_count = migrateTable($pg_conn, $mysql_conn, "properties");
    
    // Migrate inquiries
    $inquiries_count = migrateTable($pg_conn, $mysql_conn, "inquiries");
    
    // Migrate states
    $states_count = migrateTable($pg_conn, $mysql_conn, "states");
    
    // Migrate districts
    $districts_count = migrateTable($pg_conn, $mysql_conn, "districts");
    
    // Migrate talukas
    $talukas_count = migrateTable($pg_conn, $mysql_conn, "talukas");
    
    // Migrate tehsils
    $tehsils_count = migrateTable($pg_conn, $mysql_conn, "tehsils");
    
    // Migrate contact_info
    $contact_info_count = migrateTable($pg_conn, $mysql_conn, "contact_info");
    
    // Migrate contact_messages
    $contact_messages_count = migrateTable($pg_conn, $mysql_conn, "contact_messages");
    
    // Re-enable foreign key checks
    $mysql_conn->exec("SET FOREIGN_KEY_CHECKS = 1");
    
    // Commit the transaction
    $mysql_conn->commit();
    
    // Display migration summary
    echo "\nMigration Summary:\n";
    echo "==================\n";
    echo "Users: $users_count\n";
    echo "Agents: $agents_count\n";
    echo "Property Types: $property_types_count\n";
    echo "Properties: $properties_count\n";
    echo "Inquiries: $inquiries_count\n";
    echo "States: $states_count\n";
    echo "Districts: $districts_count\n";
    echo "Talukas: $talukas_count\n";
    echo "Tehsils: $tehsils_count\n";
    echo "Contact Info: $contact_info_count\n";
    echo "Contact Messages: $contact_messages_count\n";
    
} catch (Exception $e) {
    // Rollback on error
    $mysql_conn->rollBack();
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

// Display execution time
$execution_time = microtime(true) - $start_time;
echo "\nMigration completed in " . number_format($execution_time, 2) . " seconds.\n";
echo "The database has been successfully migrated from PostgreSQL to MySQL!\n";
?>