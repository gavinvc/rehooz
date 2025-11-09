<?php
header("Content-Type: application/json");
include "config.php";

$data = $_GET;
$user_id = intval($data["id"]);

$query = "SELECT username, profile_desc, overall_rating FROM User WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
  echo json_encode(["status" => "success", "user" => $user]);
} else {
  echo json_encode(["status" => "fail", "message" => "User not found"]);
}

$conn->close();
?>
