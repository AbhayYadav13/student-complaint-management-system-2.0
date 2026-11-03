<?php
// =======================================================
// GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
// RESTful Backend API (php/api.php)
// Supports Student Portal & Management Portal
// =======================================================

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/db_connect.php';

function sendResponse($success, $message, $data = null, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success'   => $success,
        'message'   => $message,
        'data'      => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    exit();
}

if (!$pdo) {
    sendResponse(false, "Database connection error: " . ($db_connection_error ?? 'Check MySQL server.'), null, 500);
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';
$rawInput = file_get_contents('php://input');
$jsonInput = json_decode($rawInput, true);
if (is_array($jsonInput)) {
    if (empty($action) && isset($jsonInput['action'])) {
        $action = $jsonInput['action'];
    }
    $_POST = array_merge($_POST, $jsonInput);
}

switch ($action) {

    // ---------------------------------------------------
    // Health Check
    // ---------------------------------------------------
    case 'check':
        sendResponse(true, "PHP & MySQL backend online for Portal v2.", [
            'database' => 'student_complaint_db2',
            'server'   => $_SERVER['SERVER_SOFTWARE'] ?? 'PHP CLI / Apache'
        ]);
        break;

    // ---------------------------------------------------
    // Auth: Student Login
    // ---------------------------------------------------
    case 'student_login':
        $roll_no  = trim($_POST['roll_no'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($roll_no) || empty($password)) {
            sendResponse(false, "Roll Number and Password are required.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT Student_ID, Name, Roll_No, Course, Email, Password FROM Student WHERE UPPER(Roll_No) = UPPER(?) LIMIT 1");
            $stmt->execute([$roll_no]);
            $student = $stmt->fetch();

            if (!$student || $student['Password'] !== $password) {
                sendResponse(false, "Invalid Roll Number or Password.", null, 401);
            }

            unset($student['Password']);
            sendResponse(true, "Student login successful.", $student);
        } catch (PDOException $e) {
            sendResponse(false, "Login error: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Auth: Student Registration
    // ---------------------------------------------------
    case 'student_register':
        $name     = trim($_POST['name'] ?? '');
        $roll_no  = trim($_POST['roll_no'] ?? '');
        $course   = trim($_POST['course'] ?? '');
        $email    = trim($_POST['email'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($name) || empty($roll_no) || empty($course) || empty($email) || empty($password)) {
            sendResponse(false, "All registration fields are required.", null, 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            sendResponse(false, "Invalid email address format.", null, 400);
        }

        try {
            // Check if Roll No exists
            $check = $pdo->prepare("SELECT Student_ID FROM Student WHERE UPPER(Roll_No) = UPPER(?) LIMIT 1");
            $check->execute([$roll_no]);
            if ($check->fetch()) {
                sendResponse(false, "A student with Roll Number {$roll_no} is already registered.", null, 409);
            }

            $stmt = $pdo->prepare("INSERT INTO Student (Name, Roll_No, Course, Email, Password) VALUES (?, ?, ?, ?, ?)");
            $stmt->execute([$name, strtoupper($roll_no), $course, $email, $password]);
            $student_id = (int)$pdo->lastInsertId();

            sendResponse(true, "Student account created successfully! You can now log in.", [
                'Student_ID' => $student_id,
                'Name'       => $name,
                'Roll_No'    => strtoupper($roll_no),
                'Course'     => $course,
                'Email'      => $email
            ], 201);
        } catch (PDOException $e) {
            sendResponse(false, "Registration error: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Auth: Admin / Management Login
    // ---------------------------------------------------
    case 'admin_login':
        $username = trim($_POST['username'] ?? '');
        $password = trim($_POST['password'] ?? '');

        if (empty($username) || empty($password)) {
            sendResponse(false, "Username and Password are required.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("SELECT Admin_ID, Username, Full_Name, Email, Role, Password FROM Admin WHERE Username = ? LIMIT 1");
            $stmt->execute([$username]);
            $admin = $stmt->fetch();

            if (!$admin || $admin['Password'] !== $password) {
                sendResponse(false, "Invalid Management Username or Password.", null, 401);
            }

            unset($admin['Password']);
            sendResponse(true, "Management login successful.", $admin);
        } catch (PDOException $e) {
            sendResponse(false, "Admin login error: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Stats: Portal Overview Metrics
    // ---------------------------------------------------
    case 'stats':
        try {
            $total = (int)$pdo->query("SELECT COUNT(*) FROM Complaint")->fetchColumn();
            $pending = (int)$pdo->query("SELECT COUNT(*) FROM Complaint WHERE Status = 'Pending'")->fetchColumn();
            $inProgress = (int)$pdo->query("SELECT COUNT(*) FROM Complaint WHERE Status = 'In Progress'")->fetchColumn();
            $resolved = (int)$pdo->query("SELECT COUNT(*) FROM Complaint WHERE Status = 'Resolved'")->fetchColumn();
            $students = (int)$pdo->query("SELECT COUNT(*) FROM Student")->fetchColumn();

            sendResponse(true, "Statistics retrieved.", [
                'total'       => $total,
                'pending'     => $pending,
                'in_progress' => $inProgress,
                'resolved'    => $resolved,
                'students'    => $students
            ]);
        } catch (PDOException $e) {
            sendResponse(false, "Stats error: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Student: Get Student's Own Complaints
    // ---------------------------------------------------
    case 'get_student_complaints':
        $student_id = (int)($_GET['student_id'] ?? $_POST['student_id'] ?? 0);
        if ($student_id <= 0) {
            sendResponse(false, "Valid Student_ID required.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("
                SELECT c.*, s.Name AS Student_Name, s.Roll_No, s.Course, s.Email
                FROM Complaint c
                INNER JOIN Student s ON c.Student_ID = s.Student_ID
                WHERE c.Student_ID = ?
                ORDER BY c.Created_At DESC
            ");
            $stmt->execute([$student_id]);
            $records = $stmt->fetchAll();
            sendResponse(true, "Student complaints retrieved.", $records);
        } catch (PDOException $e) {
            sendResponse(false, "Failed to load student complaints: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Management: Get All Complaints with Filters
    // ---------------------------------------------------
    case 'get_all_complaints':
        try {
            $status   = trim($_GET['status'] ?? '');
            $category = trim($_GET['category'] ?? '');

            $query = "
                SELECT c.*, s.Name AS Student_Name, s.Roll_No, s.Course, s.Email
                FROM Complaint c
                INNER JOIN Student s ON c.Student_ID = s.Student_ID
            ";
            $where = [];
            $params = [];

            if (!empty($status) && $status !== 'All') {
                $where[] = "c.Status = ?";
                $params[] = $status;
            }
            if (!empty($category) && $category !== 'All') {
                $where[] = "c.Category = ?";
                $params[] = $category;
            }

            if (!empty($where)) {
                $query .= " WHERE " . implode(" AND ", $where);
            }
            $query .= " ORDER BY c.Created_At DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            sendResponse(true, "All complaints retrieved.", $stmt->fetchAll());
        } catch (PDOException $e) {
            sendResponse(false, "Failed to load records: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Modules 2 & 3: Submit Complaint (Student or Generic)
    // ---------------------------------------------------
    case 'create_complaint':
        $student_id  = (int)($_POST['student_id'] ?? 0);
        $name        = trim($_POST['name'] ?? '');
        $roll_no     = trim($_POST['roll_no'] ?? '');
        $course      = trim($_POST['course'] ?? '');
        $email       = trim($_POST['email'] ?? '');
        $subject     = trim($_POST['subject'] ?? '');
        $category    = trim($_POST['category'] ?? '');
        $description = trim($_POST['description'] ?? '');

        if (empty($subject) || empty($category) || empty($description)) {
            sendResponse(false, "Complaint subject, category, and description are required.", null, 400);
        }

        try {
            $pdo->beginTransaction();

            if ($student_id <= 0) {
                // Check by roll number
                $stmt = $pdo->prepare("SELECT Student_ID FROM Student WHERE UPPER(Roll_No) = UPPER(?) LIMIT 1");
                $stmt->execute([$roll_no]);
                $found = $stmt->fetch();
                if ($found) {
                    $student_id = (int)$found['Student_ID'];
                } else {
                    // Create student account
                    $stmtIns = $pdo->prepare("INSERT INTO Student (Name, Roll_No, Course, Email, Password) VALUES (?, ?, ?, ?, 'student123')");
                    $stmtIns->execute([$name, strtoupper($roll_no), $course, $email]);
                    $student_id = (int)$pdo->lastInsertId();
                }
            }

            // Generate Unique Complaint ID: CMP-YYYY-XXXX
            $year = date('Y');
            $count = (int)$pdo->query("SELECT COUNT(*) FROM Complaint")->fetchColumn() + 1001;
            do {
                $complaint_id = sprintf("CMP-%s-%04d", $year, $count);
                $chk = $pdo->prepare("SELECT COUNT(*) FROM Complaint WHERE Complaint_ID = ?");
                $chk->execute([$complaint_id]);
                $exists = (int)$chk->fetchColumn();
                if ($exists > 0) $count++;
            } while ($exists > 0);

            $stmtComp = $pdo->prepare("
                INSERT INTO Complaint (Complaint_ID, Student_ID, Subject, Category, Description, Status, Remarks)
                VALUES (?, ?, ?, ?, ?, 'Pending', 'Complaint registered. Assigned for administrative review.')
            ");
            $stmtComp->execute([$complaint_id, $student_id, $subject, $category, $description]);

            $pdo->commit();

            sendResponse(true, "Complaint registered successfully with ID: {$complaint_id}", [
                'complaint_id' => $complaint_id,
                'student_id'   => $student_id,
                'status'       => 'Pending',
                'subject'      => $subject,
                'category'     => $category,
                'description'  => $description,
                'created_at'   => date('Y-m-d H:i:s')
            ], 201);
        } catch (PDOException $e) {
            if ($pdo->inTransaction()) $pdo->rollBack();
            sendResponse(false, "Submission error: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Module 5: Update Complaint Status (Management)
    // ---------------------------------------------------
    case 'update_status':
        $complaint_id = trim($_POST['complaint_id'] ?? '');
        $new_status   = trim($_POST['status'] ?? '');
        $remarks      = trim($_POST['remarks'] ?? '');

        if (empty($complaint_id) || empty($new_status)) {
            sendResponse(false, "Complaint ID and new status are required.", null, 400);
        }

        $validStatuses = ['Pending', 'In Progress', 'Resolved'];
        if (!in_array($new_status, $validStatuses, true)) {
            sendResponse(false, "Invalid status choice.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("
                UPDATE Complaint 
                SET Status = ?, Remarks = COALESCE(NULLIF(?, ''), Remarks), Updated_At = CURRENT_TIMESTAMP
                WHERE Complaint_ID = ?
            ");
            $stmt->execute([$new_status, $remarks, $complaint_id]);

            if ($stmt->rowCount() === 0) {
                // Verify whether complaint exists
                $chk = $pdo->prepare("SELECT Complaint_ID FROM Complaint WHERE Complaint_ID = ?");
                $chk->execute([$complaint_id]);
                if (!$chk->fetch()) {
                    sendResponse(false, "Complaint {$complaint_id} not found.", null, 404);
                }
            }

            sendResponse(true, "Complaint {$complaint_id} updated to {$new_status}.", [
                'complaint_id' => $complaint_id,
                'status'       => $new_status,
                'remarks'      => $remarks
            ]);
        } catch (PDOException $e) {
            sendResponse(false, "Update failed: " . $e->getMessage(), null, 500);
        }
        break;

    // ---------------------------------------------------
    // Module 6: Universal Search by Complaint ID
    // ---------------------------------------------------
    case 'search':
        $searchId = trim($_GET['complaint_id'] ?? $_POST['complaint_id'] ?? '');
        if (empty($searchId)) {
            sendResponse(false, "Complaint ID required for search.", null, 400);
        }

        try {
            $stmt = $pdo->prepare("
                SELECT c.*, s.Name AS Student_Name, s.Roll_No, s.Course, s.Email
                FROM Complaint c
                INNER JOIN Student s ON c.Student_ID = s.Student_ID
                WHERE c.Complaint_ID = ? OR c.Complaint_ID LIKE ?
                LIMIT 1
            ");
            $stmt->execute([$searchId, "%{$searchId}%"]);
            $complaint = $stmt->fetch();

            if (!$complaint) {
                sendResponse(false, "No complaint found with ID {$searchId}.", null, 404);
            }

            sendResponse(true, "Complaint details found.", $complaint);
        } catch (PDOException $e) {
            sendResponse(false, "Search failed: " . $e->getMessage(), null, 500);
        }
        break;

    default:
        sendResponse(false, "Action '{$action}' not recognized.", null, 400);
        break;
}
