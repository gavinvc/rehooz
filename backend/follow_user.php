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
$followId = isset($data['follow_id']) ? intval($data['follow_id']) : 0;

if ($userId <= 0 || $followId <= 0 || $userId === $followId) {
    echo json_encode(["status" => "fail", "message" => "Invalid user or follow id"]);
    exit;
}

// Check if already following
$check = $conn->prepare("SELECT 1 FROM UserFollows WHERE user_id = ? AND follow_id = ?");
$check->bind_param("ii", $userId, $followId);
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
$stmt = $conn->prepare("INSERT INTO UserFollows (user_id, follow_id, date) VALUES (?, ?, NOW())");
$stmt->bind_param("ii", $userId, $followId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Now following user"]);
} else {
    echo json_encode(["status" => "fail", "message" => "Could not follow user"]);
}

$stmt->close();
$conn->close();
?>
