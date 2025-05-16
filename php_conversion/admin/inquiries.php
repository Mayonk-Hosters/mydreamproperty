<?php
// php_conversion/admin/inquiries.php - Manage property inquiries

// Include necessary files
include_once '../includes/header.php';
include_once '../includes/admin_check.php'; 
require_once '../config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Set page title
$page_title = "Property Inquiries";

// Handle inquiry view
if (isset($_GET['view'])) {
    $inquiry_id = intval($_GET['view']);
    
    // Get inquiry details
    $query = "SELECT i.*, p.title as property_title, p.property_number 
              FROM inquiries i 
              LEFT JOIN properties p ON i.property_id = p.id
              WHERE i.id = ?";
    $stmt = $db->prepare($query);
    $stmt->bindParam(1, $inquiry_id);
    $stmt->execute();
    
    if ($stmt->rowCount() > 0) {
        $inquiry = $stmt->fetch(PDO::FETCH_ASSOC);
?>
<div class="container-fluid mt-4">
    <div class="row">
        <!-- Admin sidebar -->
        <?php include_once 'includes/admin_sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Inquiry Details</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <a href="inquiries.php" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-arrow-left me-1"></i> Back to Inquiries
                    </a>
                </div>
            </div>
            
            <div class="card mb-4">
                <div class="card-header bg-primary text-white">
                    <h5 class="mb-0">Inquiry #<?php echo $inquiry_id; ?></h5>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h5>Contact Information</h5>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="30%">Name</th>
                                    <td><?php echo htmlspecialchars($inquiry['name']); ?></td>
                                </tr>
                                <tr>
                                    <th>Email</th>
                                    <td>
                                        <a href="mailto:<?php echo htmlspecialchars($inquiry['email']); ?>">
                                            <?php echo htmlspecialchars($inquiry['email']); ?>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Mobile</th>
                                    <td>
                                        <?php if (!empty($inquiry['mobile'])): ?>
                                        <a href="tel:<?php echo htmlspecialchars($inquiry['mobile']); ?>">
                                            <?php echo htmlspecialchars($inquiry['mobile']); ?>
                                        </a>
                                        <?php else: ?>
                                        <span class="text-muted">Not provided</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td><?php echo date('M d, Y h:i A', strtotime($inquiry['created_at'])); ?></td>
                                </tr>
                            </table>
                        </div>
                        <div class="col-md-6">
                            <h5>Property Information</h5>
                            <table class="table table-bordered">
                                <tr>
                                    <th width="30%">Property</th>
                                    <td>
                                        <?php if (isset($inquiry['property_title'])): ?>
                                        <a href="properties.php?view=<?php echo $inquiry['property_id']; ?>">
                                            <?php echo htmlspecialchars($inquiry['property_title']); ?>
                                        </a>
                                        <?php else: ?>
                                        <span class="text-muted">Unknown property</span>
                                        <?php endif; ?>
                                    </td>
                                </tr>
                                <tr>
                                    <th>Property Number</th>
                                    <td><?php echo htmlspecialchars($inquiry['property_number'] ?? 'N/A'); ?></td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <h5 class="mt-4">Message</h5>
                    <div class="card">
                        <div class="card-body">
                            <?php echo nl2br(htmlspecialchars($inquiry['message'])); ?>
                        </div>
                    </div>
                    
                    <div class="mt-4">
                        <a href="mailto:<?php echo htmlspecialchars($inquiry['email']); ?>" class="btn btn-primary">
                            <i class="fas fa-envelope me-1"></i> Reply via Email
                        </a>
                        <?php if (!empty($inquiry['mobile'])): ?>
                        <a href="tel:<?php echo htmlspecialchars($inquiry['mobile']); ?>" class="btn btn-success">
                            <i class="fas fa-phone me-1"></i> Call Now
                        </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </main>
    </div>
</div>
<?php
    } else {
        // Inquiry not found
        echo '<div class="container mt-5"><div class="alert alert-danger">Inquiry not found</div></div>';
    }
} else {
    // Display list of inquiries
?>
<div class="container-fluid mt-4">
    <div class="row">
        <!-- Admin sidebar -->
        <?php include_once 'includes/admin_sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Property Inquiries</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <a href="export-data.php?export=inquiries" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-file-excel me-1"></i> Export to Excel
                    </a>
                </div>
            </div>
            
            <div class="card">
                <div class="card-body">
                    <div class="table-responsive">
                        <table class="table table-striped table-hover" id="inquiriesTable">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Property</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Mobile</th>
                                    <th>Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php
                                // Get all inquiries
                                $query = "SELECT i.*, p.title as property_title, p.property_number 
                                          FROM inquiries i 
                                          LEFT JOIN properties p ON i.property_id = p.id
                                          ORDER BY i.created_at DESC";
                                $stmt = $db->prepare($query);
                                $stmt->execute();
                                
                                if ($stmt->rowCount() > 0) {
                                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                        echo "<tr>";
                                        echo "<td>" . $row['id'] . "</td>";
                                        echo "<td>" . htmlspecialchars($row['property_title'] ?? 'Unknown') . 
                                              " (#" . htmlspecialchars($row['property_number'] ?? 'N/A') . ")</td>";
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
                                        echo "<td>" . date('M d, Y', strtotime($row['created_at'])) . "</td>";
                                        echo "<td>
                                                <div class='btn-group'>
                                                    <a href='inquiries.php?view=" . $row['id'] . "' class='btn btn-sm btn-info'>
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
                                        echo "</div>
                                              </td>";
                                        echo "</tr>";
                                    }
                                } else {
                                    echo "<tr><td colspan='7' class='text-center'>No inquiries found</td></tr>";
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
        $('#inquiriesTable').DataTable({
            order: [[5, 'desc']], // Sort by date column descending
            pageLength: 25,
            language: {
                search: "Search inquiries:"
            }
        });
    });
</script>
<?php
}

include_once '../includes/footer.php';
?>