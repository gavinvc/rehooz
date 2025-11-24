<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);
$userId   = isset($data['user_id']) ? intval($data['user_id']) : 0;
$listingId = isset($data['listing_id']) ? intval($data['listing_id']) : 0;

if ($userId <= 0 || $listingId <= 0 || $userId === $listingId) {
    echo json_encode(["status" => "fail", "message" => "Invalid user or listing id"]);
    exit;
}

// Check if already following
$check = $conn->prepare("SELECT 1 FROM Follows WHERE user_id = ? AND listing_id = ?");
$check->bind_param("ii", $userId, $listingId);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    $check->close();
    $conn->close();
    echo json_encode(["status" => "success", "message" => "Already following"]);
    exit;
}
$check->close();

// Insert follow
$stmt = $conn->prepare("INSERT INTO Follows (user_id, listing_id) VALUES (?, ?)");
$stmt->bind_param("ii", $userId, $listingId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Now following listing"]);
} else {
    echo json_encode(["status" => "fail", "message" => "Could not follow listing"]);
}

$stmt->close();
$conn->close();
?>
