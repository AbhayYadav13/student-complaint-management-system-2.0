/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Student Portal Logic (js/student.js)
 */

let currentStudent = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentStudent = Auth.requireStudent();
  if (!currentStudent) return;

  // Greet student
  const nameEl = document.getElementById('student-greeting-name');
  if (nameEl) nameEl.innerText = currentStudent.Name;

  const rollEl = document.getElementById('student-greeting-roll');
  if (rollEl) rollEl.innerText = `${currentStudent.Roll_No} • ${currentStudent.Course}`;

  // If on student dashboard, load complaints & stats
  if (document.getElementById('my-complaints-table-body')) {
    await loadStudentComplaints();
  }

  // If on submission page, pre-fill student details
  initSubmitForm();
});

// Load student's own complaints
async function loadStudentComplaints() {
  const tbody = document.getElementById('my-complaints-table-body');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">Loading your submitted complaints...</td></tr>`;

  try {
    const list = await AppStorage.getStudentComplaints(currentStudent.Student_ID);

    // Compute personal metrics
    const total = list.length;
    const pending = list.filter(c => c.Status === 'Pending').length;
    const progress = list.filter(c => c.Status === 'In Progress').length;
    const resolved = list.filter(c => c.Status === 'Resolved').length;

    if (document.getElementById('stud-stat-total')) document.getElementById('stud-stat-total').innerText = total;
    if (document.getElementById('stud-stat-pending')) document.getElementById('stud-stat-pending').innerText = pending;
    if (document.getElementById('stud-stat-progress')) document.getElementById('stud-stat-progress').innerText = progress;
    if (document.getElementById('stud-stat-resolved')) document.getElementById('stud-stat-resolved').innerText = resolved;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 36px 16px; color: var(--text-muted);">
            <div style="font-size: 2rem; margin-bottom: 8px;">📭</div>
            <p style="font-weight: 600;">You have not lodged any complaints yet.</p>
            <a href="student-submit.html" class="btn btn-student btn-sm" style="margin-top: 10px;">Submit Your First Complaint</a>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>
          <a href="student-track.html?id=${encodeURIComponent(c.Complaint_ID)}" class="complaint-id-tag">
            ${escapeHtml(c.Complaint_ID)}
          </a>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-main);">${escapeHtml(c.Subject)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 300px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(c.Description)}
          </div>
        </td>
        <td>
          <span class="badge badge-category">${escapeHtml(c.Category)}</span>
        </td>
        <td>
          ${getStatusBadge(c.Status)}
        </td>
        <td style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">
          ${formatDate(c.Created_At)}
        </td>
        <td>
          <a href="student-track.html?id=${encodeURIComponent(c.Complaint_ID)}" class="btn btn-secondary btn-sm">
            🔍 Track Progress
          </a>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" style="color: var(--danger); text-align: center; padding: 20px;">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

// Student Submit Form Handling (Modules 2 & 3)
function initSubmitForm() {
  const form = document.getElementById('student-complaint-form');
  if (!form) return;

  // Pre-fill student fields
  if (currentStudent) {
    const fName = document.getElementById('student_name');
    const fRoll = document.getElementById('student_roll');
    const fCourse = document.getElementById('student_course');
    const fEmail = document.getElementById('student_email');

    if (fName) fName.value = currentStudent.Name;
    if (fRoll) fRoll.value = currentStudent.Roll_No;
    if (fCourse) fCourse.value = currentStudent.Course;
    if (fEmail) fEmail.value = currentStudent.Email;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      student_id: currentStudent.Student_ID,
      name: currentStudent.Name,
      roll_no: currentStudent.Roll_No,
      course: currentStudent.Course,
      email: currentStudent.Email,
      subject: document.getElementById('complaint_subject').value.trim(),
      category: document.getElementById('complaint_category').value.trim(),
      description: document.getElementById('complaint_description').value.trim()
    };

    if (!data.subject || !data.category || !data.description) {
      showToast('Please fill out all complaint particulars.', 'error');
      return;
    }

    const btn = document.getElementById('submit-complaint-btn');
    btn.disabled = true;
    btn.innerText = 'Submitting Complaint...';

    try {
      const res = await AppStorage.createComplaint(data);
      showToast('Complaint submitted successfully!', 'success');
      form.reset();

      // Show receipt modal
      showStudentReceiptModal(res.data);
    } catch (err) {
      showToast(err.message || 'Submission error.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = '🚀 Lodge Complaint & Generate ID';
    }
  });
}

function showStudentReceiptModal(data) {
  const modal = document.getElementById('student-success-modal');
  if (!modal) return;

  document.getElementById('receipt-id').innerText = data.complaint_id;
  document.getElementById('receipt-subject').innerText = data.subject;
  document.getElementById('receipt-category').innerText = data.category;
  document.getElementById('receipt-status').innerHTML = getStatusBadge(data.status);
  document.getElementById('receipt-date').innerText = formatDate(data.created_at);

  const trackBtn = document.getElementById('receipt-track-btn');
  if (trackBtn) {
    trackBtn.href = `student-track.html?id=${encodeURIComponent(data.complaint_id)}`;
  }

  modal.classList.add('open');
}

function closeStudentReceiptModal() {
  const modal = document.getElementById('student-success-modal');
  if (modal) modal.classList.remove('open');
}

function copyReceiptId() {
  const idText = document.getElementById('receipt-id').innerText;
  navigator.clipboard.writeText(idText).then(() => {
    showToast(`Copied ${idText} to clipboard!`, 'success');
  });
}
