/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Login & Registration Controller (js/login.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialRole = urlParams.get('role') || 'student';

  if (initialRole === 'admin') {
    switchTab('admin');
  } else if (initialRole === 'register') {
    switchTab('register');
  } else {
    switchTab('student');
  }

  initTabListeners();
  initStudentLoginForm();
  initAdminLoginForm();
  initRegisterForm();
});

function switchTab(target) {
  // Hide all sections
  document.getElementById('student-login-section').style.display = 'none';
  document.getElementById('admin-login-section').style.display = 'none';
  document.getElementById('register-section').style.display = 'none';

  // Remove active from all tabs
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

  if (target === 'student') {
    document.getElementById('student-login-section').style.display = 'block';
    document.getElementById('tab-student').classList.add('active');
  } else if (target === 'admin') {
    document.getElementById('admin-login-section').style.display = 'block';
    document.getElementById('tab-admin').classList.add('active');
  } else if (target === 'register') {
    document.getElementById('register-section').style.display = 'block';
    document.getElementById('tab-register').classList.add('active');
  }
}

function initTabListeners() {
  document.getElementById('tab-student').addEventListener('click', () => switchTab('student'));
  document.getElementById('tab-admin').addEventListener('click', () => switchTab('admin'));
  document.getElementById('tab-register').addEventListener('click', () => switchTab('register'));
}

// Student Login
function initStudentLoginForm() {
  const form = document.getElementById('student-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const rollNo = document.getElementById('stud_roll_no').value.trim();
    const pass = document.getElementById('stud_password').value;
    const btn = document.getElementById('stud-login-btn');

    btn.disabled = true;
    btn.innerText = 'Verifying...';

    try {
      const student = await AppStorage.studentLogin(rollNo, pass);
      Auth.setSession(student, 'student');
      showToast(`Welcome back, ${student.Name}!`, 'success');
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'student-dashboard.html';
        window.location.href = redirect;
      }, 700);
    } catch (err) {
      showToast(err.message || 'Login failed. Please check credentials.', 'error');
      btn.disabled = false;
      btn.innerText = 'Log In as Student';
    }
  });
}

// Admin / Management Login
function initAdminLoginForm() {
  const form = document.getElementById('admin-login-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = document.getElementById('admin_username').value.trim();
    const pass = document.getElementById('admin_password').value;
    const btn = document.getElementById('admin-login-btn');

    btn.disabled = true;
    btn.innerText = 'Verifying...';

    try {
      const admin = await AppStorage.adminLogin(user, pass);
      Auth.setSession(admin, 'admin');
      showToast(`Welcome, ${admin.Full_Name}!`, 'success');
      setTimeout(() => {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'admin-dashboard.html';
        window.location.href = redirect;
      }, 700);
    } catch (err) {
      showToast(err.message || 'Login failed. Please check administrator credentials.', 'error');
      btn.disabled = false;
      btn.innerText = 'Log In to Management Portal';
    }
  });
}

// Student Registration
function initRegisterForm() {
  const form = document.getElementById('student-register-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('reg_name').value.trim(),
      roll_no: document.getElementById('reg_roll_no').value.trim(),
      course: document.getElementById('reg_course').value.trim(),
      email: document.getElementById('reg_email').value.trim(),
      password: document.getElementById('reg_password').value
    };

    const btn = document.getElementById('reg-submit-btn');
    btn.disabled = true;
    btn.innerText = 'Creating Account...';

    try {
      const newStudent = await AppStorage.studentRegister(data);
      showToast('Registration successful! Logging you in...', 'success');
      Auth.setSession(newStudent, 'student');
      setTimeout(() => {
        window.location.href = 'student-dashboard.html';
      }, 900);
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      btn.disabled = false;
      btn.innerText = 'Create Student Account';
    }
  });
}

// Demo quick-fill helpers
function fillDemoStudent() {
  switchTab('student');
  document.getElementById('stud_roll_no').value = '2026CSE014';
  document.getElementById('stud_password').value = 'student123';
}

function fillDemoAdmin() {
  switchTab('admin');
  document.getElementById('admin_username').value = 'admin';
  document.getElementById('admin_password').value = 'admin123';
}
