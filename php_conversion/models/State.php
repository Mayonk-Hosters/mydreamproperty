<?php
/**
 * State Model
 * 
 * Handles all operations related to Indian states in the database
 */
class State {
    // Database connection and table name
    private $conn;
    private $table_name = "states";
    
    // Object properties
    public $id;
    public $name;
    public $code;
    public $created_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all states
     * 
     * @return PDOStatement The result set
     */
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get state by ID
     * 
     * @param int $id The state ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->code = $row['code'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new state
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      code = :code";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->code = htmlspecialchars(strip_tags($this->code));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":code", $this->code);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a state
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      code = :code
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->code = htmlspecialchars(strip_tags($this->code));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":code", $this->code);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a state
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        try {
            // Start transaction since we need to handle related districts deletion
            $this->conn->beginTransaction();
            
            // Delete all related districts
            $district_query = "DELETE FROM districts WHERE state_id = ?";
            $district_stmt = $this->conn->prepare($district_query);
            $district_stmt->bindParam(1, $this->id);
            $district_stmt->execute();
            
            // Delete the state
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
     * Check if a state exists by name
     * 
     * @param string $name The state name
     * @return bool True if exists, false otherwise
     */
    public function checkExists($name) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE name = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $name);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }
}
?>