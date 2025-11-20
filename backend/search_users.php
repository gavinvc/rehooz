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
$query = isset($data['query']) ? trim($data['query']) : '';
$currentId = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($query === '' || $currentId <= 0) {
    echo json_encode(["status" => "fail", "message" => "Missing query or user_id"]);
    exit;
}

$like = "%" . $query . "%";

$sql = "SELECT user_id, username, city
        FROM User
        WHERE username LIKE ? AND user_id != ?
        ORDER BY username
        LIMIT 25";

$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $like, $currentId);
$stmt->execute();
$result = $stmt->get_result();

$users = [];
while ($row = $result->fetch_assoc()) {
    $users[] = $row;
}
$stmt->close();
$conn->close();

echo json_encode(["status" => "success", "results" => $users]);
?>
