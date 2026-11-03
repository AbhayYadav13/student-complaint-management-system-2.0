<?php
// =======================================================
// GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
// Database Setup Installer (php/setup_db.php)
// =======================================================

header('Content-Type: text/html; charset=UTF-8');

$host     = '127.0.0.1';
$port     = '3306';
$username = 'root';
$password = '';

echo "<body style='font-family:system-ui,sans-serif; max-width:700px; margin:40px auto; line-height:1.6;'>";
echo "<h2>Group 7: Student Complaint Management System (v2) &bull; Database Setup</h2>";

try {
    $pdo = new PDO("mysql:host={$host};port={$port};charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    ]);
    echo "<p style='color:green;'>✓ MySQL Server connection established.</p>";

    $sqlFile = __DIR__ . '/schema.sql';
    if (!file_exists($sqlFile)) {
        die("<p style='color:red;'>✕ schema.sql file not found at: {$sqlFile}</p>");
    }

    $sql = file_get_contents($sqlFile);
    $pdo->exec($sql);

    echo "<p style='color:green;'>✓ Database <code>student_complaint_db2</code> initialized with <code>Student</code>, <code>Admin</code>, and <code>Complaint</code> tables!</p>";
    echo "<p style='color:green;'>✓ Seed accounts and initial complaint records loaded.</p>";
    echo "<hr>";
    echo "<h3>Default Logins:</h3>";
    echo "<ul>";
    echo "<li><strong>Admin / Management Portal:</strong> Username: <code>admin</code> | Password: <code>admin123</code></li>";
    echo "<li><strong>Student Portal:</strong> Roll No: <code>2026CSE014</code> | Password: <code>student123</code> (Aarav Sharma)</li>";
    echo "</ul>";
    echo "<p><a href='../index.html' style='display:inline-block; padding:10px 18px; background:#2563eb; color:#fff; text-decoration:none; border-radius:6px; font-weight:bold;'>🚀 Open Main Portal</a></p>";
} catch (PDOException $e) {
    echo "<p style='color:red;'>✕ Setup failed: " . htmlspecialchars($e->getMessage()) . "</p>";
    echo "<p>Ensure MySQL is running in XAMPP/WAMP and check credentials in <code>php/db_connect.php</code>.</p>";
}
echo "</body>";
