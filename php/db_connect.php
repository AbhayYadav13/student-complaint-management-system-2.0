<?php
// =======================================================
// GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
// Database Connection File (php/db_connect.php)
// =======================================================

header('Content-Type: application/json; charset=UTF-8');

$host     = '127.0.0.1';
$port     = '3306';
$dbname   = 'student_complaint_db2';
$username = 'root';
$password = ''; // Default in XAMPP / WAMP is empty

try {
    $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $username, $password, $options);
} catch (PDOException $e) {
    $pdo = null;
    $db_connection_error = $e->getMessage();
}
