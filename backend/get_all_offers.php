<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

try {
    $sql = "SELECT 
                O.offer_id,
                O.monetary_amount, 
                O.date, 
                U.username as Buyer_username
            FROM Offer O 
            JOIN User U ON O.buyer_id = U.user_id 
            WHERE O.listing_id = ?
            ORDER BY O.date DESC";

    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }

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
