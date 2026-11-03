/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Universal Search & Progress Tracker (js/search.js)
 * Supports both Student Tracking & Admin Lookup
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('search-complaint-form');
  const input = document.getElementById('search_complaint_id_input');

  // Check URL param ?id=CMP-XXXX
  const paramId = new URLSearchParams(window.location.search).get('id');
  if (paramId && input) {
    input.value = paramId;
    executeComplaintSearch(paramId);
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const id = input.value.trim();
      if (!id) {
        showToast('Please enter a Complaint ID.', 'error');
        return;
      }
      executeComplaintSearch(id);
    });
  }
});

async function executeComplaintSearch(id) {
  const resultCard = document.getElementById('search-result-display');
  const notFoundCard = document.getElementById('search-not-found-box');
  const btn = document.getElementById('search-submit-btn');

  if (btn) {
    btn.disabled = true;
    btn.innerText = 'Searching...';
  }

  try {
    const c = await AppStorage.searchComplaint(id);

    if (notFoundCard) notFoundCard.style.display = 'none';
    if (resultCard) {
      renderSearchData(c);
      resultCard.style.display = 'block';
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  } catch (err) {
    if (resultCard) resultCard.style.display = 'none';
    if (notFoundCard) {
      document.getElementById('not-found-id-label').innerText = id;
      notFoundCard.style.display = 'block';
    }
    showToast(err.message || 'Complaint not found.', 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = '🔍 Search Complaint';
    }
  }
}

function renderSearchData(c) {
  // Populate IDs & Badges
  document.getElementById('sr-id').innerText = c.Complaint_ID;
  document.getElementById('sr-status-badge').innerHTML = getStatusBadge(c.Status);

  // Student Info
  document.getElementById('sr-student-name').innerText = c.Student_Name;
  document.getElementById('sr-roll-no').innerText = c.Roll_No;
  document.getElementById('sr-course').innerText = c.Course;
  document.getElementById('sr-email').innerText = c.Email;

  // Complaint Info
  document.getElementById('sr-subject').innerText = c.Subject;
  document.getElementById('sr-category').innerText = c.Category;
  document.getElementById('sr-created').innerText = formatDate(c.Created_At);
  document.getElementById('sr-updated').innerText = formatDate(c.Updated_At);
  document.getElementById('sr-description').innerText = c.Description;

  // Remarks
  const remBox = document.getElementById('sr-remarks-container');
  const remText = document.getElementById('sr-remarks-text');
  if (c.Remarks && c.Remarks.trim()) {
    remText.innerText = c.Remarks;
    remBox.style.display = 'block';
  } else {
    remBox.style.display = 'none';
  }

  // Update Stepper Progress Bar
  updateStepper(c.Status);

  // If Admin portal, link to update status
  const updateLink = document.getElementById('sr-admin-update-link');
  if (updateLink) {
    updateLink.href = `admin-update.html?id=${encodeURIComponent(c.Complaint_ID)}`;
  }
}

function updateStepper(status) {
  const pStep = document.getElementById('step-1');
  const progStep = document.getElementById('step-2');
  const resStep = document.getElementById('step-3');
  const line = document.getElementById('tracker-line');

  [pStep, progStep, resStep].forEach(s => {
    if (s) s.classList.remove('active', 'completed', 'resolved');
  });

  const s = (status || '').toLowerCase();
  if (s === 'pending') {
    if (pStep) pStep.classList.add('active');
    if (line) line.style.width = '0%';
  } else if (s === 'in progress') {
    if (pStep) pStep.classList.add('completed');
    if (progStep) progStep.classList.add('active');
    if (line) line.style.width = '50%';
  } else if (s === 'resolved') {
    if (pStep) pStep.classList.add('completed');
    if (progStep) progStep.classList.add('completed');
    if (resStep) resStep.classList.add('completed', 'resolved');
    if (line) line.style.width = '100%';
  }
}

function printReceipt() {
  window.print();
}
