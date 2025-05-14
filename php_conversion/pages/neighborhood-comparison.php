<?php
/**
 * Neighborhood Comparison Page
 */
$page_title = "Neighborhood Comparison";
include_once 'includes/header.php';
?>

<!-- Main Content -->
<div class="container my-5">
    <h1 class="text-center mb-4">Neighborhood Comparison</h1>
    <p class="text-center mb-5">Compare neighborhoods side by side to find the perfect location for your next home</p>

    <div class="row">
        <div class="col-md-4">
            <div class="card mb-4 shadow-sm">
                <div class="card-body">
                    <h3 class="card-title">Select Neighborhoods</h3>
                    <p class="card-text">Choose up to 5 neighborhoods to compare their features, amenities, and livability scores.</p>
                    <div id="neighborhood-selector">
                        <div class="mb-3">
                            <label for="neighborhood-search" class="form-label">Search Neighborhoods</label>
                            <input type="text" class="form-control" id="neighborhood-search" placeholder="Type to search...">
                        </div>
                        <div id="neighborhoods-list">
                            <!-- Neighborhoods will be loaded here -->
                            <div class="d-flex justify-content-center">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <button id="clear-selection" class="btn btn-outline-secondary mt-3">Clear Selection</button>
                </div>
            </div>
        </div>
        <div class="col-md-8">
            <div class="card shadow-sm">
                <div class="card-body">
                    <h3 class="card-title">Comparison Results</h3>
                    <div id="selected-neighborhoods" class="mb-4">
                        <p class="text-muted">No neighborhoods selected. Please select neighborhoods from the list.</p>
                    </div>
                    
                    <div id="comparison-charts" class="d-none">
                        <ul class="nav nav-tabs" id="comparison-tabs" role="tablist">
                            <li class="nav-item" role="presentation">
                                <button class="nav-link active" id="scores-tab" data-bs-toggle="tab" data-bs-target="#scores" type="button" role="tab" aria-controls="scores" aria-selected="true">Livability Scores</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="amenities-tab" data-bs-toggle="tab" data-bs-target="#amenities" type="button" role="tab" aria-controls="amenities" aria-selected="false">Amenities</button>
                            </li>
                            <li class="nav-item" role="presentation">
                                <button class="nav-link" id="price-tab" data-bs-toggle="tab" data-bs-target="#price" type="button" role="tab" aria-controls="price" aria-selected="false">Property Prices</button>
                            </li>
                        </ul>
                        <div class="tab-content p-3 border border-top-0 rounded-bottom" id="comparison-tab-content">
                            <div class="tab-pane fade show active" id="scores" role="tabpanel" aria-labelledby="scores-tab">
                                <canvas id="scores-chart" width="100%" height="50"></canvas>
                            </div>
                            <div class="tab-pane fade" id="amenities" role="tabpanel" aria-labelledby="amenities-tab">
                                <canvas id="amenities-chart" width="100%" height="50"></canvas>
                            </div>
                            <div class="tab-pane fade" id="price" role="tabpanel" aria-labelledby="price-tab">
                                <canvas id="price-chart" width="100%" height="50"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Chart.js Library -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Neighborhood Comparison JavaScript -->
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Variables
        const neighborhoodsList = document.getElementById('neighborhoods-list');
        const neighborhoodSearch = document.getElementById('neighborhood-search');
        const selectedNeighborhoods = document.getElementById('selected-neighborhoods');
        const clearSelectionBtn = document.getElementById('clear-selection');
        const comparisonCharts = document.getElementById('comparison-charts');
        
        // Charts
        let scoresChart, amenitiesChart, priceChart;
        
        // Colors for charts
        const chartColors = [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(255, 159, 64, 0.7)',
            'rgba(153, 102, 255, 0.7)'
        ];
        
        // Selected neighborhood IDs
        let selectedIds = [];
        
        // Fetch all neighborhoods
        fetchNeighborhoods();
        
        // Search functionality
        neighborhoodSearch.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const items = neighborhoodsList.querySelectorAll('.neighborhood-item');
            
            items.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
        
        // Clear selection
        clearSelectionBtn.addEventListener('click', function() {
            selectedIds = [];
            updateSelectedDisplay();
            comparisonCharts.classList.add('d-none');
            
            // Re-enable all checkboxes
            const checkboxes = document.querySelectorAll('.neighborhood-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.checked = false;
                checkbox.disabled = false;
            });
        });
        
        // Fetch neighborhoods from API
        function fetchNeighborhoods() {
            fetch('/api/neighborhoods')
                .then(response => response.json())
                .then(data => {
                    displayNeighborhoods(data);
                })
                .catch(error => {
                    console.error('Error fetching neighborhoods:', error);
                    neighborhoodsList.innerHTML = '<p class="text-danger">Error loading neighborhoods. Please try again later.</p>';
                });
        }
        
        // Display neighborhoods in list
        function displayNeighborhoods(neighborhoods) {
            if (neighborhoods.length === 0) {
                neighborhoodsList.innerHTML = '<p class="text-muted">No neighborhoods found.</p>';
                return;
            }
            
            let html = '';
            neighborhoods.forEach(neighborhood => {
                html += `
                    <div class="form-check neighborhood-item mb-2">
                        <input class="form-check-input neighborhood-checkbox" type="checkbox" value="${neighborhood.id}" id="neighborhood-${neighborhood.id}">
                        <label class="form-check-label" for="neighborhood-${neighborhood.id}">
                            ${neighborhood.name}, ${neighborhood.city}
                        </label>
                    </div>
                `;
            });
            
            neighborhoodsList.innerHTML = html;
            
            // Add event listeners to checkboxes
            const checkboxes = document.querySelectorAll('.neighborhood-checkbox');
            checkboxes.forEach(checkbox => {
                checkbox.addEventListener('change', function() {
                    const id = parseInt(this.value);
                    
                    if (this.checked) {
                        // Add to selected IDs
                        if (selectedIds.length < 5) {
                            selectedIds.push(id);
                        } else {
                            this.checked = false;
                            alert('You can select up to 5 neighborhoods for comparison.');
                            return;
                        }
                    } else {
                        // Remove from selected IDs
                        const index = selectedIds.indexOf(id);
                        if (index > -1) {
                            selectedIds.splice(index, 1);
                        }
                    }
                    
                    // Update UI
                    updateSelectedDisplay();
                });
            });
        }
        
        // Update selected neighborhoods display
        function updateSelectedDisplay() {
            if (selectedIds.length === 0) {
                selectedNeighborhoods.innerHTML = '<p class="text-muted">No neighborhoods selected. Please select neighborhoods from the list.</p>';
                comparisonCharts.classList.add('d-none');
                return;
            }
            
            // Fetch comparison data
            fetchComparisonData();
        }
        
        // Fetch comparison data
        function fetchComparisonData() {
            if (selectedIds.length === 0) return;
            
            const idsString = selectedIds.join(',');
            fetch(`/api/neighborhoods/compare?ids=${idsString}`)
                .then(response => response.json())
                .then(data => {
                    displayComparisonResults(data);
                })
                .catch(error => {
                    console.error('Error fetching comparison data:', error);
                    selectedNeighborhoods.innerHTML = '<p class="text-danger">Error loading comparison data. Please try again later.</p>';
                });
        }
        
        // Display comparison results
        function displayComparisonResults(neighborhoods) {
            // Check if we got valid data
            if (!neighborhoods || neighborhoods.length === 0) {
                selectedNeighborhoods.innerHTML = '<p class="text-warning">No comparison data available for selected neighborhoods.</p>';
                comparisonCharts.classList.add('d-none');
                return;
            }
            
            // Generate badges for selected neighborhoods
            let html = '<div class="d-flex flex-wrap gap-2 mb-3">';
            neighborhoods.forEach((neighborhood, index) => {
                html += `
                    <span class="badge bg-${index < chartColors.length ? getBadgeColor(index) : 'secondary'} p-2">
                        ${neighborhood.name}, ${neighborhood.city}
                        <button type="button" class="btn-close btn-close-white ms-2" aria-label="Remove" 
                            data-id="${neighborhood.id}" style="font-size: 0.6rem;"></button>
                    </span>
                `;
            });
            html += '</div>';
            
            selectedNeighborhoods.innerHTML = html;
            
            // Add event listeners to remove buttons
            const removeButtons = document.querySelectorAll('.btn-close');
            removeButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const id = parseInt(this.getAttribute('data-id'));
                    
                    // Remove from selected IDs
                    const index = selectedIds.indexOf(id);
                    if (index > -1) {
                        selectedIds.splice(index, 1);
                    }
                    
                    // Uncheck the corresponding checkbox
                    const checkbox = document.getElementById(`neighborhood-${id}`);
                    if (checkbox) {
                        checkbox.checked = false;
                    }
                    
                    // Update UI
                    updateSelectedDisplay();
                });
            });
            
            // Show charts container
            comparisonCharts.classList.remove('d-none');
            
            // Create charts
            createScoresChart(neighborhoods);
            createAmenitiesChart(neighborhoods);
            createPriceChart(neighborhoods);
        }
        
        // Create scores chart
        function createScoresChart(neighborhoods) {
            const ctx = document.getElementById('scores-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (scoresChart) {
                scoresChart.destroy();
            }
            
            // Prepare data
            const labels = ['Safety', 'Walkability', 'Schools', 'Public Transport', 'Dining', 'Entertainment', 'Parking', 'Noise Level'];
            const datasets = [];
            
            neighborhoods.forEach((neighborhood, index) => {
                if (!neighborhood.metrics) return;
                
                datasets.push({
                    label: neighborhood.name,
                    data: [
                        neighborhood.metrics.safety_score,
                        neighborhood.metrics.walkability_score,
                        neighborhood.metrics.schools_score,
                        neighborhood.metrics.public_transport_score,
                        neighborhood.metrics.dining_score,
                        neighborhood.metrics.entertainment_score,
                        neighborhood.metrics.parking_score,
                        neighborhood.metrics.noise_level
                    ],
                    backgroundColor: chartColors[index % chartColors.length],
                    borderColor: chartColors[index % chartColors.length].replace('0.7', '1'),
                    borderWidth: 1
                });
            });
            
            scoresChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        r: {
                            min: 0,
                            max: 10,
                            ticks: {
                                stepSize: 2
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Livability Scores Comparison (0-10 scale)'
                        }
                    }
                }
            });
        }
        
        // Create amenities chart
        function createAmenitiesChart(neighborhoods) {
            const ctx = document.getElementById('amenities-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (amenitiesChart) {
                amenitiesChart.destroy();
            }
            
            // Prepare data
            const labels = ['Schools', 'Parks', 'Restaurants', 'Hospitals', 'Shopping', 'Grocery Stores', 'Gyms'];
            const datasets = [];
            
            neighborhoods.forEach((neighborhood, index) => {
                if (!neighborhood.metrics) return;
                
                datasets.push({
                    label: neighborhood.name,
                    data: [
                        neighborhood.metrics.schools_count,
                        neighborhood.metrics.parks_count,
                        neighborhood.metrics.restaurants_count,
                        neighborhood.metrics.hospitals_count,
                        neighborhood.metrics.shopping_count,
                        neighborhood.metrics.grocery_stores_count,
                        neighborhood.metrics.gyms_count
                    ],
                    backgroundColor: chartColors[index % chartColors.length]
                });
            });
            
            amenitiesChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: datasets
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Number of amenities'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Amenities Comparison'
                        }
                    }
                }
            });
        }
        
        // Create price chart
        function createPriceChart(neighborhoods) {
            const ctx = document.getElementById('price-chart').getContext('2d');
            
            // Destroy existing chart if it exists
            if (priceChart) {
                priceChart.destroy();
            }
            
            // Prepare data
            const labels = neighborhoods.map(n => n.name);
            const data = neighborhoods.map(n => n.metrics ? n.metrics.avg_property_price : 0);
            const backgroundColors = neighborhoods.map((n, i) => chartColors[i % chartColors.length]);
            
            priceChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Average Property Price (₹)',
                        data: data,
                        backgroundColor: backgroundColors
                    }]
                },
                options: {
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Price (₹)'
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Average Property Price Comparison'
                        }
                    }
                }
            });
        }
        
        // Helper function to get Bootstrap badge color
        function getBadgeColor(index) {
            const colors = ['primary', 'danger', 'success', 'warning', 'info'];
            return colors[index % colors.length];
        }
    });
</script>

<?php include_once 'includes/footer.php'; ?>