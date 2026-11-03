-- =======================================================
-- GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
-- Dual-Portal Edition: Student Portal & Management Portal
-- Database Schema Script
-- Technology: MySQL / MariaDB
-- =======================================================

CREATE DATABASE IF NOT EXISTS student_complaint_db2;
USE student_complaint_db2;

-- Drop tables in order of foreign key dependencies
DROP TABLE IF EXISTS Complaint;
DROP TABLE IF EXISTS Admin;
DROP TABLE IF EXISTS Student;

-- -------------------------------------------------------
-- Table 1: Student Table (Module 2 + Authentication)
-- Fields: Student_ID, Name, Roll_No, Course, Email, Password
-- -------------------------------------------------------
CREATE TABLE Student (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Roll_No VARCHAR(50) NOT NULL UNIQUE,
    Course VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table 2: Admin / Management Table
-- Fields: Admin_ID, Username, Full_Name, Email, Password, Role
-- -------------------------------------------------------
CREATE TABLE Admin (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Grievance Officer',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Table 3: Complaint Table (Modules 3, 4, 5, 6)
-- Fields: Complaint_ID, Student_ID, Subject, Category, Description, Status, Remarks
-- -------------------------------------------------------
CREATE TABLE Complaint (
    Complaint_ID VARCHAR(30) PRIMARY KEY,
    Student_ID INT NOT NULL,
    Subject VARCHAR(255) NOT NULL,
    Category VARCHAR(100) NOT NULL,
    Description TEXT NOT NULL,
    Status ENUM('Pending', 'In Progress', 'Resolved') DEFAULT 'Pending',
    Remarks TEXT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Updated_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (Student_ID) REFERENCES Student(Student_ID) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- -------------------------------------------------------
-- Seed Data: Management / Admin Accounts
-- -------------------------------------------------------
INSERT INTO Admin (Admin_ID, Username, Full_Name, Email, Password, Role) VALUES
(1, 'admin', 'Prof. Vikram Malhotra', 'grievance.head@college.edu', 'admin123', 'Chief Grievance Officer'),
(2, 'warden_hostel', 'Dr. Sunita Deshmukh', 'hostel.warden@college.edu', 'admin123', 'Hostel Warden & Maintenance Head');

-- -------------------------------------------------------
-- Seed Data: Students (Password: student123)
-- -------------------------------------------------------
INSERT INTO Student (Student_ID, Name, Roll_No, Course, Email, Password) VALUES
(1, 'Aarav Sharma', '2026CSE014', 'B.Tech Computer Science & Engineering', 'aarav.sharma@college.edu', 'student123'),
(2, 'Sneha Patel', '2026IT045', 'B.Tech Information Technology', 'sneha.patel@college.edu', 'student123'),
(3, 'Rohan Verma', '2026ECE022', 'B.Tech Electronics & Communication', 'rohan.verma@college.edu', 'student123'),
(4, 'Priya Nair', '2026ME009', 'B.Tech Mechanical Engineering', 'priya.nair@college.edu', 'student123'),
(5, 'Aditya Rao', '2026MCA018', 'Master of Computer Applications', 'aditya.rao@college.edu', 'student123');

-- -------------------------------------------------------
-- Seed Data: Complaints
-- -------------------------------------------------------
INSERT INTO Complaint (Complaint_ID, Student_ID, Subject, Category, Description, Status, Remarks) VALUES
('CMP-2026-1001', 1, 'Lab 3 Air Conditioning and System 14 Fault', 'Infrastructure & Lab', 'The air conditioning in Computer Lab 3 has been malfunctioning for 3 days and PC #14 crashes continuously during compiler lab sessions.', 'In Progress', 'Maintenance technician assigned. Replacement power supply scheduled for PC #14.'),
('CMP-2026-1002', 2, 'Hostel Block B Hot Water Geyser Not Working', 'Hostel & Mess', 'The 2nd-floor geyser in Girls Hostel Block B is tripping the main circuit breaker since yesterday morning.', 'Pending', 'Complaint registered and forwarded to electrical warden.'),
('CMP-2026-1003', 3, 'Library Portal Access / Online Journal Authentication', 'Library', 'Unable to access IEEE Xplore digital library credentials through campus proxy authentication.', 'Resolved', 'Proxy server credentials refreshed and re-sent to student email on 02-Nov-2026.'),
('CMP-2026-1004', 1, 'Correction in Semester 4 Internal Mark Sheet', 'Academic', 'Marks for Machine Design Lab practical were interchanged with another roll number in the portal copy.', 'In Progress', 'Faculty verification in progress with Department Academic Coordinator.'),
('CMP-2026-1005', 5, 'Campus Bus Route #7 Delay and Overcrowding', 'Transportation', 'Bus #7 arrives 25 minutes late at the City Center stop, causing students to miss the 9:00 AM attendance cutoff.', 'Pending', 'Report submitted to transport supervisor for route re-allocation.');
