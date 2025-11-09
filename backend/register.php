<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("config.php");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);
$username = $data["username"] ?? '';
$email = $data["email"] ?? '';
$password = $data["password"] ?? '';

$sql = "INSERT INTO User (username, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $username, $email, $password);

if ($stmt->execute()) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $stmt->error]);
}
?>
