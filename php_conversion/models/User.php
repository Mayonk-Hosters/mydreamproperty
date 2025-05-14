<?php
/**
 * User Model
 * 
 * Handles all operations related to users in the database
 */
class User {
    // Database connection and table name
    private $conn;
    private $table_name = "users";

    // Object properties
    public $id;
    public $username;
    public $password;
    public $email;
    public $full_name;
    public $profile_image;
    public $is_admin;
    public $created_at;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get user by ID
     * 
     * @param int $id The user ID
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
            $this->username = $row['username'];
            $this->password = $row['password'];
            $this->email = $row['email'];
            $this->full_name = $row['full_name'];
            $this->profile_image = $row['profile_image'];
            $this->is_admin = $row['is_admin'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }

    /**
     * Get user by username
     * 
     * @param string $username The username
     * @return bool True if found, false otherwise
     */
    public function getByUsername($username) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE username = ? LIMIT 0,1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(1, $username);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->username = $row['username'];
            $this->password = $row['password'];
            $this->email = $row['email'];
            $this->full_name = $row['full_name'];
            $this->profile_image = $row['profile_image'];
            $this->is_admin = $row['is_admin'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }

    /**
     * Create a new user
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET username = :username, 
                      password = :password, 
                      email = :email, 
                      full_name = :full_name, 
                      profile_image = :profile_image, 
                      is_admin = :is_admin";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->profile_image = htmlspecialchars(strip_tags($this->profile_image));
        
        // Bind values
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":password", $this->password); // Assumes password is already hashed
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":profile_image", $this->profile_image);
        $stmt->bindParam(":is_admin", $this->is_admin);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }

    /**
     * Update a user
     * 
     * @return bool True if updated, false otherwise
     */
    public function update() {
        $query = "UPDATE " . $this->table_name . " 
                  SET username = :username, 
                      email = :email, 
                      full_name = :full_name, 
                      profile_image = :profile_image, 
                      is_admin = :is_admin 
                  WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->username = htmlspecialchars(strip_tags($this->username));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->profile_image = htmlspecialchars(strip_tags($this->profile_image));
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        // Bind values
        $stmt->bindParam(":username", $this->username);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":profile_image", $this->profile_image);
        $stmt->bindParam(":is_admin", $this->is_admin);
        $stmt->bindParam(":id", $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Update user password
     * 
     * @param string $new_password The new (already hashed) password
     * @return bool True if updated, false otherwise
     */
    public function updatePassword($new_password) {
        $query = "UPDATE " . $this->table_name . " SET password = :password WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        
        $stmt->bindParam(":password", $new_password);
        $stmt->bindParam(":id", $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Delete a user
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
     * Get all users
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
     * Hash a password
     * 
     * @param string $password The password to hash
     * @return string The hashed password
     */
    public static function hashPassword($password) {
        return password_hash($password, PASSWORD_BCRYPT);
    }

    /**
     * Verify a password
     * 
     * @param string $password The password to verify
     * @param string $hash The hash to verify against
     * @return bool True if password matches, false otherwise
     */
    public static function verifyPassword($password, $hash) {
        return password_verify($password, $hash);
    }
}
?>