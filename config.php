<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Google Cloud SQL connection
$servername = "136.107.23.167"; // your Cloud SQL public IP
$username = "phpadmin";         // the user you created in Cloud SQL
$password = "CvilleF25";   // its password
$dbname = "rehooz-db";            // database name in Cloud SQL

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}
?>
