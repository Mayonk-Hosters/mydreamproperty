    <!-- Footer Area -->
    <footer class="bg-dark text-white pt-5 pb-3">
        <div class="container">
            <div class="row">
                <div class="col-md-4 mb-4">
                    <h5>About <?php echo $siteName; ?></h5>
                    <p>We are a leading real estate agency committed to helping you find your dream property. With years of experience, we provide exceptional service to buyers, sellers, and renters.</p>
                    <div class="social-icons mt-3">
                        <a href="#" class="text-white me-3"><i class="fab fa-facebook-f"></i></a>
                        <a href="#" class="text-white me-3"><i class="fab fa-twitter"></i></a>
                        <a href="#" class="text-white me-3"><i class="fab fa-instagram"></i></a>
                        <a href="#" class="text-white"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>
                <div class="col-md-4 mb-4">
                    <h5>Quick Links</h5>
                    <ul class="list-unstyled">
                        <li><a href="/" class="text-white">Home</a></li>
                        <li><a href="/properties.php" class="text-white">Properties</a></li>
                        <li><a href="/services/buying.php" class="text-white">Buying</a></li>
                        <li><a href="/services/selling.php" class="text-white">Selling</a></li>
                        <li><a href="/services/renting.php" class="text-white">Renting</a></li>

                        <li><a href="/contact.php" class="text-white">Contact Us</a></li>
                        <li><a href="/agents.php" class="text-white">Our Agents</a></li>
                    </ul>
                </div>
                <div class="col-md-4 mb-4">
                    <h5>Contact Info</h5>
                    <address>
                        <p><i class="fas fa-map-marker-alt me-2"></i> <?php echo $contactInfo->address ?? ''; ?></p>
                        <p><i class="fas fa-phone me-2"></i> <?php echo $contactInfo->phone1 ?? ''; ?></p>
                        <?php if (isset($contactInfo->phone2) && !empty($contactInfo->phone2)): ?>
                        <p><i class="fas fa-phone me-2"></i> <?php echo $contactInfo->phone2; ?></p>
                        <?php endif; ?>
                        <p><i class="fas fa-envelope me-2"></i> <?php echo $contactInfo->email1 ?? ''; ?></p>
                        <?php if (isset($contactInfo->email2) && !empty($contactInfo->email2)): ?>
                        <p><i class="fas fa-envelope me-2"></i> <?php echo $contactInfo->email2; ?></p>
                        <?php endif; ?>
                    </address>
                    <?php if (isset($contactInfo->map_url) && !empty($contactInfo->map_url)): ?>
                    <p><a href="<?php echo $contactInfo->map_url; ?>" class="btn btn-outline-light btn-sm" target="_blank">View on Map</a></p>
                    <?php endif; ?>
                </div>
            </div>
            <hr>
            <div class="row">
                <div class="col-md-6 mb-2 mb-md-0">
                    <p class="mb-0">&copy; <?php echo date('Y'); ?> <?php echo $siteName; ?>. All rights reserved.</p>
                </div>
                <div class="col-md-6 text-md-end">
                    <ul class="list-inline mb-0">
                        <li class="list-inline-item"><a href="/privacy-policy.php" class="text-white">Privacy Policy</a></li>
                        <li class="list-inline-item"><a href="/terms-of-service.php" class="text-white">Terms of Service</a></li>
                        <li class="list-inline-item"><a href="/admin" class="text-white">Admin</a></li>
                    </ul>
                </div>
            </div>
        </div>
    </footer>
    <!-- End Footer Area -->

    <!-- Bootstrap JS -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <!-- Custom JS -->
    <script src="/assets/js/main.js"></script>
</body>
</html>