<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require 'config.php';

$listingId = isset($_GET['listing_id']) ? intval($_GET['listing_id']) : 0;

if ($listingId <= 0) {
    echo json_encode([
        "status" => "fail",
        "message" => "Missing or invalid listing_id",
    ]);
    exit;
}

$sql = "SELECT COUNT(*) AS follower_count FROM Follows WHERE listing_id = ?";

if (!$stmt = $conn->prepare($sql)) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to prepare statement",
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $listingId);
$stmt->execute();
$result = $stmt->get_result();
$count = $result->fetch_assoc();

$stmt->close();
$conn->close();

echo json_encode([
    "status" => "success",
    "listing_id" => $listingId,
    "follower_count" => intval($count['follower_count'] ?? 0),
]);
?>
