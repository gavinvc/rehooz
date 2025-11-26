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

$input = file_get_contents("php://input");
$data = json_decode($input, true);

$listingId = isset($data['listing_id']) ? intval($data['listing_id']) : 0;
$userId = isset($data['user_id']) ? intval($data['user_id']) : 0;

if ($listingId <= 0 || $userId <= 0) {
    echo json_encode(["status" => "error", "message" => "Invalid user or listing id"]);
    exit;
}

$checkStmt = $conn->prepare("SELECT seller_id FROM Listing WHERE listing_id = ?");
if (!$checkStmt) {
    echo json_encode(["status" => "error", "message" => "Database error: " . $conn->error]);
    exit;
}

$checkStmt->bind_param("i", $listingId);
$checkStmt->execute();
$result = $checkStmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Listing not found"]);
    $checkStmt->close();
    $conn->close();
    exit;
}

$row = $result->fetch_assoc();
$checkStmt->close();

if ((int)$row['seller_id'] !== $userId) {
    echo json_encode(["status" => "error", "message" => "You can only delete your own listings"]);
    $conn->close();
    exit;
}

try {
    $conn->begin_transaction();

    $deleteFollows = $conn->prepare("DELETE FROM Follows WHERE listing_id = ?");
    if (!$deleteFollows) {
        throw new Exception("Failed to prepare delete follows statement: " . $conn->error);
    }
    $deleteFollows->bind_param("i", $listingId);
    $deleteFollows->execute();
    $deleteFollows->close();

    $deleteListing = $conn->prepare("DELETE FROM Listing WHERE listing_id = ? AND seller_id = ?");
    if (!$deleteListing) {
        throw new Exception("Failed to prepare delete listing statement: " . $conn->error);
    }
    $deleteListing->bind_param("ii", $listingId, $userId);
    $deleteListing->execute();

    if ($deleteListing->affected_rows === 0) {
        throw new Exception("Unable to delete listing");
    }

    $deleteListing->close();

    $conn->commit();

    echo json_encode(["status" => "success", "message" => "Listing deleted successfully"]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

$conn->close();
?>
