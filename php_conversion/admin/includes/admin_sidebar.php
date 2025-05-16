<div class="col-md-3 col-lg-2 d-md-block bg-light sidebar collapse">
    <div class="position-sticky pt-3">
        <ul class="nav flex-column">
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'index.php' ? 'active' : ''; ?>" href="index.php">
                    <i class="fas fa-tachometer-alt me-2"></i>
                    Dashboard
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'properties.php' ? 'active' : ''; ?>" href="properties.php">
                    <i class="fas fa-home me-2"></i>
                    Properties
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'property-types.php' ? 'active' : ''; ?>" href="property-types.php">
                    <i class="fas fa-tags me-2"></i>
                    Property Types
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'inquiries.php' ? 'active' : ''; ?>" href="inquiries.php">
                    <i class="fas fa-question-circle me-2"></i>
                    Property Inquiries
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'phone-numbers.php' ? 'active' : ''; ?>" href="phone-numbers.php">
                    <i class="fas fa-phone me-2"></i>
                    Phone Numbers
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'contact-messages.php' ? 'active' : ''; ?>" href="contact-messages.php">
                    <i class="fas fa-envelope me-2"></i>
                    Contact Messages
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'agents.php' ? 'active' : ''; ?>" href="agents.php">
                    <i class="fas fa-user-tie me-2"></i>
                    Agents
                </a>
            </li>
        </ul>

        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Location Management</span>
        </h6>
        <ul class="nav flex-column mb-2">
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'states.php' ? 'active' : ''; ?>" href="states.php">
                    <i class="fas fa-map-marker-alt me-2"></i>
                    States
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'districts.php' ? 'active' : ''; ?>" href="districts.php">
                    <i class="fas fa-map me-2"></i>
                    Districts
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'talukas.php' ? 'active' : ''; ?>" href="talukas.php">
                    <i class="fas fa-map-signs me-2"></i>
                    Talukas
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'tehsils.php' ? 'active' : ''; ?>" href="tehsils.php">
                    <i class="fas fa-street-view me-2"></i>
                    Tehsils
                </a>
            </li>
        </ul>

        <h6 class="sidebar-heading d-flex justify-content-between align-items-center px-3 mt-4 mb-1 text-muted">
            <span>Configuration</span>
        </h6>
        <ul class="nav flex-column mb-2">
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'users.php' ? 'active' : ''; ?>" href="users.php">
                    <i class="fas fa-users me-2"></i>
                    Users
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'contact-info.php' ? 'active' : ''; ?>" href="contact-info.php">
                    <i class="fas fa-address-card me-2"></i>
                    Contact Info
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link <?php echo basename($_SERVER['PHP_SELF']) === 'neighborhoods.php' ? 'active' : ''; ?>" href="neighborhoods.php">
                    <i class="fas fa-city me-2"></i>
                    Neighborhoods
                </a>
            </li>
        </ul>
        
        <div class="mt-4 px-3">
            <a href="../index.php" class="btn btn-outline-secondary btn-sm w-100">
                <i class="fas fa-external-link-alt me-1"></i> View Website
            </a>
        </div>
        <div class="mt-2 px-3">
            <a href="../api/auth.php?logout" class="btn btn-danger btn-sm w-100">
                <i class="fas fa-sign-out-alt me-1"></i> Logout
            </a>
        </div>
    </div>
</div>