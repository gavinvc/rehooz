<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Content-Type: application/json");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Read incoming JSON data
$input = file_get_contents("php://input");
$data = json_decode($input, true);

// Fallback if JSON decoding fails
if ($data === null) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON input"]);
    exit;
}

// Accept either user_id or seller_id for flexibility
$seller_id   = $data['seller_id'] ?? $data['user_id'] ?? null;
$listing_id  = isset($data['listing_id']) ? intval($data['listing_id']) : null;
$name        = trim($data['name'] ?? '');
$price       = floatval($data['price'] ?? 0);
$description = trim($data['description'] ?? '');
$photo       = trim($data['photo'] ?? 'default.jpg');
$location    = trim($data['location'] ?? '');

// Basic validation
if (!$seller_id || !$listing_id || $name === '' || $price <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing or invalid required fields"]);
    exit;
}

// Prevent edits if the listing already has an accepted offer
$acceptedSql = "SELECT 1 FROM Accepts A JOIN Offer O ON A.offer_id = O.offer_id WHERE O.listing_id = ? LIMIT 1";
$acceptedStmt = $conn->prepare($acceptedSql);

if (!$acceptedStmt) {
    echo json_encode(["status" => "error", "message" => "Unable to verify listing status"]);
    exit;
}

$acceptedStmt->bind_param("i", $listing_id);
$acceptedStmt->execute();
$acceptedStmt->store_result();

if ($acceptedStmt->num_rows > 0) {
    $acceptedStmt->close();
    echo json_encode([
        "status" => "error",
        "message" => "This listing can no longer be edited because an offer has already been accepted."
    ]);
    exit;
}

$acceptedStmt->close();

try {
    $sql = "UPDATE Listing
            SET name = ?, price = ?, description = ?, photo = ?, location = ?
            WHERE listing_id = ? AND seller_id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }

    // name (s), price (d), description (s), photo (s), location (s), listing_id (i), seller_id (i)
    $stmt->bind_param("sdsssii",
        $name,
        $price,
        $description,
        $photo,
        $location,
        $listing_id,
        $seller_id
    );

    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "message" => "Listing updated successfully"]);
        } else {
            // No rows changed: either no such listing, or belongs to another user
            echo json_encode([
                "status"  => "error",
                "message" => "No listing updated. Check that the listing exists and belongs to this user."
            ]);
        }
    } else {
        throw new Exception("Execute failed: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit;
?>