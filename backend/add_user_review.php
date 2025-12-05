<?php
// backend/add_user_review.php
header("Content-Type: application/json");
require_once "config.php";

$input = json_decode(file_get_contents("php://input"), true);

$target_id   = isset($input['target_id']) ? intval($input['target_id']) : 0;
$reviewer_id = isset($input['reviewer_id']) ? intval($input['reviewer_id']) : 0;
$rating      = isset($input['rating']) ? intval($input['rating']) : 0;
$comment     = isset($input['comment']) ? trim($input['comment']) : "";

if ($target_id <= 0 || $reviewer_id <= 0) {
    echo json_encode(["status" => "error", "message" => "Missing user IDs."]);
    exit;
}

if ($target_id === $reviewer_id) {
    echo json_encode(["status" => "error", "message" => "You cannot review yourself."]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode(["status" => "error", "message" => "Rating must be between 1 and 5."]);
    exit;
}

try {
    // insert review
    $stmt = $pdo->prepare("
        INSERT INTO user_reviews (target_id, reviewer_id, rating, comment)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->execute([$target_id, $reviewer_id, $rating, $comment]);

    // recalc overall rating for that user and store in users.overall_rating if you have it
    $avgStmt = $pdo->prepare("
        SELECT AVG(rating) AS avg_rating
        FROM user_reviews
        WHERE target_id = ?
    ");
    $avgStmt->execute([$target_id]);
    $avgRow = $avgStmt->fetch(PDO::FETCH_ASSOC);
    $avg = $avgRow && $avgRow['avg_rating'] ? floatval($avgRow['avg_rating']) : 0;

    $update = $pdo->prepare("
        UPDATE users SET overall_rating = ? WHERE user_id = ?
    ");
    $update->execute([$avg, $target_id]);

    echo json_encode([
        "status" => "success",
        "message" => "Review added.",
        "avg_rating" => $avg
    ]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database error."]);
}
