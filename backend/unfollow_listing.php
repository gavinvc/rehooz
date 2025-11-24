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

if ($userId <= 0 || $listingId <= 0) {
    echo json_encode(["status" => "fail", "message" => "Invalid user or listing id"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM Follows WHERE user_id = ? AND listing_id = ?");
$stmt->bind_param("ii", $userId, $listingId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Unfollowed listing"]);
} else {
    echo json_encode(["status" => "fail", "message" => "Could not unfollow listing"]);
}

$stmt->close();
$conn->close();
?>
