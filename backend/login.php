<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include("config.php");
header("Content-Type: application/json");

$data = json_decode(file_get_contents("php://input"), true);

$username = $data["username"] ?? '';
$password = $data["password"] ?? '';

$sql = "SELECT * FROM User WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    if ($password === $user["password"]) {
        echo json_encode(["status" => "success", "user" => $user]);
    } else {
        echo json_encode(["status" => "fail", "message" => "Incorrect password"]);
    }
} else {
    echo json_encode(["status" => "fail", "message" => "User not found"]);
}
?>
