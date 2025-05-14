<?php
/**
 * Tehsil Model
 * 
 * Handles all operations related to Indian tehsils in the database
 */
class Tehsil {
    // Database connection and table name
    private $conn;
    private $table_name = "tehsils";
    
    // Object properties
    public $id;
    public $name;
    public $taluka_id;
    public $created_at;
    public $taluka_name; // For joined queries
    public $district_id; // For joined queries
    public $district_name; // For joined queries
    public $state_id; // For joined queries
    public $state_name; // For joined queries
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all tehsils
     * 
     * @param int $taluka_id Optional taluka ID to filter by
     * @return PDOStatement The result set
     */
    public function getAll($taluka_id = null) {
        $query = "SELECT te.*, ta.name as taluka_name, d.id as district_id, d.name as district_name, 
                  s.id as state_id, s.name as state_name
                  FROM " . $this->table_name . " te
                  JOIN talukas ta ON te.taluka_id = ta.id
                  JOIN districts d ON ta.district_id = d.id
                  JOIN states s ON d.state_id = s.id";
        
        if ($taluka_id) {
            $query .= " WHERE te.taluka_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $taluka_id);
        } else {
            $query .= " ORDER BY s.name, d.name, ta.name, te.name";
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get tehsil by ID
     * 
     * @param int $id The tehsil ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT te.*, ta.name as taluka_name, d.id as district_id, d.name as district_name, 
                  s.id as state_id, s.name as state_name
                  FROM " . $this->table_name . " te
                  JOIN talukas ta ON te.taluka_id = ta.id
                  JOIN districts d ON ta.district_id = d.id
                  JOIN states s ON d.state_id = s.id
                  WHERE te.id = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->taluka_id = $row['taluka_id'];
            $this->created_at = $row['created_at'];
            $this->taluka_name = $row['taluka_name'];
            $this->district_id = $row['district_id'];
            $this->district_name = $row['district_name'];
            $this->state_id = $row['state_id'];
            $this->state_name = $row['state_name'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new tehsil
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      taluka_id = :taluka_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->taluka_id = htmlspecialchars(strip_tags($this->taluka_id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":taluka_id", $this->taluka_id);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a tehsil
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      taluka_id = :taluka_id
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->taluka_id = htmlspecialchars(strip_tags($this->taluka_id));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":taluka_id", $this->taluka_id);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a tehsil
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Check if a tehsil exists by name in a taluka
     * 
     * @param string $name The tehsil name
     * @param int $taluka_id The taluka ID
     * @return bool True if exists, false otherwise
     */
    public function checkExists($name, $taluka_id) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE name = ? AND taluka_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $name);
        $stmt->bindParam(2, $taluka_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }
}
?>