<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

$host = "/cloudsql/rehoozdb:us-east4:rehooz2025";
$username = "root";
$password = ")6Mn<~BRa8G0Cy^A"; #TODO - reset + set via env-var
$dbname = "rehoozdatabase";

$conn = new mysqli(null, $username, $password, $dbname, null, $host);

if ($conn->connect_error) {
    die(json_encode([
        "status" => "error",
        "message" => "Connection failed: " . $conn->connect_error
    ]));
}
?>
