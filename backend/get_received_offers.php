<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require 'config.php';

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

$sql = "
    SELECT Offer.offer_id, Offer.listing_id, Offer.buyer_id,
           Offer.monetary_amount, Offer.date,
           Listing.name AS listing_name, U.username AS buyer_username
    FROM Offer
    JOIN Listing ON Offer.listing_id = Listing.listing_id
    JOIN User U ON Offer.buyer_id = U.user_id
    WHERE Listing.seller_id = ?
    ORDER BY Offer.date DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$offers = [];
while ($row = $result->fetch_assoc()) {
    $offers[] = $row;
}

echo json_encode(["status" => "success", "offers" => $offers]);
exit;
?>
