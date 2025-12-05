<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

include 'config.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Content-Type: application/json");

$user_id = $_GET['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(["status" => "error", "message" => "Missing user ID"]);
    exit;
}

try {
    $sql = "SELECT L.*, EXISTS (
                SELECT 1
                FROM Accepts A
                INNER JOIN Offer O2 ON O2.offer_id = A.offer_id
                WHERE O2.listing_id = L.listing_id
            ) AS has_accepted_offer
            FROM Listing L
            WHERE L.seller_id = ?";
    $stmt = $conn->prepare($sql);

    if (!$stmt) {
        throw new Exception("Database prepare failed: " . $conn->error);
    }

    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $listings = [];
    while ($row = $result->fetch_assoc()) {
        // Optionally sanitize or format values before returning
        $row['price'] = floatval($row['price']);
        $row['has_accepted_offer'] = (bool)$row['has_accepted_offer'];
        $listings[] = $row;
    }

    echo json_encode(["status" => "success", "listings" => $listings]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit;
?>
