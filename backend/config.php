<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Google Cloud SQL connection
$servername = "35.186.175.37"; // your Cloud SQL public IP
$username = "root";         // the user you created in Cloud SQL
$password = ")6Mn<~BRa8G0Cy^A";   // its password
$dbname = "rehoozdatabase";            // database name in Cloud SQL
$port = 3306;  

$conn = new mysqli($servername, $username, $password, $dbname, $port);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}
?>
