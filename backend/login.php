<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(["status" => "fail", "message" => "Missing username or password"]);
    exit;
}

$username = trim($data['username']);
$password = trim($data['password']);

$stmt = $conn->prepare("SELECT user_id, username, password, email, city, profile_desc, overall_rating 
                        FROM User WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($row = $result->fetch_assoc()) {
    if (password_verify($password, $row['password'])) {
        unset($row['password']); // Never send password hash to frontend
        echo json_encode(["status" => "success", "user" => $row]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Incorrect password"]);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "User not found"]);
}

$stmt->close();
$conn->close();
?>
