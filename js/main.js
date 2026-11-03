/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Common UI & Helpers (js/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  checkSystemStatus();
});

function initMobileNav() {
  const btn = document.querySelector('.mobile-menu-btn');
  const links = document.querySelector('.nav-links');
  if (btn && links) {
    btn.addEventListener('click', () => links.classList.toggle('open'));
  }
}

async function checkSystemStatus() {
  const ind = document.getElementById('system-status-indicator');
  if (!ind) return;

  const isPhp = await AppStorage.isPhpMode();
  if (isPhp) {
    ind.innerHTML = `🟢 <strong>Backend:</strong> PHP & MySQL Database Connected`;
  } else {
    ind.innerHTML = `💻 <strong>Mode:</strong> HTML5 Client / LocalStorage Active`;
  }
}

function showToast(message, type = 'info', duration = 3500) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';
  toast.innerHTML = `<span style="font-weight: bold; font-size: 1.1rem;">${icon}</span><div>${escapeHtml(message)}</div>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr.replace(' ', 'T'));
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch (e) {
    return dateStr;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getStatusBadge(status) {
  const s = (status || 'Pending').trim();
  let badgeClass = 'badge-pending';
  let icon = '⏳';

  if (s.toLowerCase() === 'in progress') {
    badgeClass = 'badge-progress';
    icon = '🔄';
  } else if (s.toLowerCase() === 'resolved') {
    badgeClass = 'badge-resolved';
    icon = '✓';
  }

  return `<span class="badge ${badgeClass}">${icon} ${escapeHtml(s)}</span>`;
}
