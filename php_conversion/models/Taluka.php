<?php
/**
 * Taluka Model
 * 
 * Handles all operations related to Indian talukas in the database
 */
class Taluka {
    // Database connection and table name
    private $conn;
    private $table_name = "talukas";
    
    // Object properties
    public $id;
    public $name;
    public $district_id;
    public $created_at;
    public $district_name; // For joined queries
    public $state_id; // For joined queries
    public $state_name; // For joined queries
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all talukas
     * 
     * @param int $district_id Optional district ID to filter by
     * @return PDOStatement The result set
     */
    public function getAll($district_id = null) {
        $query = "SELECT t.*, d.name as district_name, d.state_id, s.name as state_name
                  FROM " . $this->table_name . " t
                  JOIN districts d ON t.district_id = d.id
                  JOIN states s ON d.state_id = s.id";
        
        if ($district_id) {
            $query .= " WHERE t.district_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(1, $district_id);
        } else {
            $query .= " ORDER BY s.name, d.name, t.name";
            $stmt = $this->conn->prepare($query);
        }
        
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get taluka by ID
     * 
     * @param int $id The taluka ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT t.*, d.name as district_name, d.state_id, s.name as state_name
                  FROM " . $this->table_name . " t
                  JOIN districts d ON t.district_id = d.id
                  JOIN states s ON d.state_id = s.id
                  WHERE t.id = ? 
                  LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->district_id = $row['district_id'];
            $this->created_at = $row['created_at'];
            $this->district_name = $row['district_name'];
            $this->state_id = $row['state_id'];
            $this->state_name = $row['state_name'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new taluka
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      district_id = :district_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->district_id = htmlspecialchars(strip_tags($this->district_id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":district_id", $this->district_id);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a taluka
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      district_id = :district_id
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->district_id = htmlspecialchars(strip_tags($this->district_id));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":district_id", $this->district_id);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a taluka
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        try {
            // Start transaction since we need to handle related tehsils deletion
            $this->conn->beginTransaction();
            
            // Delete all related tehsils
            $tehsil_query = "DELETE FROM tehsils WHERE taluka_id = ?";
            $tehsil_stmt = $this->conn->prepare($tehsil_query);
            $tehsil_stmt->bindParam(1, $this->id);
            $tehsil_stmt->execute();
            
            // Delete the taluka
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
     * Check if a taluka exists by name in a district
     * 
     * @param string $name The taluka name
     * @param int $district_id The district ID
     * @return bool True if exists, false otherwise
     */
    public function checkExists($name, $district_id) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE name = ? AND district_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $name);
        $stmt->bindParam(2, $district_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }
}
?>