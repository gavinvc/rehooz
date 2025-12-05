<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require 'config.php';

$listing_id = $_GET['listing_id'] ?? null;

if (!$listing_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing listing_id"
    ]);
    exit;
}

$sql = "SELECT 
            O.offer_id,
            O.listing_id,
            O.buyer_id,
            O.monetary_amount,
            O.date,
            U.username AS buyer_username,
            CASE WHEN A.offer_id IS NULL THEN 0 ELSE 1 END AS is_accepted
        FROM Offer O
        JOIN User U ON O.buyer_id = U.user_id
        LEFT JOIN Accepts A ON A.offer_id = O.offer_id
        WHERE O.listing_id = ?
        ORDER BY O.date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $listing_id);
$stmt->execute();
$result = $stmt->get_result();

$pendingOffers = [];
$acceptedOffers = [];

while ($row = $result->fetch_assoc()) {
    $row['is_accepted'] = (int)$row['is_accepted'];
    if ($row['is_accepted'] === 1) {
        $acceptedOffers[] = $row;
    } else {
        $pendingOffers[] = $row;
    }
}

$stmt->close();
$conn->close();

echo json_encode([
    "status" => "success",
    "pending_offers" => $pendingOffers,
    "accepted_offers" => $acceptedOffers
]);
exit;
?>
