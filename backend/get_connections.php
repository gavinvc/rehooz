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
$userId = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($userId <= 0) {
    echo json_encode([
        "status" => "fail",
        "message" => "Missing or invalid user_id"
    ]);
    exit;
}

// ---- People I follow ----
$following = [];
$sqlFollowing = "
    SELECT u.user_id, u.username, u.city
    FROM UserFollows f
    JOIN User u ON f.follow_id = u.user_id
    WHERE f.user_id = ?
    ORDER BY u.username;
";

if ($stmt = $conn->prepare($sqlFollowing)) {
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $following[] = $row;
    }
    $stmt->close();
} else {
    echo json_encode([
        "status"  => "fail",
        "message" => "Error preparing following query"
    ]);
    $conn->close();
    exit;
}

// ---- People who follow me ----
$followers = [];
$sqlFollowers = "
    SELECT u.user_id, u.username, u.city
    FROM UserFollows f
    JOIN User u ON f.user_id = u.user_id
    WHERE f.follow_id = ?
    ORDER BY u.username;
";

if ($stmt = $conn->prepare($sqlFollowers)) {
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) {
        $followers[] = $row;
    }
    $stmt->close();
} else {
    echo json_encode([
        "status"  => "fail",
        "message" => "Error preparing followers query"
    ]);
    $conn->close();
    exit;
}

$conn->close();

echo json_encode([
    "status"    => "success",
    "following" => $following,
    "followers" => $followers
]);
?>
