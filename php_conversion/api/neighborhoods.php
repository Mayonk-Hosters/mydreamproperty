<?php
/**
 * Neighborhoods API
 * 
 * Handles all neighborhood-related API requests
 */

// Required headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database and model files
include_once '../config/database.php';
include_once '../models/Neighborhood.php';
include_once '../models/NeighborhoodMetrics.php';
include_once '../includes/auth_check.php';

// Get database connection
$database = new Database();
$db = $database->getConnection();

// Instantiate neighborhood objects
$neighborhood = new Neighborhood($db);
$neighborhoodMetrics = new NeighborhoodMetrics($db);

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

// Get URL path
$request_uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path_parts = explode('/', trim($request_uri, '/'));
$api_index = array_search('api', $path_parts);
$resource_index = $api_index + 1;
$id_index = $api_index + 2;
$subresource_index = $api_index + 3;

// Check if we're dealing with neighborhoods resource
if (isset($path_parts[$resource_index]) && $path_parts[$resource_index] === 'neighborhoods') {
    
    // Handle different request methods
    switch ($method) {
        case 'GET':
            // Get ID if provided in URL
            $id = isset($path_parts[$id_index]) ? $path_parts[$id_index] : 0;
            
            // Check if it's a compare request
            if ($id === 'compare' && isset($_GET['ids'])) {
                // Get neighborhood IDs from query string
                $ids = explode(',', $_GET['ids']);
                
                // Validate IDs
                $neighborhood_ids = [];
                foreach ($ids as $id_value) {
                    if (is_numeric($id_value)) {
                        $neighborhood_ids[] = (int)$id_value;
                    }
                }
                
                // Get comparison data
                $comparison_data = $neighborhoodMetrics->compareNeighborhoods($neighborhood_ids);
                
                // Return the comparison data
                http_response_code(200);
                echo json_encode($comparison_data);
                
            } else if ($id > 0) {
                // Check if we're looking for metrics
                if (isset($path_parts[$subresource_index]) && $path_parts[$subresource_index] === 'metrics') {
                    // Get metrics for a specific neighborhood
                    if ($neighborhoodMetrics->getByNeighborhoodId($id)) {
                        // Return metrics
                        $metrics_arr = [
                            "id" => $neighborhoodMetrics->id,
                            "neighborhood_id" => $neighborhoodMetrics->neighborhood_id,
                            "avg_property_price" => $neighborhoodMetrics->avg_property_price,
                            "safety_score" => $neighborhoodMetrics->safety_score,
                            "walkability_score" => $neighborhoodMetrics->walkability_score,
                            "schools_score" => $neighborhoodMetrics->schools_score,
                            "public_transport_score" => $neighborhoodMetrics->public_transport_score,
                            "dining_score" => $neighborhoodMetrics->dining_score,
                            "entertainment_score" => $neighborhoodMetrics->entertainment_score,
                            "parking_score" => $neighborhoodMetrics->parking_score,
                            "noise_level" => $neighborhoodMetrics->noise_level,
                            "schools_count" => $neighborhoodMetrics->schools_count,
                            "parks_count" => $neighborhoodMetrics->parks_count,
                            "restaurants_count" => $neighborhoodMetrics->restaurants_count,
                            "hospitals_count" => $neighborhoodMetrics->hospitals_count,
                            "shopping_count" => $neighborhoodMetrics->shopping_count,
                            "grocery_stores_count" => $neighborhoodMetrics->grocery_stores_count,
                            "gyms_count" => $neighborhoodMetrics->gyms_count,
                            "updated_at" => $neighborhoodMetrics->updated_at
                        ];
                        http_response_code(200);
                        echo json_encode($metrics_arr);
                    } else {
                        // No metrics found
                        http_response_code(404);
                        echo json_encode(["message" => "No metrics found for this neighborhood."]);
                    }
                } else {
                    // Get a specific neighborhood
                    if ($neighborhood->getById($id)) {
                        // Return neighborhood
                        $neighborhood_arr = [
                            "id" => $neighborhood->id,
                            "name" => $neighborhood->name,
                            "city" => $neighborhood->city,
                            "description" => $neighborhood->description,
                            "location_data" => json_decode($neighborhood->location_data, true),
                            "created_at" => $neighborhood->created_at
                        ];
                        http_response_code(200);
                        echo json_encode($neighborhood_arr);
                    } else {
                        // No neighborhood found
                        http_response_code(404);
                        echo json_encode(["message" => "Neighborhood not found."]);
                    }
                }
            } else {
                // Get all neighborhoods
                $stmt = $neighborhood->getAll();
                $num = $stmt->rowCount();
                
                if ($num > 0) {
                    // Neighborhoods array
                    $neighborhoods_arr = [];
                    
                    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                        extract($row);
                        
                        $neighborhood_item = [
                            "id" => $id,
                            "name" => $name,
                            "city" => $city,
                            "description" => $description,
                            "location_data" => json_decode($location_data, true),
                            "created_at" => $created_at
                        ];
                        
                        array_push($neighborhoods_arr, $neighborhood_item);
                    }
                    
                    http_response_code(200);
                    echo json_encode($neighborhoods_arr);
                } else {
                    // No neighborhoods found
                    http_response_code(200);
                    echo json_encode([]);
                }
            }
            break;
            
        case 'POST':
            // Check if admin
            if (!isAdmin()) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only administrators can create neighborhoods."]);
                exit;
            }
            
            // Get posted data
            $data = json_decode(file_get_contents("php://input"));
            
            // Check if we're handling metrics
            if (isset($path_parts[$id_index]) && is_numeric($path_parts[$id_index]) && 
                isset($path_parts[$subresource_index]) && $path_parts[$subresource_index] === 'metrics') {
                
                $neighborhood_id = (int)$path_parts[$id_index];
                
                // Check if neighborhood exists
                if (!$neighborhood->getById($neighborhood_id)) {
                    http_response_code(404);
                    echo json_encode(["message" => "Neighborhood not found."]);
                    exit;
                }
                
                // Set neighborhood metrics properties
                $neighborhoodMetrics->neighborhood_id = $neighborhood_id;
                $neighborhoodMetrics->avg_property_price = $data->avg_property_price ?? null;
                $neighborhoodMetrics->safety_score = $data->safety_score ?? null;
                $neighborhoodMetrics->walkability_score = $data->walkability_score ?? null;
                $neighborhoodMetrics->schools_score = $data->schools_score ?? null;
                $neighborhoodMetrics->public_transport_score = $data->public_transport_score ?? null;
                $neighborhoodMetrics->dining_score = $data->dining_score ?? null;
                $neighborhoodMetrics->entertainment_score = $data->entertainment_score ?? null;
                $neighborhoodMetrics->parking_score = $data->parking_score ?? null;
                $neighborhoodMetrics->noise_level = $data->noise_level ?? null;
                $neighborhoodMetrics->schools_count = $data->schools_count ?? 0;
                $neighborhoodMetrics->parks_count = $data->parks_count ?? 0;
                $neighborhoodMetrics->restaurants_count = $data->restaurants_count ?? 0;
                $neighborhoodMetrics->hospitals_count = $data->hospitals_count ?? 0;
                $neighborhoodMetrics->shopping_count = $data->shopping_count ?? 0;
                $neighborhoodMetrics->grocery_stores_count = $data->grocery_stores_count ?? 0;
                $neighborhoodMetrics->gyms_count = $data->gyms_count ?? 0;
                
                // Check if metrics already exist
                if ($neighborhoodMetrics->getByNeighborhoodId($neighborhood_id)) {
                    // Update existing metrics
                    if ($neighborhoodMetrics->update()) {
                        http_response_code(200);
                        echo json_encode(["message" => "Neighborhood metrics updated.", "id" => $neighborhoodMetrics->id]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["message" => "Unable to update neighborhood metrics."]);
                    }
                } else {
                    // Create new metrics
                    if ($neighborhoodMetrics->create()) {
                        http_response_code(201);
                        echo json_encode(["message" => "Neighborhood metrics created.", "id" => $neighborhoodMetrics->id]);
                    } else {
                        http_response_code(500);
                        echo json_encode(["message" => "Unable to create neighborhood metrics."]);
                    }
                }
            } else {
                // Make sure data is not empty
                if (
                    !empty($data->name) &&
                    !empty($data->city) &&
                    !empty($data->description)
                ) {
                    // Check if neighborhood already exists
                    if ($neighborhood->checkExists($data->name, $data->city)) {
                        http_response_code(409);
                        echo json_encode(["message" => "A neighborhood with this name already exists in this city."]);
                        exit;
                    }
                    
                    // Set neighborhood properties
                    $neighborhood->name = $data->name;
                    $neighborhood->city = $data->city;
                    $neighborhood->description = $data->description;
                    $neighborhood->location_data = json_encode($data->location_data ?? []);
                    
                    // Create the neighborhood
                    if ($neighborhood->create()) {
                        // Return created neighborhood
                        $neighborhood_arr = [
                            "id" => $neighborhood->id,
                            "name" => $neighborhood->name,
                            "city" => $neighborhood->city,
                            "description" => $neighborhood->description,
                            "location_data" => json_decode($neighborhood->location_data, true),
                            "created_at" => date('Y-m-d H:i:s')
                        ];
                        
                        http_response_code(201);
                        echo json_encode($neighborhood_arr);
                    } else {
                        http_response_code(500);
                        echo json_encode(["message" => "Unable to create neighborhood."]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode(["message" => "Unable to create neighborhood. Data is incomplete."]);
                }
            }
            break;
            
        case 'PUT':
            // Check if admin
            if (!isAdmin()) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only administrators can update neighborhoods."]);
                exit;
            }
            
            // Get ID from URL
            $id = isset($path_parts[$id_index]) ? $path_parts[$id_index] : 0;
            
            // Check if it's a metrics update
            if ($id > 0 && isset($path_parts[$subresource_index]) && $path_parts[$subresource_index] === 'metrics') {
                // Get posted data
                $data = json_decode(file_get_contents("php://input"));
                
                // Check if metrics exist
                if (!$neighborhoodMetrics->getByNeighborhoodId($id)) {
                    http_response_code(404);
                    echo json_encode(["message" => "Metrics not found for this neighborhood."]);
                    exit;
                }
                
                // Update metrics properties
                if (isset($data->avg_property_price)) $neighborhoodMetrics->avg_property_price = $data->avg_property_price;
                if (isset($data->safety_score)) $neighborhoodMetrics->safety_score = $data->safety_score;
                if (isset($data->walkability_score)) $neighborhoodMetrics->walkability_score = $data->walkability_score;
                if (isset($data->schools_score)) $neighborhoodMetrics->schools_score = $data->schools_score;
                if (isset($data->public_transport_score)) $neighborhoodMetrics->public_transport_score = $data->public_transport_score;
                if (isset($data->dining_score)) $neighborhoodMetrics->dining_score = $data->dining_score;
                if (isset($data->entertainment_score)) $neighborhoodMetrics->entertainment_score = $data->entertainment_score;
                if (isset($data->parking_score)) $neighborhoodMetrics->parking_score = $data->parking_score;
                if (isset($data->noise_level)) $neighborhoodMetrics->noise_level = $data->noise_level;
                if (isset($data->schools_count)) $neighborhoodMetrics->schools_count = $data->schools_count;
                if (isset($data->parks_count)) $neighborhoodMetrics->parks_count = $data->parks_count;
                if (isset($data->restaurants_count)) $neighborhoodMetrics->restaurants_count = $data->restaurants_count;
                if (isset($data->hospitals_count)) $neighborhoodMetrics->hospitals_count = $data->hospitals_count;
                if (isset($data->shopping_count)) $neighborhoodMetrics->shopping_count = $data->shopping_count;
                if (isset($data->grocery_stores_count)) $neighborhoodMetrics->grocery_stores_count = $data->grocery_stores_count;
                if (isset($data->gyms_count)) $neighborhoodMetrics->gyms_count = $data->gyms_count;
                
                // Update metrics
                if ($neighborhoodMetrics->update()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Neighborhood metrics updated."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Unable to update neighborhood metrics."]);
                }
            } else if ($id > 0) {
                // Get posted data
                $data = json_decode(file_get_contents("php://input"));
                
                // Check if neighborhood exists
                if (!$neighborhood->getById($id)) {
                    http_response_code(404);
                    echo json_encode(["message" => "Neighborhood not found."]);
                    exit;
                }
                
                // Update neighborhood properties
                if (isset($data->name)) $neighborhood->name = $data->name;
                if (isset($data->city)) $neighborhood->city = $data->city;
                if (isset($data->description)) $neighborhood->description = $data->description;
                if (isset($data->location_data)) $neighborhood->location_data = json_encode($data->location_data);
                
                // Update neighborhood
                if ($neighborhood->update()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Neighborhood updated."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Unable to update neighborhood."]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Unable to update neighborhood. No ID provided."]);
            }
            break;
            
        case 'DELETE':
            // Check if admin
            if (!isAdmin()) {
                http_response_code(403);
                echo json_encode(["message" => "Access denied. Only administrators can delete neighborhoods."]);
                exit;
            }
            
            // Get ID from URL
            $id = isset($path_parts[$id_index]) ? $path_parts[$id_index] : 0;
            
            if ($id > 0) {
                // Check if neighborhood exists
                if (!$neighborhood->getById($id)) {
                    http_response_code(404);
                    echo json_encode(["message" => "Neighborhood not found."]);
                    exit;
                }
                
                // Delete neighborhood
                if ($neighborhood->delete()) {
                    http_response_code(200);
                    echo json_encode(["message" => "Neighborhood deleted."]);
                } else {
                    http_response_code(500);
                    echo json_encode(["message" => "Unable to delete neighborhood."]);
                }
            } else {
                http_response_code(400);
                echo json_encode(["message" => "Unable to delete neighborhood. No ID provided."]);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(["message" => "Method not allowed."]);
            break;
    }
} else {
    http_response_code(404);
    echo json_encode(["message" => "Resource not found."]);
}
?>