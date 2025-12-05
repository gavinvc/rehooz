<?php
// backend/get_user_reviews.php
header("Content-Type: application/json");
require_once "config.php";

$input = json_decode(file_get_contents("php://input"), true);
$target_id = isset($input['target_id']) ? intval($input['target_id']) : 0;

if ($target_id <= 0) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing target_id."
    ]);
    exit;
}

try {
    // get reviews + reviewer usernames
    $stmt = $pdo->prepare("
        SELECT r.id, r.rating, r.comment, r.created_at, u.username AS reviewer_username
        FROM user_reviews r
        JOIN users u ON r.reviewer_id = u.user_id
        WHERE r.target_id = ?
        ORDER BY r.created_at DESC
    ");
    $stmt->execute([$target_id]);
    $reviews = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // average rating
    $avgStmt = $pdo->prepare("
        SELECT AVG(rating) AS avg_rating
        FROM user_reviews
        WHERE target_id = ?
    ");
    $avgStmt->execute([$target_id]);
    $avgRow = $avgStmt->fetch(PDO::FETCH_ASSOC);
    $avg = $avgRow && $avgRow['avg_rating'] ? floatval($avgRow['avg_rating']) : 0;

    echo json_encode([
        "status" => "success",
        "avg_rating" => $avg,
        "reviews" => $reviews
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "Database error."
    ]);
}
