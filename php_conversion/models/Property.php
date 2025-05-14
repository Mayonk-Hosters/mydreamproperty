<?php
/**
 * Property Model
 * 
 * Handles all operations related to properties in the database
 */
class Property {
    // Database connection and table name
    private $conn;
    private $table_name = "properties";

    // Object properties
    public $id;
    public $property_number;
    public $title;
    public $description;
    public $price;
    public $location;
    public $address;
    public $beds;
    public $baths;
    public $area;
    public $property_type;
    public $type;
    public $status;
    public $featured;
    public $images;
    public $agent_id;
    public $created_at;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all properties with optional filters
     * 
     * @param array $filters Optional filters like type, property_type, location, etc.
     * @return PDOStatement The result set
     */
    public function getAll($filters = []) {
        // Base query
        $query = "SELECT p.*, a.name as agent_name, a.image as agent_image, a.title as agent_title 
                 FROM " . $this->table_name . " p
                 LEFT JOIN agents a ON p.agent_id = a.id
                 WHERE 1=1";
        
        // Apply filters
        $params = [];
        
        if (!empty($filters['type'])) {
            $query .= " AND p.type = ?";
            $params[] = $filters['type'];
        }
        
        if (!empty($filters['property_type'])) {
            $query .= " AND p.property_type = ?";
            $params[] = $filters['property_type'];
        }
        
        if (!empty($filters['location'])) {
            $query .= " AND p.location LIKE ?";
            $params[] = "%{$filters['location']}%";
        }
        
        if (!empty($filters['min_price'])) {
            $query .= " AND p.price >= ?";
            $params[] = $filters['min_price'];
        }
        
        if (!empty($filters['max_price'])) {
            $query .= " AND p.price <= ?";
            $params[] = $filters['max_price'];
        }
        
        if (!empty($filters['min_beds'])) {
            $query .= " AND p.beds >= ?";
            $params[] = $filters['min_beds'];
        }
        
        if (!empty($filters['min_baths'])) {
            $query .= " AND p.baths >= ?";
            $params[] = $filters['min_baths'];
        }
        
        if (isset($filters['featured']) && $filters['featured']) {
            $query .= " AND p.featured = 1";
        }
        
        // Order by created_at
        $query .= " ORDER BY p.created_at DESC";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Execute query with params
        if (!empty($params)) {
            foreach ($params as $key => $value) {
                $stmt->bindValue($key + 1, $value);
            }
        }
        
        $stmt->execute();
        
        return $stmt;
    }

    /**
     * Get property by ID
     * 
     * @param int $id The property ID
     * @return bool True if found, false otherwise
     */
    public function getById($id) {
        $query = "SELECT p.*, a.name as agent_name, a.image as agent_image, a.title as agent_title 
                 FROM " . $this->table_name . " p
                 LEFT JOIN agents a ON p.agent_id = a.id
                 WHERE p.id = ? 
                 LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->property_number = $row['property_number'];
            $this->title = $row['title'];
            $this->description = $row['description'];
            $this->price = $row['price'];
            $this->location = $row['location'];
            $this->address = $row['address'];
            $this->beds = $row['beds'];
            $this->baths = $row['baths'];
            $this->area = $row['area'];
            $this->property_type = $row['property_type'];
            $this->type = $row['type'];
            $this->status = $row['status'];
            $this->featured = $row['featured'];
            $this->images = json_decode($row['images']);
            $this->agent_id = $row['agent_id'];
            $this->created_at = $row['created_at'];
            
            // Agent info
            $this->agent_name = $row['agent_name'];
            $this->agent_image = $row['agent_image'];
            $this->agent_title = $row['agent_title'];
            
            return true;
        }
        
        return false;
    }

    /**
     * Create a new property
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET property_number = :property_number,
                      title = :title, 
                      description = :description, 
                      price = :price, 
                      location = :location,
                      address = :address,
                      beds = :beds,
                      baths = :baths,
                      area = :area,
                      property_type = :property_type,
                      type = :type,
                      status = :status,
                      featured = :featured,
                      images = :images,
                      agent_id = :agent_id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->property_number = htmlspecialchars(strip_tags($this->property_number));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->beds = htmlspecialchars(strip_tags($this->beds));
        $this->baths = htmlspecialchars(strip_tags($this->baths));
        $this->area = htmlspecialchars(strip_tags($this->area));
        $this->property_type = htmlspecialchars(strip_tags($this->property_type));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->agent_id = htmlspecialchars(strip_tags($this->agent_id));
        
        // Convert images to JSON if it's an array
        $images_json = is_array($this->images) ? json_encode($this->images) : $this->images;
        
        // Bind values
        $stmt->bindParam(":property_number", $this->property_number);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":beds", $this->beds);
        $stmt->bindParam(":baths", $this->baths);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":property_type", $this->property_type);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":featured", $this->featured);
        $stmt->bindParam(":images", $images_json);
        $stmt->bindParam(":agent_id", $this->agent_id);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }

    /**
     * Update a property
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET property_number = :property_number,
                      title = :title, 
                      description = :description, 
                      price = :price, 
                      location = :location,
                      address = :address,
                      beds = :beds,
                      baths = :baths,
                      area = :area,
                      property_type = :property_type,
                      type = :type,
                      status = :status,
                      featured = :featured,
                      images = :images,
                      agent_id = :agent_id
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->property_number = htmlspecialchars(strip_tags($this->property_number));
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->price = htmlspecialchars(strip_tags($this->price));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->beds = htmlspecialchars(strip_tags($this->beds));
        $this->baths = htmlspecialchars(strip_tags($this->baths));
        $this->area = htmlspecialchars(strip_tags($this->area));
        $this->property_type = htmlspecialchars(strip_tags($this->property_type));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->status = htmlspecialchars(strip_tags($this->status));
        $this->agent_id = htmlspecialchars(strip_tags($this->agent_id));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Convert images to JSON if it's an array
        $images_json = is_array($this->images) ? json_encode($this->images) : $this->images;
        
        // Bind values
        $stmt->bindParam(":property_number", $this->property_number);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":price", $this->price);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":beds", $this->beds);
        $stmt->bindParam(":baths", $this->baths);
        $stmt->bindParam(":area", $this->area);
        $stmt->bindParam(":property_type", $this->property_type);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":featured", $this->featured);
        $stmt->bindParam(":images", $images_json);
        $stmt->bindParam(":agent_id", $this->agent_id);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Delete a property
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
     * Count properties by type
     * 
     * @param string $propertyType Property type to count
     * @return int Count of properties
     */
    public function countByType($propertyType) {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE property_type = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $propertyType);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'];
    }

    /**
     * Generate a unique property number
     * 
     * @return string A unique property number in format MDP-XXX
     */
    public function generatePropertyNumber() {
        $query = "SELECT MAX(SUBSTRING(property_number, 5)) as max_number FROM " . $this->table_name . " WHERE property_number LIKE 'MDP-%'";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $max_number = intval($row['max_number']);
        $new_number = $max_number + 1;
        
        return 'MDP-' . str_pad($new_number, 3, '0', STR_PAD_LEFT);
    }
}
?>