<?php
/**
 * Contact Info Model
 * 
 * Handles all operations related to website contact information
 */
class ContactInfo {
    // Database connection and table name
    private $conn;
    private $table_name = "contact_info";
    
    // Object properties
    public $id;
    public $site_name;
    public $address;
    public $phone;
    public $email;
    public $opening_hours;
    public $facebook_url;
    public $twitter_url;
    public $instagram_url;
    public $linkedin_url;
    public $about_us;
    public $privacy_policy;
    public $terms_conditions;
    public $updated_at;
    
    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get website contact information
     * 
     * @return bool True if found, false otherwise
     */
    public function get() {
        $query = "SELECT * FROM " . $this->table_name . " LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->site_name = $row['site_name'];
            $this->address = $row['address'];
            $this->phone = $row['phone'];
            $this->email = $row['email'];
            $this->opening_hours = $row['opening_hours'];
            $this->facebook_url = $row['facebook_url'];
            $this->twitter_url = $row['twitter_url'];
            $this->instagram_url = $row['instagram_url'];
            $this->linkedin_url = $row['linkedin_url'];
            $this->about_us = $row['about_us'];
            $this->privacy_policy = $row['privacy_policy'];
            $this->terms_conditions = $row['terms_conditions'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Create website contact information
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET site_name = :site_name,
                      address = :address,
                      phone = :phone,
                      email = :email,
                      opening_hours = :opening_hours,
                      facebook_url = :facebook_url,
                      twitter_url = :twitter_url,
                      instagram_url = :instagram_url,
                      linkedin_url = :linkedin_url,
                      about_us = :about_us,
                      privacy_policy = :privacy_policy,
                      terms_conditions = :terms_conditions";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->site_name = htmlspecialchars(strip_tags($this->site_name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->opening_hours = htmlspecialchars(strip_tags($this->opening_hours));
        $this->facebook_url = htmlspecialchars(strip_tags($this->facebook_url));
        $this->twitter_url = htmlspecialchars(strip_tags($this->twitter_url));
        $this->instagram_url = htmlspecialchars(strip_tags($this->instagram_url));
        $this->linkedin_url = htmlspecialchars(strip_tags($this->linkedin_url));
        // Do not sanitize rich text content with HTML
        
        // Bind values
        $stmt->bindParam(":site_name", $this->site_name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":opening_hours", $this->opening_hours);
        $stmt->bindParam(":facebook_url", $this->facebook_url);
        $stmt->bindParam(":twitter_url", $this->twitter_url);
        $stmt->bindParam(":instagram_url", $this->instagram_url);
        $stmt->bindParam(":linkedin_url", $this->linkedin_url);
        $stmt->bindParam(":about_us", $this->about_us);
        $stmt->bindParam(":privacy_policy", $this->privacy_policy);
        $stmt->bindParam(":terms_conditions", $this->terms_conditions);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }
    
    /**
     * Update website contact information
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        // Check if contact info exists
        if (!$this->get()) {
            // Create if it doesn't exist
            return $this->create();
        }
        
        $query = "UPDATE " . $this->table_name . " 
                  SET site_name = :site_name,
                      address = :address,
                      phone = :phone,
                      email = :email,
                      opening_hours = :opening_hours,
                      facebook_url = :facebook_url,
                      twitter_url = :twitter_url,
                      instagram_url = :instagram_url,
                      linkedin_url = :linkedin_url,
                      about_us = :about_us,
                      privacy_policy = :privacy_policy,
                      terms_conditions = :terms_conditions,
                      updated_at = NOW()
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->site_name = htmlspecialchars(strip_tags($this->site_name));
        $this->address = htmlspecialchars(strip_tags($this->address));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->opening_hours = htmlspecialchars(strip_tags($this->opening_hours));
        $this->facebook_url = htmlspecialchars(strip_tags($this->facebook_url));
        $this->twitter_url = htmlspecialchars(strip_tags($this->twitter_url));
        $this->instagram_url = htmlspecialchars(strip_tags($this->instagram_url));
        $this->linkedin_url = htmlspecialchars(strip_tags($this->linkedin_url));
        $this->id = htmlspecialchars(strip_tags($this->id));
        // Do not sanitize rich text content with HTML
        
        // Bind values
        $stmt->bindParam(":site_name", $this->site_name);
        $stmt->bindParam(":address", $this->address);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":opening_hours", $this->opening_hours);
        $stmt->bindParam(":facebook_url", $this->facebook_url);
        $stmt->bindParam(":twitter_url", $this->twitter_url);
        $stmt->bindParam(":instagram_url", $this->instagram_url);
        $stmt->bindParam(":linkedin_url", $this->linkedin_url);
        $stmt->bindParam(":about_us", $this->about_us);
        $stmt->bindParam(":privacy_policy", $this->privacy_policy);
        $stmt->bindParam(":terms_conditions", $this->terms_conditions);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
}
?>