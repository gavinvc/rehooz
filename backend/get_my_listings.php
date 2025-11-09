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
    $sql = "SELECT * FROM Listing WHERE seller_id = ?";
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
        $listings[] = $row;
    }

    echo json_encode(["status" => "success", "listings" => $listings]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}

exit;
?>
