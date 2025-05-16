<?php
// php_conversion/check_mobile_field.php
// Diagnostic script to check and fix mobile number field issues

// Include header for styling
include_once 'includes/header.php';

// Include database connection
require_once 'config/database.php';

// Create database connection
$database = new Database();
$db = $database->getConnection();

echo '<div class="container mt-4">';
echo '<h1>Mobile Number Field Diagnostic Tool</h1>';
echo '<p class="lead">This tool checks and fixes mobile number field issues in your database.</p>';

// Step 1: Check if mobile column exists in inquiries table
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 1: Check Database Structure</h5>';
echo '</div>';
echo '<div class="card-body">';

$query = "SHOW COLUMNS FROM inquiries LIKE 'mobile'";
$stmt = $db->prepare($query);
$stmt->execute();

if ($stmt->rowCount() > 0) {
    // Column exists
    $column = $stmt->fetch(PDO::FETCH_ASSOC);
    echo '<div class="alert alert-success">';
    echo '<i class="fas fa-check-circle me-2"></i> Mobile column exists in inquiries table!';
    echo '</div>';
    echo '<p>Column details:</p>';
    echo '<ul>';
    foreach ($column as $key => $value) {
        echo '<li><strong>' . $key . ':</strong> ' . $value . '</li>';
    }
    echo '</ul>';
} else {
    // Column doesn't exist
    echo '<div class="alert alert-danger">';
    echo '<i class="fas fa-exclamation-triangle me-2"></i> Mobile column does NOT exist in inquiries table!';
    echo '</div>';
    
    // Add the column
    echo '<p>Attempting to add mobile column...</p>';
    
    $addColumnQuery = "ALTER TABLE inquiries ADD COLUMN mobile VARCHAR(20) AFTER email";
    
    try {
        $db->exec($addColumnQuery);
        echo '<div class="alert alert-success">';
        echo '<i class="fas fa-check-circle me-2"></i> Successfully added mobile column to inquiries table!';
        echo '</div>';
    } catch (PDOException $e) {
        echo '<div class="alert alert-danger">';
        echo '<i class="fas fa-times-circle me-2"></i> Failed to add mobile column: ' . $e->getMessage();
        echo '</div>';
    }
}

echo '</div>'; // card-body
echo '</div>'; // card

// Step 2: Check existing inquiries data
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 2: Check Existing Inquiries Data</h5>';
echo '</div>';
echo '<div class="card-body">';

$query = "SELECT id, name, email, mobile, created_at FROM inquiries ORDER BY id DESC";
$stmt = $db->prepare($query);
$stmt->execute();
$inquiries = $stmt->fetchAll(PDO::FETCH_ASSOC);

if (count($inquiries) > 0) {
    echo '<p>Found ' . count($inquiries) . ' inquiries in the database:</p>';
    
    echo '<div class="table-responsive">';
    echo '<table class="table table-striped table-bordered">';
    echo '<thead class="table-dark">';
    echo '<tr>';
    echo '<th>ID</th>';
    echo '<th>Name</th>';
    echo '<th>Email</th>';
    echo '<th>Mobile</th>';
    echo '<th>Created At</th>';
    echo '</tr>';
    echo '</thead>';
    echo '<tbody>';
    
    $mobileCount = 0;
    foreach ($inquiries as $inquiry) {
        echo '<tr>';
        echo '<td>' . $inquiry['id'] . '</td>';
        echo '<td>' . htmlspecialchars($inquiry['name']) . '</td>';
        echo '<td>' . htmlspecialchars($inquiry['email']) . '</td>';
        
        if (!empty($inquiry['mobile'])) {
            $mobileCount++;
            echo '<td class="table-success">' . htmlspecialchars($inquiry['mobile']) . '</td>';
        } else {
            echo '<td class="table-danger">Not provided</td>';
        }
        
        echo '<td>' . date('Y-m-d H:i:s', strtotime($inquiry['created_at'])) . '</td>';
        echo '</tr>';
    }
    
    echo '</tbody>';
    echo '</table>';
    echo '</div>';
    
    // Statistics
    echo '<div class="alert ' . ($mobileCount > 0 ? 'alert-info' : 'alert-warning') . ' mt-3">';
    echo '<h5><i class="fas fa-chart-pie me-2"></i> Statistics</h5>';
    echo '<ul>';
    echo '<li>Total inquiries: ' . count($inquiries) . '</li>';
    echo '<li>Inquiries with mobile numbers: ' . $mobileCount . ' (' . round(($mobileCount / count($inquiries)) * 100, 1) . '%)</li>';
    echo '<li>Inquiries without mobile numbers: ' . (count($inquiries) - $mobileCount) . ' (' . round(((count($inquiries) - $mobileCount) / count($inquiries)) * 100, 1) . '%)</li>';
    echo '</ul>';
    echo '</div>';
    
    if ($mobileCount == 0) {
        echo '<div class="alert alert-warning">';
        echo '<i class="fas fa-exclamation-triangle me-2"></i> <strong>Warning:</strong> No mobile numbers found in any inquiries!';
        echo '<p class="mb-0">This suggests that either:</p>';
        echo '<ul class="mb-0">';
        echo '<li>The inquiry form is not collecting mobile numbers</li>';
        echo '<li>The mobile field is not being saved to the database</li>';
        echo '</ul>';
        echo '</div>';
    }
} else {
    echo '<div class="alert alert-info">';
    echo '<i class="fas fa-info-circle me-2"></i> No inquiries found in the database.';
    echo '</div>';
}

echo '</div>'; // card-body
echo '</div>'; // card

// Step 3: Check inquiry form
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 3: Check Inquiry Form</h5>';
echo '</div>';
echo '<div class="card-body">';

// Check if property.php file exists and contains mobile field
$propertyFilePath = 'property.php';
if (file_exists($propertyFilePath)) {
    $propertyFileContent = file_get_contents($propertyFilePath);
    
    if (strpos($propertyFileContent, 'name="mobile"') !== false) {
        echo '<div class="alert alert-success">';
        echo '<i class="fas fa-check-circle me-2"></i> The property inquiry form includes a mobile field!';
        echo '</div>';
    } else {
        echo '<div class="alert alert-danger">';
        echo '<i class="fas fa-times-circle me-2"></i> The property inquiry form does NOT include a mobile field!';
        echo '</div>';
        
        echo '<p>Recommended fix: Add the following code to your property inquiry form in property.php:</p>';
        
        echo '<pre class="bg-light p-3 border rounded"><code>&lt;div class="mb-3"&gt;
    &lt;label for="mobile" class="form-label"&gt;Mobile Number *&lt;/label&gt;
    &lt;input type="tel" class="form-control" id="mobile" name="mobile" required
           placeholder="Enter your mobile number"&gt;
&lt;/div&gt;</code></pre>';
    }
} else {
    echo '<div class="alert alert-warning">';
    echo '<i class="fas fa-exclamation-triangle me-2"></i> Could not find property.php file to check the inquiry form.';
    echo '</div>';
}

echo '</div>'; // card-body
echo '</div>'; // card

// Step 4: Check inquiry processing code
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 4: Check Inquiry Processing Code</h5>';
echo '</div>';
echo '<div class="card-body">';

// Check if api/inquiries.php file exists and correctly processes mobile field
$inquiriesApiPath = 'api/inquiries.php';
if (file_exists($inquiriesApiPath)) {
    $inquiriesApiContent = file_get_contents($inquiriesApiPath);
    
    if (strpos($inquiriesApiContent, '$_POST[\'mobile\']') !== false || 
        strpos($inquiriesApiContent, '"mobile"') !== false) {
        echo '<div class="alert alert-success">';
        echo '<i class="fas fa-check-circle me-2"></i> The inquiry API code processes the mobile field!';
        echo '</div>';
    } else {
        echo '<div class="alert alert-danger">';
        echo '<i class="fas fa-times-circle me-2"></i> The inquiry API code does NOT process the mobile field!';
        echo '</div>';
        
        echo '<p>Recommended fix: Add mobile field processing to api/inquiries.php:</p>';
        
        echo '<pre class="bg-light p-3 border rounded"><code>// Add this line with the other form field processing
$inquiry->mobile = isset($_POST[\'mobile\']) ? $_POST[\'mobile\'] : \'\';</code></pre>';
    }
} else {
    echo '<div class="alert alert-warning">';
    echo '<i class="fas fa-exclamation-triangle me-2"></i> Could not find api/inquiries.php file to check the API code.';
    echo '</div>';
}

echo '</div>'; // card-body
echo '</div>'; // card

// Step 5: Test form submission
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 5: Test Inquiry Submission</h5>';
echo '</div>';
echo '<div class="card-body">';

echo '<p>Use this form to test if mobile numbers are correctly saved:</p>';

echo '<form method="post" action="' . htmlspecialchars($_SERVER["PHP_SELF"]) . '">';
echo '<div class="row mb-3">';
echo '<div class="col-md-6">';
echo '<label for="test_name" class="form-label">Name</label>';
echo '<input type="text" class="form-control" id="test_name" name="test_name" value="Test User" required>';
echo '</div>';
echo '<div class="col-md-6">';
echo '<label for="test_email" class="form-label">Email</label>';
echo '<input type="email" class="form-control" id="test_email" name="test_email" value="test@example.com" required>';
echo '</div>';
echo '</div>';

echo '<div class="mb-3">';
echo '<label for="test_mobile" class="form-label">Mobile Number</label>';
echo '<input type="tel" class="form-control" id="test_mobile" name="test_mobile" value="9876543210" required>';
echo '</div>';

echo '<div class="mb-3">';
echo '<label for="test_message" class="form-label">Message</label>';
echo '<textarea class="form-control" id="test_message" name="test_message" rows="3" required>This is a test inquiry message.</textarea>';
echo '</div>';

echo '<button type="submit" name="test_submit" class="btn btn-primary">Submit Test Inquiry</button>';
echo '</form>';

// Process test form submission
if (isset($_POST['test_submit'])) {
    // Get test data
    $test_name = $_POST['test_name'] ?? '';
    $test_email = $_POST['test_email'] ?? '';
    $test_mobile = $_POST['test_mobile'] ?? '';
    $test_message = $_POST['test_message'] ?? '';
    
    if (!empty($test_name) && !empty($test_email) && !empty($test_mobile) && !empty($test_message)) {
        // Insert test inquiry directly into database
        $query = "INSERT INTO inquiries (property_id, name, email, mobile, message) VALUES (?, ?, ?, ?, ?)";
        $stmt = $db->prepare($query);
        
        // Use first property ID as test
        $firstPropertyId = 1;
        $stmt->bindParam(1, $firstPropertyId);
        $stmt->bindParam(2, $test_name);
        $stmt->bindParam(3, $test_email);
        $stmt->bindParam(4, $test_mobile);
        $stmt->bindParam(5, $test_message);
        
        if ($stmt->execute()) {
            $newInquiryId = $db->lastInsertId();
            
            echo '<div class="alert alert-success mt-3">';
            echo '<i class="fas fa-check-circle me-2"></i> Test inquiry created successfully with ID: ' . $newInquiryId;
            echo '</div>';
            
            // Verify the mobile was saved correctly
            $verifyQuery = "SELECT id, name, email, mobile FROM inquiries WHERE id = ?";
            $verifyStmt = $db->prepare($verifyQuery);
            $verifyStmt->bindParam(1, $newInquiryId);
            $verifyStmt->execute();
            
            if ($verifyRow = $verifyStmt->fetch(PDO::FETCH_ASSOC)) {
                echo '<div class="table-responsive mt-3">';
                echo '<table class="table table-bordered">';
                echo '<tr><th>Field</th><th>Submitted</th><th>Saved</th><th>Status</th></tr>';
                
                echo '<tr>';
                echo '<td>Name</td>';
                echo '<td>' . htmlspecialchars($test_name) . '</td>';
                echo '<td>' . htmlspecialchars($verifyRow['name']) . '</td>';
                echo '<td>' . ($test_name === $verifyRow['name'] ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>';
                echo '</tr>';
                
                echo '<tr>';
                echo '<td>Email</td>';
                echo '<td>' . htmlspecialchars($test_email) . '</td>';
                echo '<td>' . htmlspecialchars($verifyRow['email']) . '</td>';
                echo '<td>' . ($test_email === $verifyRow['email'] ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>';
                echo '</tr>';
                
                echo '<tr>';
                echo '<td>Mobile</td>';
                echo '<td>' . htmlspecialchars($test_mobile) . '</td>';
                echo '<td>' . htmlspecialchars($verifyRow['mobile']) . '</td>';
                echo '<td>' . ($test_mobile === $verifyRow['mobile'] ? '<span class="text-success">✓</span>' : '<span class="text-danger">✗</span>') . '</td>';
                echo '</tr>';
                
                echo '</table>';
                echo '</div>';
                
                if ($test_mobile === $verifyRow['mobile']) {
                    echo '<div class="alert alert-success mt-3">';
                    echo '<i class="fas fa-check-circle me-2"></i> <strong>Success!</strong> Mobile number was correctly saved to the database.';
                    echo '</div>';
                } else {
                    echo '<div class="alert alert-danger mt-3">';
                    echo '<i class="fas fa-times-circle me-2"></i> <strong>Problem detected!</strong> Mobile number was not correctly saved to the database.';
                    echo '</div>';
                }
            }
        } else {
            echo '<div class="alert alert-danger mt-3">';
            echo '<i class="fas fa-times-circle me-2"></i> Failed to create test inquiry: ' . implode(', ', $stmt->errorInfo());
            echo '</div>';
        }
    }
}

echo '</div>'; // card-body
echo '</div>'; // card

// Step 6: Summary and recommendations
echo '<div class="card mb-4">';
echo '<div class="card-header bg-primary text-white">';
echo '<h5 class="mb-0">Step 6: Summary and Recommendations</h5>';
echo '</div>';
echo '<div class="card-body">';

echo '<h5>Key Findings</h5>';
echo '<ul>';
// You'd have these variables set from the earlier checks
echo '<li>Database column for mobile: ' . ($stmt->rowCount() > 0 ? '<span class="text-success">Exists</span>' : '<span class="text-danger">Missing</span>') . '</li>';
echo '<li>Mobile numbers in existing inquiries: ' . ($mobileCount > 0 ? '<span class="text-success">Found</span>' : '<span class="text-danger">None found</span>') . '</li>';
// Other findings would be determined by the code checks above
echo '</ul>';

echo '<h5>Recommendations</h5>';
echo '<ol>';
echo '<li>Ensure your property.php inquiry form includes the mobile field</li>';
echo '<li>Make sure api/inquiries.php processes the mobile field correctly</li>';
echo '<li>Check your Inquiry model (models/Inquiry.php) includes mobile in its properties and methods</li>';
echo '</ol>';

echo '<div class="alert alert-info">';
echo '<h5><i class="fas fa-info-circle me-2"></i> Next Steps</h5>';
echo '<p>After fixing the issues, test the property inquiry form by submitting a real inquiry with a mobile number.</p>';
echo '<p>Then check the admin panel to confirm the mobile number is being displayed.</p>';
echo '</div>';

echo '</div>'; // card-body
echo '</div>'; // card

echo '<p><a href="admin/phone-numbers.php" class="btn btn-lg btn-primary">Go to Phone Numbers</a></p>';

echo '</div>'; // container

// Include footer
include_once 'includes/footer.php';
?>