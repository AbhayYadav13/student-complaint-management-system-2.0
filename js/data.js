/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Data Layer (js/data.js)
 * Dual-Mode: PHP/MySQL API + LocalStorage Fallback with Authentication
 */

const AppStorage = (() => {
  const KEY_STUDENTS = 'group7_v2_students';
  const KEY_ADMINS = 'group7_v2_admins';
  const KEY_COMPLAINTS = 'group7_v2_complaints';

  // Seed Admin Accounts
  const seedAdmins = [
    {
      Admin_ID: 1,
      Username: "admin",
      Full_Name: "Prof. Vikram Malhotra",
      Email: "grievance.head@college.edu",
      Password: "admin123",
      Role: "Chief Grievance Officer"
    },
    {
      Admin_ID: 2,
      Username: "warden_hostel",
      Full_Name: "Dr. Sunita Deshmukh",
      Email: "hostel.warden@college.edu",
      Password: "admin123",
      Role: "Hostel Warden & Maintenance Head"
    }
  ];

  // Seed Students
  const seedStudents = [
    {
      Student_ID: 1,
      Name: "Aarav Sharma",
      Roll_No: "2026CSE014",
      Course: "B.Tech Computer Science & Engineering",
      Email: "aarav.sharma@college.edu",
      Password: "student123",
      Created_At: "2026-10-20 09:30:00"
    },
    {
      Student_ID: 2,
      Name: "Sneha Patel",
      Roll_No: "2026IT045",
      Course: "B.Tech Information Technology",
      Email: "sneha.patel@college.edu",
      Password: "student123",
      Created_At: "2026-10-21 11:00:00"
    },
    {
      Student_ID: 3,
      Name: "Rohan Verma",
      Roll_No: "2026ECE022",
      Course: "B.Tech Electronics & Communication",
      Email: "rohan.verma@college.edu",
      Password: "student123",
      Created_At: "2026-10-22 14:15:00"
    },
    {
      Student_ID: 4,
      Name: "Priya Nair",
      Roll_No: "2026ME009",
      Course: "B.Tech Mechanical Engineering",
      Email: "priya.nair@college.edu",
      Password: "student123",
      Created_At: "2026-10-23 16:40:00"
    },
    {
      Student_ID: 5,
      Name: "Aditya Rao",
      Roll_No: "2026MCA018",
      Course: "Master of Computer Applications",
      Email: "aditya.rao@college.edu",
      Password: "student123",
      Created_At: "2026-10-24 10:20:00"
    }
  ];

  // Seed Complaints
  const seedComplaints = [
    {
      Complaint_ID: "CMP-2026-1001",
      Student_ID: 1,
      Subject: "Lab 3 Air Conditioning and System 14 Fault",
      Category: "Infrastructure & Lab",
      Description: "The air conditioning in Computer Lab 3 has been malfunctioning for 3 days and PC #14 crashes continuously during compiler lab sessions.",
      Status: "In Progress",
      Remarks: "Maintenance technician assigned. Replacement power supply scheduled for PC #14.",
      Created_At: "2026-10-25 10:20:00",
      Updated_At: "2026-10-27 15:30:00"
    },
    {
      Complaint_ID: "CMP-2026-1002",
      Student_ID: 2,
      Subject: "Hostel Block B Hot Water Geyser Not Working",
      Category: "Hostel & Mess",
      Description: "The 2nd-floor geyser in Girls Hostel Block B is tripping the main circuit breaker since yesterday morning.",
      Status: "Pending",
      Remarks: "Complaint registered and forwarded to electrical warden.",
      Created_At: "2026-10-26 11:45:00",
      Updated_At: "2026-10-26 11:45:00"
    },
    {
      Complaint_ID: "CMP-2026-1003",
      Student_ID: 3,
      Subject: "Library Portal Access / Online Journal Authentication",
      Category: "Library",
      Description: "Unable to access IEEE Xplore digital library credentials through campus proxy authentication.",
      Status: "Resolved",
      Remarks: "Proxy server credentials refreshed and re-sent to student email on 02-Nov-2026.",
      Created_At: "2026-10-28 10:00:00",
      Updated_At: "2026-11-02 11:15:00"
    },
    {
      Complaint_ID: "CMP-2026-1004",
      Student_ID: 1,
      Subject: "Correction in Semester 4 Internal Mark Sheet",
      Category: "Academic",
      Description: "Marks for Machine Design Lab practical were interchanged with another roll number in the portal copy.",
      Status: "In Progress",
      Remarks: "Faculty verification in progress with Department Academic Coordinator.",
      Created_At: "2026-10-30 14:45:00",
      Updated_At: "2026-11-01 10:20:00"
    },
    {
      Complaint_ID: "CMP-2026-1005",
      Student_ID: 5,
      Subject: "Campus Bus Route #7 Delay and Overcrowding",
      Category: "Transportation",
      Description: "Bus #7 arrives 25 minutes late at the City Center stop, causing students to miss the 9:00 AM attendance cutoff.",
      Status: "Pending",
      Remarks: "Report submitted to transport supervisor for route re-allocation.",
      Created_At: "2026-11-01 16:30:00",
      Updated_At: "2026-11-01 16:30:00"
    }
  ];

  let isPhpAvailable = false;
  let checkedBackend = false;

  async function checkBackend() {
    if (checkedBackend) return isPhpAvailable;
    try {
      if (window.location.protocol === 'file:') {
        isPhpAvailable = false;
        checkedBackend = true;
        return false;
      }
      const res = await fetch('php/api.php?action=check');
      if (res.ok) {
        const json = await res.json();
        isPhpAvailable = !!json.success;
      }
    } catch (e) {
      isPhpAvailable = false;
    }
    checkedBackend = true;
    return isPhpAvailable;
  }

  function initLocal() {
    if (!localStorage.getItem(KEY_ADMINS)) localStorage.setItem(KEY_ADMINS, JSON.stringify(seedAdmins));
    if (!localStorage.getItem(KEY_STUDENTS)) localStorage.setItem(KEY_STUDENTS, JSON.stringify(seedStudents));
    if (!localStorage.getItem(KEY_COMPLAINTS)) localStorage.setItem(KEY_COMPLAINTS, JSON.stringify(seedComplaints));
  }

  function getLocal(k) {
    initLocal();
    return JSON.parse(localStorage.getItem(k) || '[]');
  }

  function setLocal(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  }

  function enrich(complaints) {
    const students = getLocal(KEY_STUDENTS);
    const map = {};
    students.forEach(s => map[s.Student_ID] = s);

    return complaints.map(c => {
      const student = map[c.Student_ID] || { Name: "Unknown", Roll_No: "N/A", Course: "N/A", Email: "N/A" };
      return {
        ...c,
        Student_Name: student.Name,
        Roll_No: student.Roll_No,
        Course: student.Course,
        Email: student.Email
      };
    });
  }

  return {
    isPhpMode: async () => await checkBackend(),

    // Student Login
    async studentLogin(roll_no, password) {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=student_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ roll_no, password })
          });
          const json = await res.json();
          if (json.success) return json.data;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      // Local Fallback
      const students = getLocal(KEY_STUDENTS);
      const student = students.find(s => s.Roll_No.toUpperCase() === roll_no.trim().toUpperCase() && s.Password === password);
      if (!student) throw new Error("Invalid Roll Number or Password.");
      const { Password, ...cleanStudent } = student;
      return cleanStudent;
    },

    // Student Registration
    async studentRegister(formData) {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=student_register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const json = await res.json();
          if (json.success) return json.data;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      // Local Fallback
      const students = getLocal(KEY_STUDENTS);
      if (students.some(s => s.Roll_No.toUpperCase() === formData.roll_no.trim().toUpperCase())) {
        throw new Error(`Student with Roll Number ${formData.roll_no} already exists.`);
      }

      const newId = students.length > 0 ? Math.max(...students.map(s => s.Student_ID)) + 1 : 1;
      const newStudent = {
        Student_ID: newId,
        Name: formData.name.trim(),
        Roll_No: formData.roll_no.trim().toUpperCase(),
        Course: formData.course.trim(),
        Email: formData.email.trim(),
        Password: formData.password,
        Created_At: new Date().toISOString().replace('T', ' ').slice(0, 19)
      };
      students.push(newStudent);
      setLocal(KEY_STUDENTS, students);

      const { Password, ...clean } = newStudent;
      return clean;
    },

    // Admin Login
    async adminLogin(username, password) {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=admin_login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
          });
          const json = await res.json();
          if (json.success) return json.data;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      // Local Fallback
      const admins = getLocal(KEY_ADMINS);
      const admin = admins.find(a => a.Username.toLowerCase() === username.trim().toLowerCase() && a.Password === password);
      if (!admin) throw new Error("Invalid Administrator Username or Password.");
      const { Password, ...cleanAdmin } = admin;
      return cleanAdmin;
    },

    // Get Complaints for a specific student (Student Portal)
    async getStudentComplaints(student_id) {
      if (await checkBackend()) {
        try {
          const res = await fetch(`php/api.php?action=get_student_complaints&student_id=${student_id}`);
          const json = await res.json();
          if (json.success) return json.data;
        } catch (e) {
          console.warn(e);
        }
      }

      const all = enrich(getLocal(KEY_COMPLAINTS));
      return all.filter(c => c.Student_ID === Number(student_id))
                .sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At));
    },

    // Get All Complaints (Admin / Management Portal)
    async getAllComplaints(filters = {}) {
      if (await checkBackend()) {
        try {
          const p = new URLSearchParams({
            action: 'get_all_complaints',
            status: filters.status || 'All',
            category: filters.category || 'All'
          });
          const res = await fetch(`php/api.php?${p.toString()}`);
          const json = await res.json();
          if (json.success) return json.data;
        } catch (e) {
          console.warn(e);
        }
      }

      let list = enrich(getLocal(KEY_COMPLAINTS));
      if (filters.status && filters.status !== 'All') {
        list = list.filter(c => c.Status.toLowerCase() === filters.status.toLowerCase());
      }
      if (filters.category && filters.category !== 'All') {
        list = list.filter(c => c.Category.toLowerCase() === filters.category.toLowerCase());
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        list = list.filter(c => 
          c.Complaint_ID.toLowerCase().includes(q) ||
          c.Student_Name.toLowerCase().includes(q) ||
          c.Roll_No.toLowerCase().includes(q) ||
          c.Subject.toLowerCase().includes(q)
        );
      }
      return list.sort((a, b) => new Date(b.Created_At) - new Date(a.Created_At));
    },

    // Submit Complaint
    async createComplaint(data) {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=create_complaint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
          });
          const json = await res.json();
          if (json.success) return json;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      // Local Fallback
      const complaints = getLocal(KEY_COMPLAINTS);
      const year = new Date().getFullYear();
      let newId = `CMP-${year}-${complaints.length + 1001}`;
      while (complaints.some(c => c.Complaint_ID === newId)) {
        newId = `CMP-${year}-${Math.floor(1000 + Math.random() * 9000)}`;
      }

      const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
      const newRecord = {
        Complaint_ID: newId,
        Student_ID: Number(data.student_id),
        Subject: data.subject.trim(),
        Category: data.category.trim(),
        Description: data.description.trim(),
        Status: "Pending",
        Remarks: "Complaint logged and queued for administrative review.",
        Created_At: now,
        Updated_At: now
      };

      complaints.unshift(newRecord);
      setLocal(KEY_COMPLAINTS, complaints);

      return {
        success: true,
        message: `Complaint lodged successfully! ID: ${newId}`,
        data: {
          ...newRecord,
          complaint_id: newId,
          name: data.name,
          roll_no: data.roll_no,
          course: data.course,
          email: data.email
        }
      };
    },

    // Update Complaint Status (Management)
    async updateStatus(complaintId, newStatus, remarks = '') {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=update_status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ complaint_id: complaintId, status: newStatus, remarks })
          });
          const json = await res.json();
          if (json.success) return json;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      // Local Fallback
      const complaints = getLocal(KEY_COMPLAINTS);
      const idx = complaints.findIndex(c => c.Complaint_ID.toUpperCase() === complaintId.toUpperCase());
      if (idx === -1) throw new Error(`Complaint ${complaintId} not found.`);

      complaints[idx].Status = newStatus;
      if (remarks.trim()) complaints[idx].Remarks = remarks.trim();
      complaints[idx].Updated_At = new Date().toISOString().replace('T', ' ').slice(0, 19);

      setLocal(KEY_COMPLAINTS, complaints);
      return { success: true, message: `Status updated to ${newStatus}`, data: complaints[idx] };
    },

    // Universal Search by ID
    async searchComplaint(complaintId) {
      const q = complaintId.trim().toUpperCase();
      if (await checkBackend()) {
        try {
          const res = await fetch(`php/api.php?action=search&complaint_id=${encodeURIComponent(q)}`);
          const json = await res.json();
          if (json.success) return json.data;
          throw new Error(json.message);
        } catch (e) {
          if (!e.message.includes('fetch')) throw e;
        }
      }

      const all = enrich(getLocal(KEY_COMPLAINTS));
      const found = all.find(c => c.Complaint_ID.toUpperCase() === q || c.Complaint_ID.toUpperCase().includes(q));
      if (!found) throw new Error(`No complaint found matching ID "${complaintId}".`);
      return found;
    },

    // Portal Overall Stats
    async getStatistics() {
      if (await checkBackend()) {
        try {
          const res = await fetch('php/api.php?action=stats');
          const json = await res.json();
          if (json.success) return json.data;
        } catch (e) {
          console.warn(e);
        }
      }

      const complaints = getLocal(KEY_COMPLAINTS);
      const students = getLocal(KEY_STUDENTS);
      return {
        total: complaints.length,
        pending: complaints.filter(c => c.Status === 'Pending').length,
        in_progress: complaints.filter(c => c.Status === 'In Progress').length,
        resolved: complaints.filter(c => c.Status === 'Resolved').length,
        students: students.length
      };
    },

    resetToDefaults() {
      localStorage.setItem(KEY_ADMINS, JSON.stringify(seedAdmins));
      localStorage.setItem(KEY_STUDENTS, JSON.stringify(seedStudents));
      localStorage.setItem(KEY_COMPLAINTS, JSON.stringify(seedComplaints));
    }
  };
})();
