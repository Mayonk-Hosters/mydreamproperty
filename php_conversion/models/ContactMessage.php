<?php
/**
 * ContactMessage Model
 * 
 * Handles all operations related to contact form messages in the database
 */
class ContactMessage {
    // Database connection and table name
    private $conn;
    private $table_name = "contact_messages";

    // Object properties
    public $id;
    public $name;
    public $email;
    public $subject;
    public $message;
    public $is_read;
    public $created_at;

    // Constructor with DB connection
    public function __construct($db) {
        $this->conn = $db;
    }

    /**
     * Get all contact messages
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
     * Get contact message by ID
     * 
     * @param int $id The contact message ID
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
            $this->email = $row['email'];
            $this->subject = $row['subject'];
            $this->message = $row['message'];
            $this->is_read = $row['is_read'];
            $this->created_at = $row['created_at'];
            return true;
        }
        
        return false;
    }

    /**
     * Create a new contact message
     * 
     * @return bool True if created, false otherwise
     */
    public function create() {
        $query = "INSERT INTO " . $this->table_name . " 
                  SET name = :name, 
                      email = :email, 
                      subject = :subject, 
                      message = :message, 
                      is_read = :is_read";
        
        $stmt = $this->conn->prepare($query);
        
        // Sanitize input
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->email = htmlspecialchars(strip_tags($this->email));
        $this->subject = htmlspecialchars(strip_tags($this->subject));
        $this->message = htmlspecialchars(strip_tags($this->message));
        
        // Set default is_read value
        $is_read = $this->is_read ? 1 : 0;
        
        // Bind values
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":email", $this->email);
        $stmt->bindParam(":subject", $this->subject);
        $stmt->bindParam(":message", $this->message);
        $stmt->bindParam(":is_read", $is_read);
        
        // Execute query
        if($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }
        
        return false;
    }

    /**
     * Mark a contact message as read
     * 
     * @return bool True if updated, false otherwise
     */
    public function markAsRead() {
        $query = "UPDATE " . $this->table_name . " SET is_read = 1 WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Delete a contact message
     * 
     * @return bool True if deleted, false otherwise
     */
    public function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = ?";
        
        $stmt = $this->conn->prepare($query);
        
        $stmt->bindParam(1, $this->id);
        
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }

    /**
     * Get unread messages count
     * 
     * @return int Number of unread messages
     */
    public function countUnread() {
        $query = "SELECT COUNT(*) as count FROM " . $this->table_name . " WHERE is_read = 0";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $row['count'];
    }
}
?>