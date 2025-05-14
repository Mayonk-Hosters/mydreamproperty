<?php
/**
 * Header template file
 * 
 * Contains the opening HTML, head section, and navigation
 */

// Initialize session if not already started
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Get contact info for site name
require_once 'config/database.php';
require_once 'models/ContactInfo.php';

$database = new Database();
$db = $database->getConnection();

$contactInfo = new ContactInfo($db);
$contactInfo->getContactInfo();
$siteName = $contactInfo->site_name ?? 'My Dream Property';

// Determine current page for active nav links
$current_page = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($page_title) ? $page_title . ' | ' . $siteName : $siteName; ?></title>
    <!-- Bootstrap CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- Font Awesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <!-- Custom CSS -->
    <link href="/assets/css/style.css" rel="stylesheet">
    <!-- Favicon -->
    <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon">
</head>
<body>
    <!-- Header Area -->
    <header>
        <!-- Top Bar -->
        <div class="top-bar bg-dark text-white py-2">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-md-6">
                        <div class="contact-info">
                            <span class="me-3"><i class="fas fa-phone me-2"></i><?php echo $contactInfo->phone1 ?? ''; ?></span>
                            <span><i class="fas fa-envelope me-2"></i><?php echo $contactInfo->email1 ?? ''; ?></span>
                        </div>
                    </div>
                    <div class="col-md-6 text-md-end">
                        <div class="social-icons">
                            <a href="#" class="text-white me-2"><i class="fab fa-facebook-f"></i></a>
                            <a href="#" class="text-white me-2"><i class="fab fa-twitter"></i></a>
                            <a href="#" class="text-white me-2"><i class="fab fa-instagram"></i></a>
                            <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Navigation -->
        <nav class="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div class="container">
                <a class="navbar-brand" href="/">
                    <img src="/assets/images/logo.png" alt="<?php echo $siteName; ?>" height="50">
                </a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarMain" aria-controls="navbarMain" aria-expanded="false" aria-label="Toggle navigation">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarMain">
                    <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
                        <li class="nav-item">
                            <a class="nav-link <?php echo $current_page === 'index.php' ? 'active' : ''; ?>" href="/">Home</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link <?php echo $current_page === 'properties.php' ? 'active' : ''; ?>" href="/properties.php">Properties</a>
                        </li>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="servicesDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                Services
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="servicesDropdown">
                                <li><a class="dropdown-item" href="/services/buying.php">Buying</a></li>
                                <li><a class="dropdown-item" href="/services/selling.php">Selling</a></li>
                                <li><a class="dropdown-item" href="/services/renting.php">Renting</a></li>
                                <li><a class="dropdown-item" href="/services/rental-agreement.php">Rental Agreement</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="/property-calculator.php">Property Calculator</a></li>
                            </ul>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link <?php echo $current_page === 'neighborhood-comparison.php' ? 'active' : ''; ?>" href="/neighborhood-comparison.php">Neighborhood Comparison</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link <?php echo $current_page === 'contact.php' ? 'active' : ''; ?>" href="/contact.php">Contact</a>
                        </li>
                        <?php if (isset($_SESSION['user_id']) && $_SESSION['is_admin']): ?>
                        <li class="nav-item">
                            <a class="nav-link <?php echo strpos($current_page, 'admin/') !== false ? 'active' : ''; ?>" href="/admin/dashboard.php">Admin</a>
                        </li>
                        <?php endif; ?>
                        <?php if (isset($_SESSION['user_id'])): ?>
                        <li class="nav-item dropdown">
                            <a class="nav-link dropdown-toggle" href="#" id="accountDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                                <i class="fas fa-user-circle me-1"></i> Account
                            </a>
                            <ul class="dropdown-menu" aria-labelledby="accountDropdown">
                                <li><a class="dropdown-item" href="/account/profile.php">My Profile</a></li>
                                <li><a class="dropdown-item" href="/account/inquiries.php">My Inquiries</a></li>
                                <li><a class="dropdown-item" href="/account/saved-properties.php">Saved Properties</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="/logout.php">Logout</a></li>
                            </ul>
                        </li>
                        <?php else: ?>
                        <li class="nav-item">
                            <a class="nav-link btn btn-outline-primary ms-lg-2" href="/login.php">Login / Register</a>
                        </li>
                        <?php endif; ?>
                    </ul>
                </div>
            </div>
        </nav>
    </header>
    <!-- End Header Area -->