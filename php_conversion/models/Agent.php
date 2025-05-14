<?php
/**
 * Agent Model
 * 
 * Handles all operations related to agents in the database
 */
class Agent {
    // Database connection and table name
    private $conn;
    private $table_name = "agents";

    // Object properties
    public $id;
    public $name;
    public $title;
    public $image;
    public $deals;
    public $rating;
    public $created_at;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all agents
     * 
     * @return PDOStatement The result set
     */
    public function getAll() {
        $query = "SELECT * FROM " . $this->table_name . " ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Get agent by ID
     * 
     * @param int $id The agent ID
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
            $this->title = $row['title'];
            $this->image = $row['image'];
            $this->deals = $row['deals'];
            $this->rating = $row['rating'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }

    /**
     * Create a new agent
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      title = :title, 
                      image = :image, 
                      deals = :deals, 
                      rating = :rating";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->deals = htmlspecialchars(strip_tags($this->deals));
        $this->rating = htmlspecialchars(strip_tags($this->rating));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":deals", $this->deals);
        $stmt->bindParam(":rating", $this->rating);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }

    /**
     * Update an agent
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET name = :name, 
                      title = :title, 
                      image = :image, 
                      deals = :deals, 
                      rating = :rating 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->image = htmlspecialchars(strip_tags($this->image));
        $this->deals = htmlspecialchars(strip_tags($this->deals));
        $this->rating = htmlspecialchars(strip_tags($this->rating));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":image", $this->image);
        $stmt->bindParam(":deals", $this->deals);
        $stmt->bindParam(":rating", $this->rating);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Delete an agent
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Get properties by agent ID
     * 
     * @return PDOStatement The result set
     */
    public function getProperties() {
        $query = "SELECT * FROM properties WHERE agent_id = ? ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Count properties by agent
     * 
     * @return int Number of properties
     */
    public function countProperties() {
        $query = "SELECT COUNT(*) as count FROM properties WHERE agent_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'];
    }
}
?>