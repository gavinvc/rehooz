<?php
header("Content-Type: application/json");
include "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$user_id = intval($data["user_id"]);
$desc = $data["profile_desc"];

$query = "UPDATE User SET profile_desc = ? WHERE user_id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("si", $desc, $user_id);

if ($stmt->execute()) {
  echo json_encode(["status" => "success", "message" => "Profile updated successfully"]);
} else {
  echo json_encode(["status" => "fail", "message" => "Failed to update profile"]);
}

$conn->close();
?>
