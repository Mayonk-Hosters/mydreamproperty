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
                    <button type="button" class="btn btn-sm btn-outline-secondary dropdown-toggle me-2" data-bs-toggle="dropdown" aria-expanded="false">
                        <i class="fas fa-file-excel me-1"></i> Export
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="export-data.php?export=phone_numbers">All Phone Numbers</a></li>
                        <li><a class="dropdown-item" href="export-data.php?export=phone_numbers&source=Property+Inquiry">Property Inquiries Only</a></li>
                        <li><a class="dropdown-item" href="export-data.php?export=phone_numbers&source=Contact+Message">Contact Messages Only</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#customExportModal">Custom Export...</a></li>
                    </ul>
                    
                    <div class="btn-group me-2">
                        <button type="button" class="btn btn-sm btn-outline-primary" data-bs-toggle="modal" data-bs-target="#bulkSMSModal">
                            <i class="fas fa-sms me-1"></i> Bulk SMS
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" data-bs-toggle="modal" data-bs-target="#bulkEmailModal">
                            <i class="fas fa-envelope me-1"></i> Bulk Email
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- Phone Number Filters -->
            <div class="card mb-3">
                <div class="card-header bg-light">
                    <button class="btn btn-link text-decoration-none p-0" type="button" data-bs-toggle="collapse" data-bs-target="#filterCollapse" aria-expanded="false" aria-controls="filterCollapse">
                        <i class="fas fa-filter me-1"></i> Filter Phone Numbers
                    </button>
                </div>
                <div class="collapse" id="filterCollapse">
                    <div class="card-body">
                        <form id="phoneNumberFilterForm" method="get" class="row g-3">
                            <div class="col-md-3">
                                <label for="filterSource" class="form-label">Source</label>
                                <select class="form-select" id="filterSource" name="source">
                                    <option value="all" selected>All Sources</option>
                                    <option value="inquiry">Property Inquiries</option>
                                    <option value="contact">Contact Messages</option>
                                </select>
                            </div>
                            <div class="col-md-3">
                                <label for="filterDate" class="form-label">Date Range</label>
                                <select class="form-select" id="filterDate" name="date_range">
                                    <option value="all" selected>All Time</option>
                                    <option value="today">Today</option>
                                    <option value="yesterday">Yesterday</option>
                                    <option value="last7">Last 7 Days</option>
                                    <option value="last30">Last 30 Days</option>
                                    <option value="thismonth">This Month</option>
                                    <option value="lastmonth">Last Month</option>
                                    <option value="custom">Custom Range</option>
                                </select>
                            </div>
                            <div class="col-md-3 custom-date-range d-none">
                                <label for="dateFrom" class="form-label">From Date</label>
                                <input type="date" class="form-control" id="dateFrom" name="date_from">
                            </div>
                            <div class="col-md-3 custom-date-range d-none">
                                <label for="dateTo" class="form-label">To Date</label>
                                <input type="date" class="form-control" id="dateTo" name="date_to">
                            </div>
                            <div class="col-12">
                                <button type="submit" class="btn btn-primary">Apply Filters</button>
                                <button type="reset" class="btn btn-secondary">Reset</button>
                            </div>
                        </form>
                    </div>
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

<!-- Custom Export Modal -->
<div class="modal fade" id="customExportModal" tabindex="-1" aria-labelledby="customExportModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="customExportModalLabel">Custom Export</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form action="export-data.php" method="get">
                <input type="hidden" name="export" value="phone_numbers">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="exportSource" class="form-label">Source</label>
                        <select class="form-select" id="exportSource" name="source">
                            <option value="all" selected>All Sources</option>
                            <option value="Property Inquiry">Property Inquiries Only</option>
                            <option value="Contact Message">Contact Messages Only</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="exportDateFrom" class="form-label">From Date</label>
                        <input type="date" class="form-control" id="exportDateFrom" name="date_from">
                    </div>
                    <div class="mb-3">
                        <label for="exportDateTo" class="form-label">To Date</label>
                        <input type="date" class="form-control" id="exportDateTo" name="date_to">
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Export</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Bulk SMS Modal -->
<div class="modal fade" id="bulkSMSModal" tabindex="-1" aria-labelledby="bulkSMSModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="bulkSMSModalLabel">Send Bulk SMS</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="bulkSMSForm" method="post">
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> This feature allows you to send SMS messages to multiple recipients. 
                        Please ensure you have the recipients' consent before sending marketing messages.
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Recipients</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="smsRecipientType" id="smsAllNumbers" value="all" checked>
                            <label class="form-check-label" for="smsAllNumbers">
                                All Phone Numbers
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="smsRecipientType" id="smsInquiryNumbers" value="inquiry">
                            <label class="form-check-label" for="smsInquiryNumbers">
                                Property Inquiry Numbers Only
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="smsRecipientType" id="smsContactNumbers" value="contact">
                            <label class="form-check-label" for="smsContactNumbers">
                                Contact Message Numbers Only
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="smsRecipientType" id="smsSelectedNumbers" value="selected">
                            <label class="form-check-label" for="smsSelectedNumbers">
                                Selected Numbers
                            </label>
                        </div>
                        <div class="mt-2 d-none" id="smsSelectedNumbersContainer">
                            <textarea class="form-control" id="smsSelectedNumbersList" name="selected_numbers" rows="3" placeholder="Enter phone numbers separated by commas"></textarea>
                            <small class="form-text text-muted">Enter phone numbers in international format (e.g., +919876543210) separated by commas.</small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="smsMessage" class="form-label">Message</label>
                        <textarea class="form-control" id="smsMessage" name="sms_message" rows="5" required></textarea>
                        <div class="d-flex justify-content-between mt-1">
                            <small class="form-text text-muted">
                                <span id="smsCharCount">0</span>/160 characters
                            </small>
                            <small class="form-text text-muted">
                                <span id="smsMessageCount">1</span> message(s)
                            </small>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="smsTemplate" class="form-label">Use Template</label>
                        <select class="form-select" id="smsTemplate">
                            <option value="">Select a template...</option>
                            <option value="Hi {name}, thank you for your interest in our properties. We have new listings that might interest you. Visit our website for more details.">New Listings Notification</option>
                            <option value="Hi {name}, we're offering special discounts on selected properties this month. Contact us for more information.">Special Offer</option>
                            <option value="Hi {name}, just a reminder about your property inquiry. Our team is available to answer any questions you may have.">Inquiry Follow-up</option>
                            <option value="Hi {name}, thank you for contacting My Dream Property. We have received your message and will get back to you shortly.">Thank You Message</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="smsConfirmation" required>
                            <label class="form-check-label" for="smsConfirmation">
                                I confirm that I have permission to send SMS messages to these recipients
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Send SMS</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Bulk Email Modal -->
<div class="modal fade" id="bulkEmailModal" tabindex="-1" aria-labelledby="bulkEmailModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="bulkEmailModalLabel">Send Bulk Email</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form id="bulkEmailForm" method="post">
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i> This feature allows you to send email messages to multiple recipients. 
                        Please ensure you have the recipients' consent before sending marketing messages.
                    </div>
                    
                    <div class="mb-3">
                        <label class="form-label">Recipients</label>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="emailRecipientType" id="emailAllContacts" value="all" checked>
                            <label class="form-check-label" for="emailAllContacts">
                                All Contacts
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="emailRecipientType" id="emailInquiryContacts" value="inquiry">
                            <label class="form-check-label" for="emailInquiryContacts">
                                Property Inquiry Contacts Only
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="emailRecipientType" id="emailContactMessageContacts" value="contact">
                            <label class="form-check-label" for="emailContactMessageContacts">
                                Contact Message Contacts Only
                            </label>
                        </div>
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="emailRecipientType" id="emailSelectedContacts" value="selected">
                            <label class="form-check-label" for="emailSelectedContacts">
                                Selected Contacts
                            </label>
                        </div>
                        <div class="mt-2 d-none" id="emailSelectedContactsContainer">
                            <textarea class="form-control" id="emailSelectedContactsList" name="selected_emails" rows="3" placeholder="Enter email addresses separated by commas"></textarea>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailSubject" class="form-label">Subject</label>
                        <input type="text" class="form-control" id="emailSubject" name="email_subject" required>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailMessage" class="form-label">Message</label>
                        <textarea class="form-control" id="emailMessage" name="email_message" rows="8" required></textarea>
                    </div>
                    
                    <div class="mb-3">
                        <label for="emailTemplate" class="form-label">Use Template</label>
                        <select class="form-select" id="emailTemplate">
                            <option value="">Select a template...</option>
                            <option value="new-listings">New Listings Announcement</option>
                            <option value="special-offer">Special Offer</option>
                            <option value="inquiry-followup">Inquiry Follow-up</option>
                            <option value="newsletter">Monthly Newsletter</option>
                        </select>
                    </div>
                    
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" id="emailConfirmation" required>
                            <label class="form-check-label" for="emailConfirmation">
                                I confirm that I have permission to send emails to these recipients
                            </label>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Send Email</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Add JavaScript for interactive features -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Date range filter functionality
        const dateRangeSelect = document.getElementById('filterDate');
        const customDateFields = document.querySelectorAll('.custom-date-range');
        
        dateRangeSelect.addEventListener('change', function() {
            if (this.value === 'custom') {
                customDateFields.forEach(field => field.classList.remove('d-none'));
            } else {
                customDateFields.forEach(field => field.classList.add('d-none'));
            }
        });
        
        // SMS character counter
        const smsMessage = document.getElementById('smsMessage');
        const smsCharCount = document.getElementById('smsCharCount');
        const smsMessageCount = document.getElementById('smsMessageCount');
        
        smsMessage.addEventListener('input', function() {
            const length = this.value.length;
            smsCharCount.textContent = length;
            
            // Calculate number of messages (standard SMS is 160 characters)
            const messageCount = Math.ceil(length / 160);
            smsMessageCount.textContent = messageCount;
        });
        
        // SMS template selector
        const smsTemplate = document.getElementById('smsTemplate');
        
        smsTemplate.addEventListener('change', function() {
            if (this.value) {
                smsMessage.value = this.value;
                // Trigger the input event to update character count
                smsMessage.dispatchEvent(new Event('input'));
            }
        });
        
        // Email template selector
        const emailTemplate = document.getElementById('emailTemplate');
        const emailSubject = document.getElementById('emailSubject');
        const emailMessage = document.getElementById('emailMessage');
        
        emailTemplate.addEventListener('change', function() {
            if (this.value) {
                switch(this.value) {
                    case 'new-listings':
                        emailSubject.value = 'New Property Listings from My Dream Property';
                        emailMessage.value = 'Dear {name},\n\nWe are excited to share our latest property listings with you. Visit our website to see these new properties that might interest you.\n\nHere are some of our featured new listings:\n\n- [Property 1 Details]\n- [Property 2 Details]\n- [Property 3 Details]\n\nClick here to view all our listings: [Website Link]\n\nIf you have any questions, please don\'t hesitate to contact us.\n\nBest Regards,\nThe My Dream Property Team';
                        break;
                    case 'special-offer':
                        emailSubject.value = 'Special Offer - Limited Time Discount on Selected Properties';
                        emailMessage.value = 'Dear {name},\n\nWe are offering special discounts on selected properties for a limited time. Don\'t miss this opportunity to find your dream property at an amazing price.\n\nContact us now to learn more about these special offers.\n\nBest Regards,\nThe My Dream Property Team';
                        break;
                    case 'inquiry-followup':
                        emailSubject.value = 'Follow-up on Your Property Inquiry';
                        emailMessage.value = 'Dear {name},\n\nThank you for your recent inquiry about our properties. We wanted to follow up and see if you have any additional questions or if there\'s any way we can assist you further.\n\nOur team is always available to help you find your dream property.\n\nBest Regards,\nThe My Dream Property Team';
                        break;
                    case 'newsletter':
                        emailSubject.value = 'My Dream Property - Monthly Newsletter';
                        emailMessage.value = 'Dear {name},\n\nWelcome to our monthly newsletter! Here\'s what\'s happening in the real estate market this month:\n\n- Market Trends: [Brief Overview]\n- Featured Properties: [List of Properties]\n- Neighborhood Spotlight: [Neighborhood Details]\n- Real Estate Tips: [Useful Information]\n\nThank you for being a valued contact. If you have any questions or are interested in any properties, please don\'t hesitate to reach out.\n\nBest Regards,\nThe My Dream Property Team';
                        break;
                }
            }
        });
        
        // SMS recipient selection
        const smsSelectedNumbers = document.getElementById('smsSelectedNumbers');
        const smsSelectedNumbersContainer = document.getElementById('smsSelectedNumbersContainer');
        
        document.querySelectorAll('input[name="smsRecipientType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'selected') {
                    smsSelectedNumbersContainer.classList.remove('d-none');
                } else {
                    smsSelectedNumbersContainer.classList.add('d-none');
                }
            });
        });
        
        // Email recipient selection
        const emailSelectedContacts = document.getElementById('emailSelectedContacts');
        const emailSelectedContactsContainer = document.getElementById('emailSelectedContactsContainer');
        
        document.querySelectorAll('input[name="emailRecipientType"]').forEach(radio => {
            radio.addEventListener('change', function() {
                if (this.value === 'selected') {
                    emailSelectedContactsContainer.classList.remove('d-none');
                } else {
                    emailSelectedContactsContainer.classList.add('d-none');
                }
            });
        });
        
        // Form submissions
        document.getElementById('bulkSMSForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally send the form data to a server-side script
            // For now, we'll just show a success message
            alert('SMS messages would be sent to selected recipients. This feature requires integration with an SMS gateway.');
            document.getElementById('bulkSMSModal').querySelector('.btn-close').click();
        });
        
        document.getElementById('bulkEmailForm').addEventListener('submit', function(e) {
            e.preventDefault();
            // Here you would normally send the form data to a server-side script
            // For now, we'll just show a success message
            alert('Email messages would be sent to selected recipients. This feature requires integration with an email service.');
            document.getElementById('bulkEmailModal').querySelector('.btn-close').click();
        });
    });
</script>

<?php include_once '../includes/footer.php'; ?>