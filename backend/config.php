<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// UVA CS MySQL server connection
$servername = "mysql01.cs.virginia.edu"; 
$username = "zha4ub";       // your computing ID
$password = "Fall2025";  // from phpMyAdmin
$dbname = "zha4ub";

// connect
$conn = new mysqli($servername, $username, $password, $dbname);

// check connection
if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}
?>
