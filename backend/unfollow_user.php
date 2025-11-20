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

if ($userId <= 0 || $followId <= 0) {
    echo json_encode(["status" => "fail", "message" => "Invalid user or follow id"]);
    exit;
}

$stmt = $conn->prepare("DELETE FROM UserFollows WHERE user_id = ? AND follow_id = ?");
$stmt->bind_param("ii", $userId, $followId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Unfollowed user"]);
} else {
    echo json_encode(["status" => "fail", "message" => "Could not unfollow user"]);
}

$stmt->close();
$conn->close();
?>
