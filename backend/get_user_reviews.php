<?php
// backend/get_user_reviews.php
header("Content-Type: application/json; charset=utf-8");
include "config.php";   // same as get_user.php

$raw = file_get_contents("php://input");
$input = json_decode($raw, true);

if (!is_array($input)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid JSON input."
    ]);
    exit;
}

$target_id = isset($input['target_id']) ? (int)$input['target_id'] : 0;

if ($target_id <= 0) {
    echo json_encode([
        "status"  => "error",
        "message" => "Missing target_id."
    ]);
    exit;
}

// Treat these as "profile" ratings
$rateType = "profile";

// 1) Fetch ratings for this user
$stmt = $conn->prepare("
    SELECT r.rater_id,
           r.score,
           u.username AS rater_username
    FROM Rates r
    JOIN User u ON r.rater_id = u.user_id
    WHERE r.user_id = ? AND r.type = ?
    ORDER BY r.rater_id ASC
");
$stmt->bind_param("is", $target_id, $rateType);
$stmt->execute();
$result = $stmt->get_result();

$ratings = [];
while ($row = $result->fetch_assoc()) {
    $ratings[] = $row;
}
$stmt->close();

// 2) Compute average score
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

echo json_encode([
    "status"     => "success",
    "avg_rating" => $avg,
    "ratings"    => $ratings
]);

$conn->close();
