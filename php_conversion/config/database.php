<?php
/**
 * Database Connection Configuration
 * 
 * This file establishes connection to the MySQL database
 */

// Include configuration
require_once __DIR__ . '/../config.php';

class Database {
    // Database credentials - loaded from config
    private $host;
    private $db_name;
    private $username;
    private $password;
    private $conn;

    // Constructor
    public function __construct() {
        $this->host = defined('DB_HOST') ? DB_HOST : getenv('DB_HOST');
        $this->db_name = defined('DB_NAME') ? DB_NAME : getenv('DB_NAME');
        $this->username = defined('DB_USER') ? DB_USER : getenv('DB_USER');
        $this->password = defined('DB_PASS') ? DB_PASS : getenv('DB_PASS');
    }

    // Get database connection
    public function getConnection() {
        $this->conn = null;

        try {
            $this->conn = new PDO("mysql:host=" . $this->host . ";dbname=" . $this->db_name, $this->username, $this->password);
            $this->conn->exec("set names utf8");
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        } catch(PDOException $exception) {
            echo "Connection error: " . $exception->getMessage();
        }

        return $this->conn;
    }
}
?>