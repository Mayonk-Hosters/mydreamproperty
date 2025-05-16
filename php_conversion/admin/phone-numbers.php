<?php
// php_conversion/admin/phone-numbers.php - Phone numbers collected from contacts and inquiries

// Include necessary files
include_once '../includes/header.php';
include_once '../includes/admin_check.php'; 
require_once '../config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

// Set page title
$page_title = "Phone Numbers";
?>

<div class="container-fluid mt-4">
    <div class="row">
        <!-- Admin sidebar -->
        <?php include_once 'includes/admin_sidebar.php'; ?>
        
        <!-- Main content -->
        <main class="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div class="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
                <h1 class="h2">Phone Numbers</h1>
                <div class="btn-toolbar mb-2 mb-md-0">
                    <a href="export-data.php?export=phone_numbers" class="btn btn-sm btn-outline-secondary">
                        <i class="fas fa-file-excel me-1"></i> Export to Excel
                    </a>
                </div>
            </div>
            
            <!-- Nav tabs -->
            <ul class="nav nav-tabs mb-3" id="phoneNumberTabs" role="tablist">
                <li class="nav-item" role="presentation">
                    <button class="nav-link active" id="all-tab" data-bs-toggle="tab" data-bs-target="#all" 
                            type="button" role="tab" aria-controls="all" aria-selected="true">
                        All Phone Numbers
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="inquiries-tab" data-bs-toggle="tab" data-bs-target="#inquiries" 
                            type="button" role="tab" aria-controls="inquiries" aria-selected="false">
                        Property Inquiries
                    </button>
                </li>
                <li class="nav-item" role="presentation">
                    <button class="nav-link" id="contacts-tab" data-bs-toggle="tab" data-bs-target="#contacts" 
                            type="button" role="tab" aria-controls="contacts" aria-selected="false">
                        Contact Messages
                    </button>
                </li>
            </ul>
            
            <!-- Tab content -->
            <div class="tab-content" id="phoneNumberTabsContent">
                <!-- All Phone Numbers Tab -->
                <div class="tab-pane fade show active" id="all" role="tabpanel" aria-labelledby="all-tab">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="allPhoneNumbersTable">
                                    <thead>
                                        <tr>
                                            <th>Source</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        // Query to get all phone numbers from both inquiries and contact messages
                                        $query = "
                                            (SELECT 'Property Inquiry' as source, name, email, mobile as phone, created_at 
                                             FROM inquiries 
                                             WHERE mobile IS NOT NULL AND mobile != '')
                                            UNION ALL
                                            (SELECT 'Contact Message' as source, name, email, mobile as phone, created_at 
                                             FROM contact_messages 
                                             WHERE mobile IS NOT NULL AND mobile != '')
                                            ORDER BY created_at DESC";
                                        
                                        $stmt = $db->prepare($query);
                                        $stmt->execute();
                                        
                                        if ($stmt->rowCount() > 0) {
                                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                                echo "<tr>";
                                                echo "<td>" . htmlspecialchars($row['source']) . "</td>";
                                                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                                echo "<td>
                                                        <a href='mailto:" . htmlspecialchars($row['email']) . "'>
                                                            " . htmlspecialchars($row['email']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>
                                                        <a href='tel:" . htmlspecialchars($row['phone']) . "'>
                                                            " . htmlspecialchars($row['phone']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>" . date('M d, Y', strtotime($row['created_at'])) . "</td>";
                                                echo "<td>
                                                        <a href='mailto:" . htmlspecialchars($row['email']) . "' class='btn btn-sm btn-primary'>
                                                            <i class='fas fa-envelope'></i>
                                                        </a>
                                                        <a href='tel:" . htmlspecialchars($row['phone']) . "' class='btn btn-sm btn-success'>
                                                            <i class='fas fa-phone'></i>
                                                        </a>
                                                      </td>";
                                                echo "</tr>";
                                            }
                                        } else {
                                            echo "<tr><td colspan='6' class='text-center'>No phone numbers found</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Property Inquiries Tab -->
                <div class="tab-pane fade" id="inquiries" role="tabpanel" aria-labelledby="inquiries-tab">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="inquiriesPhoneTable">
                                    <thead>
                                        <tr>
                                            <th>Property</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        // Query to get phone numbers from property inquiries
                                        $query = "
                                            SELECT i.id, i.name, i.email, i.mobile as phone, i.created_at,
                                                   p.title as property_title, p.property_number
                                            FROM inquiries i
                                            LEFT JOIN properties p ON i.property_id = p.id
                                            WHERE i.mobile IS NOT NULL AND i.mobile != ''
                                            ORDER BY i.created_at DESC";
                                        
                                        $stmt = $db->prepare($query);
                                        $stmt->execute();
                                        
                                        if ($stmt->rowCount() > 0) {
                                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                                echo "<tr>";
                                                echo "<td>" . htmlspecialchars($row['property_title'] ?? 'Unknown') . 
                                                      " (#" . htmlspecialchars($row['property_number'] ?? 'N/A') . ")</td>";
                                                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                                echo "<td>
                                                        <a href='mailto:" . htmlspecialchars($row['email']) . "'>
                                                            " . htmlspecialchars($row['email']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>
                                                        <a href='tel:" . htmlspecialchars($row['phone']) . "'>
                                                            " . htmlspecialchars($row['phone']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>" . date('M d, Y', strtotime($row['created_at'])) . "</td>";
                                                echo "<td>
                                                        <div class='btn-group'>
                                                            <a href='inquiries.php?view=" . $row['id'] . "' class='btn btn-sm btn-info'>
                                                                <i class='fas fa-eye'></i>
                                                            </a>
                                                            <a href='mailto:" . htmlspecialchars($row['email']) . "' class='btn btn-sm btn-primary'>
                                                                <i class='fas fa-envelope'></i>
                                                            </a>
                                                            <a href='tel:" . htmlspecialchars($row['phone']) . "' class='btn btn-sm btn-success'>
                                                                <i class='fas fa-phone'></i>
                                                            </a>
                                                        </div>
                                                      </td>";
                                                echo "</tr>";
                                            }
                                        } else {
                                            echo "<tr><td colspan='6' class='text-center'>No inquiry phone numbers found</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Contact Messages Tab -->
                <div class="tab-pane fade" id="contacts" role="tabpanel" aria-labelledby="contacts-tab">
                    <div class="card">
                        <div class="card-body">
                            <div class="table-responsive">
                                <table class="table table-striped table-hover" id="contactsPhoneTable">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Name</th>
                                            <th>Email</th>
                                            <th>Phone Number</th>
                                            <th>Date</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <?php
                                        // Query to get phone numbers from contact messages
                                        $query = "
                                            SELECT id, name, email, mobile as phone, subject, created_at, is_read
                                            FROM contact_messages
                                            WHERE mobile IS NOT NULL AND mobile != ''
                                            ORDER BY created_at DESC";
                                        
                                        $stmt = $db->prepare($query);
                                        $stmt->execute();
                                        
                                        if ($stmt->rowCount() > 0) {
                                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                                $rowClass = $row['is_read'] ? '' : 'table-warning';
                                                
                                                echo "<tr class='" . $rowClass . "'>";
                                                echo "<td>" . htmlspecialchars($row['subject'] ?? 'No Subject') . "</td>";
                                                echo "<td>" . htmlspecialchars($row['name']) . "</td>";
                                                echo "<td>
                                                        <a href='mailto:" . htmlspecialchars($row['email']) . "'>
                                                            " . htmlspecialchars($row['email']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>
                                                        <a href='tel:" . htmlspecialchars($row['phone']) . "'>
                                                            " . htmlspecialchars($row['phone']) . "
                                                        </a>
                                                      </td>";
                                                echo "<td>" . date('M d, Y', strtotime($row['created_at'])) . "</td>";
                                                echo "<td>
                                                        <div class='btn-group'>
                                                            <a href='contact-messages.php?view=" . $row['id'] . "' class='btn btn-sm btn-info'>
                                                                <i class='fas fa-eye'></i>
                                                            </a>
                                                            <a href='mailto:" . htmlspecialchars($row['email']) . "' class='btn btn-sm btn-primary'>
                                                                <i class='fas fa-envelope'></i>
                                                            </a>
                                                            <a href='tel:" . htmlspecialchars($row['phone']) . "' class='btn btn-sm btn-success'>
                                                                <i class='fas fa-phone'></i>
                                                            </a>
                                                        </div>
                                                      </td>";
                                                echo "</tr>";
                                            }
                                        } else {
                                            echo "<tr><td colspan='6' class='text-center'>No contact message phone numbers found</td></tr>";
                                        }
                                        ?>
                                    </tbody>
                                </table>
                            </div>
                        </div>
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
        // Initialize DataTables
        $('#allPhoneNumbersTable').DataTable({
            responsive: true,
            order: [[4, 'desc']], // Sort by date column descending
            language: {
                search: "Search phone numbers:"
            }
        });
        
        $('#inquiriesPhoneTable').DataTable({
            responsive: true,
            order: [[4, 'desc']], // Sort by date column descending
            language: {
                search: "Search inquiry phone numbers:"
            }
        });
        
        $('#contactsPhoneTable').DataTable({
            responsive: true,
            order: [[4, 'desc']], // Sort by date column descending
            language: {
                search: "Search contact phone numbers:"
            }
        });
    });
</script>

<?php include_once '../includes/footer.php'; ?>