<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (
    !isset($data['username']) || 
    !isset($data['email']) || 
    !isset($data['password'])
) {
    echo json_encode(["status" => "fail", "message" => "Missing required fields"]);
    exit;
}

$username = trim($data['username']);
$email = trim($data['email']);
$city = isset($data['city']) ? trim($data['city']) : null;
$password = trim($data['password']);
$hashedPwd = password_hash($password, PASSWORD_DEFAULT);

// Check if username already exists
$check = $conn->prepare("SELECT user_id FROM User WHERE username = ? OR email = ?");
$check->bind_param("ss", $username, $email);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode(["status" => "fail", "message" => "Username or email already exists"]);
    $check->close();
    $conn->close();
    exit;
}
$check->close();

// Insert new user
$stmt = $conn->prepare("INSERT INTO User (username, email, password, city, profile_desc, overall_rating) 
                        VALUES (?, ?, ?, ?, '', 0)");
$stmt->bind_param("ssss", $username, $email, $hashedPwd, $city);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User registered successfully"]);
} else {
    echo json_encode(["status" => "fail", "message" => "Error during registration"]);
}

$stmt->close();
$conn->close();
?>
