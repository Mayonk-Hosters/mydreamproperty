<?php
/**
 * Neighborhood Model
 * 
 * Handles all operations related to neighborhoods in the database
 */
class Neighborhood {
    // Database connection and table name
    private $conn;
    private $table_name = "neighborhoods";
    
    // Object properties
    public $id;
    public $name;
    public $city;
    public $description;
    public $location_data;
    public $created_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all neighborhoods
     * 
     * @return PDOStatement The result set
     */
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY name";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get neighborhood by ID
     * 
     * @param int $id The neighborhood ID
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
            $this->city = $row['city'];
            $this->description = $row['description'];
            $this->location_data = $row['location_data'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create a new neighborhood
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      city = :city,
                      description = :description,
                      location_data = :location_data";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->description = htmlspecialchars(strip_tags($this->description));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location_data", $this->location_data);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a neighborhood
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      city = :city,
                      description = :description,
                      location_data = :location_data
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->city = htmlspecialchars(strip_tags($this->city));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":city", $this->city);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location_data", $this->location_data);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Delete a neighborhood
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        try {
            // Start transaction since we need to handle related metrics deletion
            $this->conn->beginTransaction();
            
            // Delete all related metrics
            $metrics_query = "DELETE FROM neighborhood_metrics WHERE neighborhood_id = ?";
            $metrics_stmt = $this->conn->prepare($metrics_query);
            $metrics_stmt->bindParam(1, $this->id);
            $metrics_stmt->execute();
            
            // Delete the neighborhood
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
     * Check if a neighborhood exists by name and city
     * 
     * @param string $name The neighborhood name
     * @param string $city The city name
     * @return bool True if exists, false otherwise
     */
    public function checkExists($name, $city) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE name = ? AND city = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $name);
        $stmt->bindParam(2, $city);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'] > 0;
    }
}
?>