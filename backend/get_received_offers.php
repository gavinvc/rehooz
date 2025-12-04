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

/*
   We LEFT JOIN Accepts to detect whether the offer was accepted.
   If A.offer_id is NULL → not accepted
   If A.offer_id is NOT NULL → accepted
*/

$sql = "SELECT 
        O.offer_id,
        O.listing_id,
        O.buyer_id,
        O.monetary_amount,
        O.date,
        L.name AS listing_name,
        U.username AS buyer_username,
        CASE 
            WHEN A.offer_id IS NULL THEN 0 
            ELSE 1 
        END AS is_accepted
    FROM Offer O
    JOIN Listing L ON O.listing_id = L.listing_id
    JOIN User U ON O.buyer_id = U.user_id
    LEFT JOIN Accepts A ON A.offer_id = O.offer_id
    WHERE L.seller_id = ?
    ORDER BY O.date DESC
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
