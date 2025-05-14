<?php
/**
 * District Model
 * 
 * Handles all operations related to Indian districts in the database
 */
class District {
    // Database connection and table name
    private $conn;
    private $table_name = "districts";
    
    // Object properties
    public $id;
    public $name;
    public $state_id;
    public $created_at;
    public $state_name; // For joined queries
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all districts
     * 
     * @param int $state_id Optional state ID to filter by
     * @return PDOStatement The result set
     */
    public function getAll($state_id = null) {
        $query = "SELECT d.*, s.name as state_name 
                  FROM " . $this->table_name . " d
                  JOIN states s ON d.state_id = s.id";
        
        if ($state_id) {
            $query .= " WHERE d.state_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $state_id);
        } else {
            $query .= " ORDER BY s.name, d.name";
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get district by ID
     * 
     * @param int $id The district ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT d.*, s.name as state_name 
                  FROM " . $this->table_name . " d
                  JOIN states s ON d.state_id = s.id
                  WHERE d.id = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->state_id = $row['state_id'];
            $this->created_at = $row['created_at'];
            $this->state_name = $row['state_name'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new district
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      state_id = :state_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->state_id = htmlspecialchars(strip_tags($this->state_id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":state_id", $this->state_id);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a district
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      state_id = :state_id
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->state_id = htmlspecialchars(strip_tags($this->state_id));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":state_id", $this->state_id);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a district
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        try {
            // Start transaction since we need to handle related talukas deletion
            $this->conn->beginTransaction();
            
            // Delete all related talukas
            $taluka_query = "DELETE FROM talukas WHERE district_id = ?";
            $taluka_stmt = $this->conn->prepare($taluka_query);
            $taluka_stmt->bindParam(1, $this->id);
            $taluka_stmt->execute();
            
            // Delete the district
            $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $this->id);
            $stmt->execute();
            
            // Commit transaction
            $this->conn->commit();
            
            return true;
        } catch (Exception $e) {
            // Rollback transaction on error
            $this->conn->rollBack();
            return false;
        }
    }
    
    /**
     * Check if a district exists by name in a state
     * 
     * @param string $name The district name
     * @param int $state_id The state ID
     * @return bool True if exists, false otherwise
     */
    public function checkExists($name, $state_id) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE name = ? AND state_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $name);
        $stmt->bindParam(2, $state_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }
}
?>