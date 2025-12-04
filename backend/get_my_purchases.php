<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

require 'config.php';

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing user_id"]);
    exit;
}

// Get offers this user submitted (buyer_id = user)
// AND have been accepted via Accepts table
$sql = "SELECT 
        O.offer_id,
        O.monetary_amount AS final_price,
        O.date AS offer_date,
        L.listing_id,
        L.name AS listing_name,
        L.description,
        L.photo,
        L.price AS original_price,
        L.location
    FROM Offer O
    JOIN Accepts A ON A.offer_id = O.offer_id
    JOIN Listing L ON L.listing_id = O.listing_id
    WHERE O.buyer_id = ?
    ORDER BY A.date DESC
";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();
$purchases = [];

while ($row = $result->fetch_assoc()) {
    $purchases[] = $row;
}

echo json_encode(["status" => "success", "purchases" => $purchases]);
?>
