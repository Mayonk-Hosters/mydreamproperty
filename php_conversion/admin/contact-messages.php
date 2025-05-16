<?php
// php_conversion/admin/contact-messages.php - Manage contact messages

// Include necessary files
include_once '../includes/header.php';
include_once '../includes/admin_check.php'; 
require_once '../config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Set page title
$page_title = "Contact Messages";

// Handle message view/read
if (isset($_GET['view'])) {
    $message_id = intval($_GET['view']);
    
    // Mark message as read
    $query = "UPDATE contact_messages SET is_read = 1 WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $message_id);
    $stmt->execute();
    
    // Get message details
    $query = "SELECT * FROM contact_messages WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $message_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $message = $stmt->fetch(PDO::FETCH_ASSOC);
?>
<div class="container-fluid mt-4">
    <div class="row">
        <!-- Admin sidebar -->
        <?php include_once 'includes/admin_sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Message Details</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <a href="contact-messages.php" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-left me-1"></i> Back to Messages
                    </a>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Message #<?php echo $message_id; ?></h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h5>Contact Information</h5>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="30%">Name</th>
                                    <td><?php echo htmlspecialchars($message['name']); ?></td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>
                                        <a href="mailto:<?php echo htmlspecialchars($message['email']); ?>">
                                            <?php echo htmlspecialchars($message['email']); ?>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Mobile</th>
                                    <td>
                                        <?php if (!empty($message['mobile'])): ?>
                                        <a href="tel:<?php echo htmlspecialchars($message['mobile']); ?>">
                                            <?php echo htmlspecialchars($message['mobile']); ?>
                                        </a>
                                        <?php else: ?>
                                        <span class="text-muted">Not provided</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td><?php echo date('M d, Y h:i A', strtotime($message['created_at'])); ?></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h5>Message Information</h5>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="30%">Subject</th>
                                    <td><?php echo htmlspecialchars($message['subject']); ?></td>
                                </tr>
                                <tr>
                                    <th>Status</th>
                                    <td>
                                        <?php if ($message['is_read']): ?>
                                        <span class="badge bg-success">Read</span>
                                        <?php else: ?>
                                        <span class="badge bg-warning text-dark">Unread</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <h5 class="mt-4">Message</h5>
                    <div class="card">
                        <div class="card-body">
                            <?php echo nl2br(htmlspecialchars($message['message'])); ?>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <a href="mailto:<?php echo htmlspecialchars($message['email']); ?>" class="btn btn-primary">
                            <i class="fas fa-envelope me-1"></i> Reply via Email
                        </a>
                        <?php if (!empty($message['mobile'])): ?>
                        <a href="tel:<?php echo htmlspecialchars($message['mobile']); ?>" class="btn btn-success">
                            <i class="fas fa-phone me-1"></i> Call Now
                        </a>
                        <?php endif; ?>
                        <a href="contact-messages.php?delete=<?php echo $message_id; ?>" class="btn btn-danger" onclick="return confirm('Are you sure you want to delete this message?');">
                            <i class="fas fa-trash me-1"></i> Delete
                        </a>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
<?php
    } else {
        // Message not found
        echo '<div class="container mt-5"><div class="alert alert-danger">Message not found</div></div>';
    }
} 
// Handle message deletion
elseif (isset($_GET['delete'])) {
    $message_id = intval($_GET['delete']);
    
    // Delete message
    $query = "DELETE FROM contact_messages WHERE id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $message_id);
    
    if ($stmt->execute()) {
        header("Location: contact-messages.php?deleted=1");
        exit;
    } else {
        echo '<div class="container mt-5"><div class="alert alert-danger">Failed to delete message</div></div>';
    }
}
// Display list of messages
else {
?>
<div class="container-fluid mt-4">
    <div class="row">
        <!-- Admin sidebar -->
        <?php include_once 'includes/admin_sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Contact Messages</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <a href="export-data.php?export=contacts" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-file-excel me-1"></i> Export to Excel
                    </a>
                </div>
            </div>
            
            <?php if (isset($_GET['deleted']) && $_GET['deleted'] == 1): ?>
            <div class="alert alert-success">
                <i class="fas fa-check-circle me-2"></i> Message deleted successfully
            </div>
            <?php endif; ?>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover" id="messagesTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Subject</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                // Get all messages
                                $query = "SELECT * FROM contact_messages ORDER BY created_at DESC";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                
                                if ($stmt->rowCount() > 0) {
                                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                        $rowClass = $row['is_read'] ? '' : 'table-warning';
                                        
                                        echo "<tr class='" . $rowClass . "'>";
                                        echo "<td>" . $row['id'] . "</td>";
                                        echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                        echo "<td>
                                                <a href='mailto:" . htmlspecialchars($row['email']) . "'>
                                                    " . htmlspecialchars($row['email']) . "
                                                </a>
                                              </td>";
                                        echo "<td>";
                                        if (!empty($row['mobile'])) {
                                            echo "<a href='tel:" . htmlspecialchars($row['mobile']) . "'>";
                                            echo htmlspecialchars($row['mobile']);
                                            echo "</a>";
                                        } else {
                                            echo "<span class='text-muted'>Not provided</span>";
                                        }
                                        echo "</td>";
                                        echo "<td>" . htmlspecialchars($row['subject']) . "</td>";
                                        echo "<td>" . date('M d, Y', strtotime($row['created_at'])) . "</td>";
                                        echo "<td>";
                                        if ($row['is_read']) {
                                            echo "<span class='badge bg-success'>Read</span>";
                                        } else {
                                            echo "<span class='badge bg-warning text-dark'>Unread</span>";
                                        }
                                        echo "</td>";
                                        echo "<td>
                                                <div class='btn-group'>
                                                    <a href='contact-messages.php?view=" . $row['id'] . "' class='btn btn-sm btn-info'>
                                                        <i class='fas fa-eye'></i>
                                                    </a>
                                                    <a href='mailto:" . htmlspecialchars($row['email']) . "' class='btn btn-sm btn-primary'>
                                                        <i class='fas fa-envelope'></i>
                                                    </a>";
                                        if (!empty($row['mobile'])) {
                                            echo "<a href='tel:" . htmlspecialchars($row['mobile']) . "' class='btn btn-sm btn-success'>
                                                        <i class='fas fa-phone'></i>
                                                  </a>";
                                        }
                                        echo "<a href='contact-messages.php?delete=" . $row['id'] . "' class='btn btn-sm btn-danger' onclick='return confirm(\"Are you sure you want to delete this message?\");'>
                                                        <i class='fas fa-trash'></i>
                                                    </a>
                                                </div>
                                              </td>";
                                        echo "</tr>";
                                    }
                                } else {
                                    echo "<tr><td colspan='8' class='text-center'>No messages found</td></tr>";
                                }
                                ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>

<!-- Add DataTables for better sorting and filtering -->
<script src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
<script src="https://cdn.datatables.net/1.11.5/js/dataTables.bootstrap5.min.js"></script>
<link rel="stylesheet" href="https://cdn.datatables.net/1.11.5/css/dataTables.bootstrap5.min.css">

<script>
    $(document).ready(function() {
        $('#messagesTable').DataTable({
            order: [[5, 'desc']], // Sort by date column descending
            pageLength: 25,
            language: {
                search: "Search messages:"
            }
        });
    });
</script>
<?php
}

include_once '../includes/footer.php';
?>