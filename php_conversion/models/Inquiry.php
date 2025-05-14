<?php
/**
 * Inquiry Model
 * 
 * Handles all operations related to property inquiries in the database
 */
class Inquiry {
    // Database connection and table name
    private $conn;
    private $table_name = "inquiries";

    // Object properties
    public $id;
    public $name;
    public $email;
    public $phone;
    public $message;
    public $property_id;
    public $user_id;
    public $created_at;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all inquiries
     * 
     * @return PDOStatement The result set
     */
    public function getAll() {
        $query = "SELECT i.*, p.title as property_title, p.property_number 
                 FROM " . $this->table_name . " i
                 LEFT JOIN properties p ON i.property_id = p.id
                 ORDER BY i.created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Get inquiry by ID
     * 
     * @param int $id The inquiry ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT i.*, p.title as property_title, p.property_number
                 FROM " . $this->table_name . " i
                 LEFT JOIN properties p ON i.property_id = p.id
                 WHERE i.id = ? 
                 LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->message = $row['message'];
            $this->property_id = $row['property_id'];
            $this->user_id = $row['user_id'];
            $this->created_at = $row['created_at'];
            
            // Additional property info
            $this->property_title = $row['property_title'];
            $this->property_number = $row['property_number'];
            
            return true;
        }
        
        return false;
    }

    /**
     * Create a new inquiry
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      email = :email, 
                      phone = :phone, 
                      message = :message, 
                      property_id = :property_id, 
                      user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->message = htmlspecialchars(strip_tags($this->message));
        $this->property_id = htmlspecialchars(strip_tags($this->property_id));
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":property_id", $this->property_id);
        $stmt->bindParam(":user_id", $this->user_id);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }

    /**
     * Get inquiries by property ID
     * 
     * @param int $property_id The property ID
     * @return PDOStatement The result set
     */
    public function getByPropertyId($property_id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                 WHERE property_id = ? 
                 ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $property_id);
        $stmt->execute();
        
        return $stmt;
    }
    
    /**
     * Get property details for an inquiry
     * 
     * @return array|null Property details or null if not found
     */
    public function getPropertyDetails() {
        if (!$this->property_id) {
            return null;
        }
        
        $query = "SELECT id, title, property_number, images, price, location
                 FROM properties 
                 WHERE id = ? 
                 LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $this->property_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($row) {
            return [
                'id' => $row['id'],
                'title' => $row['title'],
                'propertyNumber' => $row['property_number'],
                'images' => json_decode($row['images']),
                'price' => $row['price'],
                'location' => $row['location']
            ];
        }
        
        return null;
    }
}
?>