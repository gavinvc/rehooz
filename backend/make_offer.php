<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Content-Type: application/json");

require 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

try {
    $input = json_decode(file_get_contents("php://input"), true);

    if (!$input) {
        throw new Exception("Invalid or missing JSON body.");
    }

    $listing_id = $input["listing_id"] ?? null;
    $buyer_id   = $input["user_id"] ?? null;
    $amount     = $input["monetary_amount"] ?? null;

    if (!$listing_id || !$buyer_id || !$amount) {
        throw new Exception("Missing required fields.");
    }

    // block new offers if one has already been accepted for this listing
    $acceptedSql = "SELECT 1 FROM Accepts A INNER JOIN Offer O2 ON O2.offer_id = A.offer_id WHERE O2.listing_id = ? LIMIT 1";
    $acceptedStmt = $conn->prepare($acceptedSql);
    if (!$acceptedStmt) throw new Exception("Prepare failed: " . $conn->error);
    $acceptedStmt->bind_param("i", $listing_id);
    $acceptedStmt->execute();
    $acceptedStmt->store_result();

    if ($acceptedStmt->num_rows > 0) {
        $acceptedStmt->close();
        echo json_encode([
            "status" => "error",
            "message" => "Offers are closed for this listing because one has already been accepted."
        ]);
        exit;
    }

    $acceptedStmt->close();

    // ---- 1. Insert into Offer ----
    $sql_offer = "
        INSERT INTO Offer (listing_id, buyer_id, monetary_amount, date, is_accepted)
        VALUES (?, ?, ?, NOW(), 0)
    ";

    $stmt = $conn->prepare($sql_offer);
    if (!$stmt) throw new Exception("Prepare failed: " . $conn->error);

    // monetary_amount is numeric → use "d"
    $stmt->bind_param("iid", $listing_id, $buyer_id, $amount);

    if (!$stmt->execute()) {
        throw new Exception("Offer insert failed: " . $stmt->error);
    }

    $offer_id = $stmt->insert_id;
    $stmt->close();

    // ---- 2. Insert into Makes ----
    $sql_makes = "
        INSERT INTO Makes (user_id, offer_id, date)
        VALUES (?, ?, NOW())
    ";
    $stmt2 = $conn->prepare($sql_makes);

    if (!$stmt2) throw new Exception("Prepare failed: " . $conn->error);

    $stmt2->bind_param("ii", $buyer_id, $offer_id);

    if (!$stmt2->execute()) {
        throw new Exception("Makes insert failed: " . $stmt2->error);
    }

    $stmt2->close();

    echo json_encode([
        "status" => "success",
        "message" => "Offer submitted successfully!",
        "offer_id" => $offer_id
    ]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
}
?>
