/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Management / Admin Portal Logic (js/admin.js)
 */

let currentAdmin = null;

document.addEventListener('DOMContentLoaded', async () => {
  currentAdmin = Auth.requireAdmin();
  if (!currentAdmin) return;

  // Greet admin
  const nameEl = document.getElementById('admin-greeting-name');
  if (nameEl) nameEl.innerText = currentAdmin.Full_Name;

  const roleEl = document.getElementById('admin-greeting-role');
  if (roleEl) roleEl.innerText = `${currentAdmin.Role} (${currentAdmin.Username})`;

  // If on admin dashboard or records page
  if (document.getElementById('admin-stats-total')) {
    await loadAdminStats();
  }

  if (document.getElementById('admin-records-tbody')) {
    await loadAdminRecords();
    initAdminFilters();
    initQuickUpdateModal();
  }

  // If on dedicated update page
  if (document.getElementById('admin-dedicated-update-form')) {
    await initDedicatedUpdatePage();
  }
});

// Load summary metrics for dashboard
async function loadAdminStats() {
  try {
    const stats = await AppStorage.getStatistics();
    if (document.getElementById('admin-stats-total')) document.getElementById('admin-stats-total').innerText = stats.total;
    if (document.getElementById('admin-stats-pending')) document.getElementById('admin-stats-pending').innerText = stats.pending;
    if (document.getElementById('admin-stats-progress')) document.getElementById('admin-stats-progress').innerText = stats.in_progress;
    if (document.getElementById('admin-stats-resolved')) document.getElementById('admin-stats-resolved').innerText = stats.resolved;
    if (document.getElementById('admin-stats-students')) document.getElementById('admin-stats-students').innerText = stats.students;
  } catch (e) {
    console.warn("Stats load error", e);
  }
}

// Load all complaints table
async function loadAdminRecords() {
  const tbody = document.getElementById('admin-records-tbody');
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; padding: 24px; color: var(--text-muted);">Loading complaint database...</td></tr>`;

  try {
    const status = document.getElementById('admin-filter-status') ? document.getElementById('admin-filter-status').value : 'All';
    const category = document.getElementById('admin-filter-category') ? document.getElementById('admin-filter-category').value : 'All';
    const search = document.getElementById('admin-search-input') ? document.getElementById('admin-search-input').value.trim() : '';

    const list = await AppStorage.getAllComplaints({ status, category, search });

    const countBadge = document.getElementById('admin-records-count');
    if (countBadge) countBadge.innerText = `${list.length} Complaints Found`;

    if (list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No complaints match the filter criteria.</td></tr>`;
      return;
    }

    tbody.innerHTML = list.map(c => `
      <tr>
        <td>
          <a href="admin-search.html?id=${encodeURIComponent(c.Complaint_ID)}" class="complaint-id-tag" style="background:var(--admin-light); color:var(--admin-primary);">
            ${escapeHtml(c.Complaint_ID)}
          </a>
        </td>
        <td>
          <div style="font-weight: 600;">${escapeHtml(c.Student_Name)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted);">Roll: <strong>${escapeHtml(c.Roll_No)}</strong> | ${escapeHtml(c.Course)}</div>
          <div style="font-size: 0.76rem; color: var(--text-light);">${escapeHtml(c.Email)}</div>
        </td>
        <td>
          <div style="font-weight: 600; line-height: 1.3;">${escapeHtml(c.Subject)}</div>
          <div style="font-size: 0.8rem; color: var(--text-muted); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHtml(c.Description)}">
            ${escapeHtml(c.Description)}
          </div>
        </td>
        <td><span class="badge badge-category">${escapeHtml(c.Category)}</span></td>
        <td>${getStatusBadge(c.Status)}</td>
        <td style="font-size: 0.82rem; color: var(--text-muted); white-space: nowrap;">${formatDate(c.Created_At)}</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-admin btn-sm" onclick="openAdminUpdateModal('${escapeHtml(c.Complaint_ID)}', '${escapeHtml(c.Status)}', '${escapeHtml(c.Remarks || '')}')">
              ✏️ Status
            </button>
            <a href="admin-search.html?id=${encodeURIComponent(c.Complaint_ID)}" class="btn btn-secondary btn-sm">
              🔍 Details
            </a>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--danger); padding: 20px;">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

function initAdminFilters() {
  const s = document.getElementById('admin-filter-status');
  const c = document.getElementById('admin-filter-category');
  const inp = document.getElementById('admin-search-input');

  if (s) s.addEventListener('change', () => loadAdminRecords());
  if (c) c.addEventListener('change', () => loadAdminRecords());
  if (inp) {
    let t;
    inp.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => loadAdminRecords(), 250);
    });
  }
}

// Quick Status Update Modal (Module 5)
function initQuickUpdateModal() {
  const form = document.getElementById('admin-quick-update-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('modal-update-id').value;
    const status = document.getElementById('modal-update-status').value;
    const remarks = document.getElementById('modal-update-remarks').value;

    const btn = document.getElementById('modal-update-save-btn');
    btn.disabled = true;
    btn.innerText = 'Saving...';

    try {
      await AppStorage.updateStatus(id, status, remarks);
      showToast(`Status updated to "${status}" for ${id}`, 'success');
      closeAdminUpdateModal();
      loadAdminRecords();
      loadAdminStats();
    } catch (err) {
      showToast(err.message || 'Update failed', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = 'Save Status Update';
    }
  });
}

function openAdminUpdateModal(id, status, remarks) {
  const modal = document.getElementById('admin-update-modal');
  if (!modal) return;

  document.getElementById('modal-update-id').value = id;
  document.getElementById('modal-update-id-label').innerText = id;
  document.getElementById('modal-update-status').value = status;
  document.getElementById('modal-update-remarks').value = remarks || '';

  modal.classList.add('open');
}

function closeAdminUpdateModal() {
  const modal = document.getElementById('admin-update-modal');
  if (modal) modal.classList.remove('open');
}

// Dedicated Update Page (Module 5)
async function initDedicatedUpdatePage() {
  const picker = document.getElementById('admin-complaint-picker');
  const form = document.getElementById('admin-dedicated-update-form');

  // Populate picker
  try {
    const list = await AppStorage.getAllComplaints();
    picker.innerHTML = `<option value="">-- Choose a Complaint from the ledger --</option>` +
      list.map(c => `
        <option value="${escapeHtml(c.Complaint_ID)}">
          ${escapeHtml(c.Complaint_ID)}: ${escapeHtml(c.Student_Name)} (${escapeHtml(c.Status)}) - ${escapeHtml(c.Subject.substring(0, 30))}...
        </option>
      `).join('');
  } catch (e) {
    console.warn(e);
  }

  // Pre-select if param exists
  const paramId = new URLSearchParams(window.location.search).get('id');
  if (paramId) {
    picker.value = paramId;
    loadComplaintToUpdate(paramId);
  }

  picker.addEventListener('change', (e) => {
    if (e.target.value) {
      loadComplaintToUpdate(e.target.value);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('update-complaint-id-input').value.trim();
    const status = document.getElementById('update-status-choice').value;
    const remarks = document.getElementById('update-remarks-input').value.trim();

    if (!id) {
      showToast('Select or enter a Complaint ID.', 'error');
      return;
    }

    const btn = document.getElementById('save-dedicated-update-btn');
    btn.disabled = true;
    btn.innerText = 'Updating Status...';

    try {
      await AppStorage.updateStatus(id, status, remarks);
      showToast(`Complaint ${id} status updated to ${status}!`, 'success');
      loadComplaintToUpdate(id);
    } catch (err) {
      showToast(err.message || 'Update failed.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerText = '💾 Apply Status Update';
    }
  });
}

async function loadComplaintToUpdate(id) {
  try {
    const c = await AppStorage.searchComplaint(id);
    document.getElementById('update-complaint-id-input').value = c.Complaint_ID;
    document.getElementById('update-status-choice').value = c.Status;
    document.getElementById('update-remarks-input').value = c.Remarks || '';

    const preview = document.getElementById('admin-update-preview');
    if (preview) {
      preview.style.display = 'block';
      document.getElementById('p-id').innerText = c.Complaint_ID;
      document.getElementById('p-status').innerHTML = getStatusBadge(c.Status);
      document.getElementById('p-student').innerText = `${c.Student_Name} (${c.Roll_No})`;
      document.getElementById('p-course').innerText = c.Course;
      document.getElementById('p-category').innerText = c.Category;
      document.getElementById('p-subject').innerText = c.Subject;
      document.getElementById('p-desc').innerText = c.Description;
    }
  } catch (e) {
    showToast(e.message || 'Complaint not found.', 'error');
  }
}
