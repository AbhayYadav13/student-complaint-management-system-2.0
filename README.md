# Group 7 – Student Complaint Management System (v2)
## Dual-Portal Edition: Separated Student & Management Portals

A role-separated grievance management application designed with authenticated portals for **Students** and **Institutional Management**, built using pure **HTML5, CSS3, Vanilla JavaScript, PHP, and MySQL**.

---

## 🎯 Role Separation Architecture

The application cleanly partitions user access through a dedicated **Login & Authentication Interface** ([`login.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/login.html)):

```
                               [ Main Landing Page (index.html) ]
                                                │
                                    [ Login Interface (login.html) ]
                                       ├── Student Login
                                       ├── Management Login
                                       └── Student Sign Up
                                      /                  \
            ┌────────────────────────┴─┐        ┌─────────┴────────────────────────┐
            │      STUDENT PORTAL      │        │        MANAGEMENT PORTAL         │
            ├──────────────────────────┤        ├──────────────────────────────────┤
            │ • My Personal Dashboard  │        │ • Campus Health & Metrics        │
            │ • Lodge Complaint        │        │ • Central Complaint Ledger       │
            │ • My Complaints History  │        │ • Update Status Workflow         │
            │ • Real-Time Track by ID  │        │ • Search, Audit & Print Reports  │
            └──────────────────────────┘        └──────────────────────────────────┘
```

---

## 🔑 Default Test Credentials

| Portal | Login Identifier | Password | Identity / Role |
|---|---|---|---|
| **Student Portal** | Roll No: `2026CSE014` | `student123` | Aarav Sharma (B.Tech CSE) |
| **Student Portal (Alt)** | Roll No: `2026IT045` | `student123` | Sneha Patel (B.Tech IT) |
| **Management Portal** | Username: `admin` | `admin123` | Prof. Vikram Malhotra (Chief Grievance Officer) |
| **Management Portal (Alt)**| Username: `warden_hostel` | `admin123` | Dr. Sunita Deshmukh (Hostel Warden) |

*Note: New students can also self-register instantly using the **"New Student Sign Up"** tab on `login.html`.*

---

## 🧱 Module Implementation

| Module | Role / Scope | Implemented Pages | Functionality |
|---|---|---|---|
| **Module 1: Home Page** | Public & Informational | [`index.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/index.html) | Portal information, navigation links, campus metrics, policy overview, and portal selector cards. |
| **Module 2: Student Details** | Student Profile Intake | [`student-submit.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/student-submit.html) & [`login.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/login.html) | Manages Name, Roll Number, Course, and Email. Pre-fills automatically from logged-in session. |
| **Module 3: Submit Complaint** | Grievance Intake | [`student-submit.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/student-submit.html) | Captures Subject, Category, Description. Generates unique Complaint ID (`CMP-YYYY-XXXX`) and displays receipt modal. |
| **Module 4: Complaint Records** | Student: Personal<br>Admin: Campus-Wide | [`student-dashboard.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/student-dashboard.html)<br>[`admin-records.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/admin-records.html) | Students see only **their own** grievances and status logs.<br>Management sees **all complaints** across campus with filters and search. |
| **Module 5: Update Complaint Status** | Management / Admin | [`admin-update.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/admin-update.html) & Modal | Transition status to **Pending**, **In Progress**, or **Resolved** with official action remarks. |
| **Module 6: Search Complaint** | Universal Tracker | [`student-track.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/student-track.html)<br>[`admin-search.html`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/admin-search.html) | Search by Complaint ID to inspect 3-stage progress stepper, full facts, action logs, and print receipt. |

---

## 🗄️ Database Architecture (`student_complaint_db2`)

Defined in [`php/schema.sql`](file:///C:/Users/DELL/.gemini/antigravity/scratch/student-complaint-management-system-2/php/schema.sql):

### 1. `Student` Table
```sql
CREATE TABLE Student (
    Student_ID INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Roll_No VARCHAR(50) NOT NULL UNIQUE,
    Course VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. `Admin` Table
```sql
CREATE TABLE Admin (
    Admin_ID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Full_Name VARCHAR(100) NOT NULL,
    Email VARCHAR(120) NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) DEFAULT 'Grievance Officer',
    Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3. `Complaint` Table
```sql
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
);
```

---

## 🚀 How to Run the Application

### Option 1: Instant Browser Preview (Zero Setup Needed)
1. Open the project folder:
   `student-complaint-management-system-2/`
2. Double-click **`index.html`** in any web browser.
3. Click **"Enter Student Portal"** or **"Enter Management Portal"**.
4. Use the one-click demo buttons on `login.html` to instantly sign in as either a student or administrator.
5. All 6 modules, data persistence, and status changes work immediately using client `localStorage`.

---

### Option 2: Full-Stack PHP & MySQL Mode (XAMPP / WAMP)
1. Copy `student-complaint-management-system-2` into your web server directory:
   `C:\xampp\htdocs\student-complaint-management-system-2`
2. Start **Apache** and **MySQL** in XAMPP.
3. Open the automated database installer in your browser:
   `http://localhost/student-complaint-management-system-2/php/setup_db.php`
4. Access the web portal:
   `http://localhost/student-complaint-management-system-2/`
5. The top status bar will show `🟢 Backend: PHP & MySQL Database Connected`.

---

## 📁 File Structure

```text
student-complaint-management-system-2/
│
├── index.html                  # Module 1: Main Landing & Portal Selection
├── login.html                  # Role-Based Login & Student Sign Up
├── index.php                   # Server Entrypoint
├── README.md                   # Full Documentation
│
├── student-dashboard.html      # Student: Personal Stats & My Complaints (Module 4)
├── student-submit.html         # Student: Student Details (Module 2) + Lodging (Module 3)
├── student-track.html          # Student: Search & Progress Stepper (Module 6)
│
├── admin-dashboard.html        # Management: Campus Stats & Activity (Module 1)
├── admin-records.html          # Management: Central Complaint Ledger (Module 4)
├── admin-update.html           # Management: Update Complaint Status Tool (Module 5)
├── admin-search.html           # Management: Complaint Audit & Lookup (Module 6)
│
├── css/
│   └── style.css               # Portal theme styling, badges, modals, stepper
│
├── js/
│   ├── data.js                 # Central Data Layer (Dual-Mode: PHP API + LocalStorage)
│   ├── auth.js                 # Session guard & role authorization
│   ├── main.js                 # Shared UI helpers, badges, toasts
│   ├── login.js                # Login tabs controller & demo auto-fill
│   ├── student.js              # Student dashboard, personal records & submission
│   ├── admin.js                # Management dashboard, full ledger & status updater
│   └── search.js               # Universal search & 3-stage progress stepper
│
└── php/
    ├── db_connect.php          # MySQL PDO database connection
    ├── api.php                 # RESTful API with authentication & all 6 modules
    ├── schema.sql              # Database schema & seed data
    └── setup_db.php            # Automated one-click installer
```
