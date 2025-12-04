<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'config.php';

$input = json_decode(file_get_contents("php://input"), true);

$offer_id = $input["offer_id"] ?? null;
$user_id = $input["user_id"] ?? null;

if (!$offer_id || !$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing offer_id or user_id"]);
    exit;
}

// Ensure user OWNS this offer
$check = $conn->prepare("SELECT * FROM Offer WHERE offer_id = ? AND buyer_id = ?");
$check->bind_param("ii", $offer_id, $user_id);
$check->execute();
$res = $check->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Unauthorized request"]);
    exit;
}

// DELETE from Offer + Makes
$conn->begin_transaction();

try {
    $stmt1 = $conn->prepare("DELETE FROM Makes WHERE offer_id = ?");
    $stmt1->bind_param("i", $offer_id);
    $stmt1->execute();

    $stmt2 = $conn->prepare("DELETE FROM Offer WHERE offer_id = ?");
    $stmt2->bind_param("i", $offer_id);
    $stmt2->execute();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Offer rescinded."]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Failed to rescind offer."]);
}

exit;
?>
