<?php
/**
 * NeighborhoodMetrics Model
 * 
 * Handles all operations related to neighborhood metrics in the database
 */
class NeighborhoodMetrics {
    // Database connection and table name
    private $conn;
    private $table_name = "neighborhood_metrics";
    
    // Object properties
    public $id;
    public $neighborhood_id;
    public $avg_property_price;
    public $safety_score;
    public $walkability_score;
    public $schools_score;
    public $public_transport_score;
    public $dining_score;
    public $entertainment_score;
    public $parking_score;
    public $noise_level;
    public $schools_count;
    public $parks_count;
    public $restaurants_count;
    public $hospitals_count;
    public $shopping_count;
    public $grocery_stores_count;
    public $gyms_count;
    public $updated_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get metrics by neighborhood ID
     * 
     * @param int $neighborhood_id The neighborhood ID
     * @return bool True if found, false otherwise
     */
    public function getByNeighborhoodId($neighborhood_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE neighborhood_id = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $neighborhood_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->neighborhood_id = $row['neighborhood_id'];
            $this->avg_property_price = $row['avg_property_price'];
            $this->safety_score = $row['safety_score'];
            $this->walkability_score = $row['walkability_score'];
            $this->schools_score = $row['schools_score'];
            $this->public_transport_score = $row['public_transport_score'];
            $this->dining_score = $row['dining_score'];
            $this->entertainment_score = $row['entertainment_score'];
            $this->parking_score = $row['parking_score'];
            $this->noise_level = $row['noise_level'];
            $this->schools_count = $row['schools_count'];
            $this->parks_count = $row['parks_count'];
            $this->restaurants_count = $row['restaurants_count'];
            $this->hospitals_count = $row['hospitals_count'];
            $this->shopping_count = $row['shopping_count'];
            $this->grocery_stores_count = $row['grocery_stores_count'];
            $this->gyms_count = $row['gyms_count'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create new neighborhood metrics
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET neighborhood_id = :neighborhood_id,
                      avg_property_price = :avg_property_price,
                      safety_score = :safety_score,
                      walkability_score = :walkability_score,
                      schools_score = :schools_score,
                      public_transport_score = :public_transport_score,
                      dining_score = :dining_score,
                      entertainment_score = :entertainment_score,
                      parking_score = :parking_score,
                      noise_level = :noise_level,
                      schools_count = :schools_count,
                      parks_count = :parks_count,
                      restaurants_count = :restaurants_count,
                      hospitals_count = :hospitals_count,
                      shopping_count = :shopping_count,
                      grocery_stores_count = :grocery_stores_count,
                      gyms_count = :gyms_count";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->neighborhood_id = htmlspecialchars(strip_tags($this->neighborhood_id));
        
        // Bind values
        $stmt->bindParam(":neighborhood_id", $this->neighborhood_id);
        $stmt->bindParam(":avg_property_price", $this->avg_property_price);
        $stmt->bindParam(":safety_score", $this->safety_score);
        $stmt->bindParam(":walkability_score", $this->walkability_score);
        $stmt->bindParam(":schools_score", $this->schools_score);
        $stmt->bindParam(":public_transport_score", $this->public_transport_score);
        $stmt->bindParam(":dining_score", $this->dining_score);
        $stmt->bindParam(":entertainment_score", $this->entertainment_score);
        $stmt->bindParam(":parking_score", $this->parking_score);
        $stmt->bindParam(":noise_level", $this->noise_level);
        $stmt->bindParam(":schools_count", $this->schools_count);
        $stmt->bindParam(":parks_count", $this->parks_count);
        $stmt->bindParam(":restaurants_count", $this->restaurants_count);
        $stmt->bindParam(":hospitals_count", $this->hospitals_count);
        $stmt->bindParam(":shopping_count", $this->shopping_count);
        $stmt->bindParam(":grocery_stores_count", $this->grocery_stores_count);
        $stmt->bindParam(":gyms_count", $this->gyms_count);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update neighborhood metrics
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET avg_property_price = :avg_property_price,
                      safety_score = :safety_score,
                      walkability_score = :walkability_score,
                      schools_score = :schools_score,
                      public_transport_score = :public_transport_score,
                      dining_score = :dining_score,
                      entertainment_score = :entertainment_score,
                      parking_score = :parking_score,
                      noise_level = :noise_level,
                      schools_count = :schools_count,
                      parks_count = :parks_count,
                      restaurants_count = :restaurants_count,
                      hospitals_count = :hospitals_count,
                      shopping_count = :shopping_count,
                      grocery_stores_count = :grocery_stores_count,
                      gyms_count = :gyms_count,
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":avg_property_price", $this->avg_property_price);
        $stmt->bindParam(":safety_score", $this->safety_score);
        $stmt->bindParam(":walkability_score", $this->walkability_score);
        $stmt->bindParam(":schools_score", $this->schools_score);
        $stmt->bindParam(":public_transport_score", $this->public_transport_score);
        $stmt->bindParam(":dining_score", $this->dining_score);
        $stmt->bindParam(":entertainment_score", $this->entertainment_score);
        $stmt->bindParam(":parking_score", $this->parking_score);
        $stmt->bindParam(":noise_level", $this->noise_level);
        $stmt->bindParam(":schools_count", $this->schools_count);
        $stmt->bindParam(":parks_count", $this->parks_count);
        $stmt->bindParam(":restaurants_count", $this->restaurants_count);
        $stmt->bindParam(":hospitals_count", $this->hospitals_count);
        $stmt->bindParam(":shopping_count", $this->shopping_count);
        $stmt->bindParam(":grocery_stores_count", $this->grocery_stores_count);
        $stmt->bindParam(":gyms_count", $this->gyms_count);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Get neighborhoods with metrics for comparison
     * 
     * @param array $neighborhood_ids Array of neighborhood IDs to compare
     * @return array Array of neighborhoods with their metrics
     */
    public function compareNeighborhoods($neighborhood_ids) {
        // If no IDs provided, return empty array
        if (empty($neighborhood_ids)) {
            return [];
        }
        
        // Create placeholders for the IN clause
        $placeholders = implode(',', array_fill(0, count($neighborhood_ids), '?'));
        
        // Query to get neighborhoods with their metrics
        $query = "SELECT n.*, 
                      m.avg_property_price, m.safety_score, m.walkability_score, 
                      m.schools_score, m.public_transport_score, m.dining_score, 
                      m.entertainment_score, m.parking_score, m.noise_level,
                      m.schools_count, m.parks_count, m.restaurants_count, 
                      m.hospitals_count, m.shopping_count, m.grocery_stores_count, 
                      m.gyms_count
                  FROM neighborhoods n
                  LEFT JOIN " . $this->table_name . " m ON n.id = m.neighborhood_id
                  WHERE n.id IN ($placeholders)
                  ORDER BY n.name";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Bind IDs to placeholders
        foreach ($neighborhood_ids as $index => $id) {
            $stmt->bindValue($index + 1, $id);
        }
        
        // Execute query
        $stmt->execute();
        
        // Fetch results
        $result = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Extract neighborhood data
            $neighborhood = [
                'id' => $row['id'],
                'name' => $row['name'],
                'city' => $row['city'],
                'description' => $row['description'],
                'location_data' => json_decode($row['location_data'], true),
                'created_at' => $row['created_at']
            ];
            
            // Extract metrics data if available
            if ($row['avg_property_price'] !== null) {
                $neighborhood['metrics'] = [
                    'avg_property_price' => $row['avg_property_price'],
                    'safety_score' => $row['safety_score'],
                    'walkability_score' => $row['walkability_score'],
                    'schools_score' => $row['schools_score'],
                    'public_transport_score' => $row['public_transport_score'],
                    'dining_score' => $row['dining_score'],
                    'entertainment_score' => $row['entertainment_score'],
                    'parking_score' => $row['parking_score'],
                    'noise_level' => $row['noise_level'],
                    'schools_count' => $row['schools_count'],
                    'parks_count' => $row['parks_count'],
                    'restaurants_count' => $row['restaurants_count'],
                    'hospitals_count' => $row['hospitals_count'],
                    'shopping_count' => $row['shopping_count'],
                    'grocery_stores_count' => $row['grocery_stores_count'],
                    'gyms_count' => $row['gyms_count']
                ];
            } else {
                $neighborhood['metrics'] = null;
            }
            
            $result[] = $neighborhood;
        }
        
        return $result;
    }
}
?>