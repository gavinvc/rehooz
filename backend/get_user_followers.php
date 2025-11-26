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

$userId = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if ($userId <= 0) {
    echo json_encode([
        "status" => "fail",
        "message" => "Missing or invalid user_id",
    ]);
    exit;
}

$sql = "
    SELECT u.user_id, u.username, u.profile_desc,
           COALESCE(f.followers, 0) AS follower_count
    FROM User u
    LEFT JOIN (
        SELECT follow_id, COUNT(*) AS followers
        FROM UserFollows
        GROUP BY follow_id
    ) f ON f.follow_id = u.user_id
    WHERE u.user_id = ?
    LIMIT 1;
";

if (!$stmt = $conn->prepare($sql)) {
    echo json_encode([
        "status" => "error",
        "message" => "Failed to prepare statement",
    ]);
    $conn->close();
    exit;
}

$stmt->bind_param("i", $userId);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    echo json_encode([
        "status" => "success",
        "user" => $row,
    ]);
} else {
    echo json_encode([
        "status" => "fail",
        "message" => "User not found",
    ]);
}

$stmt->close();
$conn->close();
?>
