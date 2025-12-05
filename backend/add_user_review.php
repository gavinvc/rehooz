<?php
// backend/add_user_review.php
header("Content-Type: application/json; charset=utf-8");
include "config.php";   // same include as get_user.php

$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input."
    ]);
    exit;
}

$target_id   = isset($input['target_id']) ? (int)$input['target_id'] : 0;
$reviewer_id = isset($input['reviewer_id']) ? (int)$input['reviewer_id'] : 0;
$rating      = isset($input['rating']) ? (int)$input['rating'] : 0;

$rateType = "profile";

if ($target_id <= 0 || $reviewer_id <= 0) {
    echo json_encode([
        "status"  => "error",
        "message" => "Missing user IDs."
    ]);
    exit;
}

if ($target_id === $reviewer_id) {
    echo json_encode([
        "status"  => "error",
        "message" => "You cannot rate yourself."
    ]);
    exit;
}

if ($rating < 1 || $rating > 5) {
    echo json_encode([
        "status"  => "error",
        "message" => "Rating must be between 1 and 5."
    ]);
    exit;
}

try {
    // 1) Insert rating into Rates
    $stmt = $conn->prepare("
        INSERT INTO Rates (rater_id, user_id, type, score)
        VALUES (?, ?, ?, ?)
    ");
    $stmt->bind_param("iisi", $reviewer_id, $target_id, $rateType, $rating);
    $stmt->execute();
    $stmt->close();

    // 2) Recompute average rating for this user
    $avgStmt = $conn->prepare("
        SELECT AVG(score) AS avg_score
        FROM Rates
        WHERE user_id = ? AND type = ?
    ");
    $avgStmt->bind_param("is", $target_id, $rateType);
    $avgStmt->execute();
    $avgResult = $avgStmt->get_result();
    $avgRow = $avgResult->fetch_assoc();
    $avgStmt->close();

    $avg = ($avgRow && $avgRow['avg_score'] !== null)
        ? (float)$avgRow['avg_score']
        : 0.0;

    // 3) Update User.overall_rating
    $update = $conn->prepare("
        UPDATE User
        SET overall_rating = ?
        WHERE user_id = ?
    ");
    $update->bind_param("di", $avg, $target_id);
    $update->execute();
    $update->close();

    echo json_encode([
        "status"     => "success",
        "message"    => "Rating saved.",
        "avg_rating" => $avg
    ]);
} catch (Exception $e) {
    echo json_encode([
        "status"  => "error",
        "message" => "Database error."
    ]);
}

$conn->close();
