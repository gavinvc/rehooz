<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require 'config.php';

$input = json_decode(file_get_contents("php://input"), true);

$offer_id = $input["offer_id"] ?? null;
$user_id = $input["user_id"] ?? null; // seller

if (!$offer_id || !$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing offer_id or user_id"]);
    exit;
}

// Load offer + ensure seller owns the listing
$sql = "
    SELECT Offer.offer_id, Offer.listing_id
    FROM Offer
    JOIN Listing ON Offer.listing_id = Listing.listing_id
    WHERE Offer.offer_id = ? AND Listing.seller_id = ?
";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $offer_id, $user_id);
$stmt->execute();
$res = $stmt->get_result();

if ($res->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit;
}

$row = $res->fetch_assoc();
$listing_id = $row["listing_id"];

$conn->begin_transaction();

try {
    // 1. Insert into Accepts
    $stmt1 = $conn->prepare("INSERT INTO Accepts (user_id, offer_id, date) VALUES (?, ?, NOW())");
    $stmt1->bind_param("ii", $user_id, $offer_id);
    $stmt1->execute();

    // 2. Mark offer as accepted
    $stmt2 = $conn->prepare("UPDATE Offer SET is_accepted = 1 WHERE offer_id = ?");
    $stmt2->bind_param("i", $offer_id);
    $stmt2->execute();

    // Optional: Reject all other offers on this listing
    $stmt3 = $conn->prepare("UPDATE Offer SET is_accepted = 0 WHERE listing_id = ? AND offer_id != ?");
    $stmt3->bind_param("ii", $listing_id, $offer_id);
    $stmt3->execute();

    $conn->commit();
    echo json_encode(["status" => "success", "message" => "Offer accepted."]);
} catch (Exception $e) {
    $conn->rollback();
    echo json_encode(["status" => "error", "message" => "Failed to accept offer."]);
}

exit;
?>
