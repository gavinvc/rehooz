<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Read incoming JSON data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Fallback if JSON decoding fails
if ($data === null) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

$seller_id  = $data['seller_id'] ?? null;
$name       = trim($data['name'] ?? '');
$price      = floatval($data['price'] ?? 0);
$description= trim($data['description'] ?? '');
$photo      = trim($data['photo'] ?? 'default.jpg');
$location   = trim($data['location'] ?? '');

if (!$seller_id || $name === '' || $price <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

try {
    $sql = "INSERT INTO Listing (seller_id, name, price, description, photo, location)
            VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }

    $stmt->bind_param("isdsss", $seller_id, $name, $price, $description, $photo, $location);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Listing added successfully"]);
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit;
?>
