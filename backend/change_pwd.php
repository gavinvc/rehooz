<?php
header("Content-Type: application/json");
include "config.php";

$data = json_decode(file_get_contents("php://input"), true);
$user_id = intval($data["user_id"]);
$current = $data["current"];
$new = $data["new"];

// Verify current password
$stmt = $conn->prepare("SELECT password FROM User WHERE user_id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$stmt->bind_result($stored_password);
$stmt->fetch();
$stmt->close();

if ($stored_password !== $current) {
  echo json_encode(["status" => "fail", "message" => "Incorrect current password"]);
  exit();
}

// Update password
$stmt = $conn->prepare("UPDATE User SET password = ? WHERE user_id = ?");
$stmt->bind_param("si", $new, $user_id);

if ($stmt->execute()) {
  echo json_encode(["status" => "success", "message" => "Password updated successfully"]);
} else {
  echo json_encode(["status" => "fail", "message" => "Password update failed"]);
}

$conn->close();
?>
