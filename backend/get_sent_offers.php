<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require 'config.php';

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing user_id"
    ]);
    exit;
}

// Get offers NOT accepted
$sql = "SELECT 
        O.offer_id,
        O.listing_id,
        O.monetary_amount,
        O.date,
        L.name AS listing_name,
        L.photo
    FROM Offer O
    JOIN Listing L ON O.listing_id = L.listing_id
    LEFT JOIN Accepts A ON A.offer_id = O.offer_id
    WHERE 
        O.buyer_id = ? 
        AND A.offer_id IS NULL
    ORDER BY O.date DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$offers = [];

while ($row = $result->fetch_assoc()) {
    $offers[] = $row;
}

echo json_encode([
    "status" => "success",
    "offers" => $offers
]);
?>
