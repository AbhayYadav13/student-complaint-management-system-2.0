/**
 * GROUP 7: STUDENT COMPLAINT MANAGEMENT SYSTEM (v2)
 * Authentication & Session Guard (js/auth.js)
 */

const Auth = (() => {
  const SESSION_KEY = 'group7_v2_active_session';

  function getSession() {
    try {
      return JSON.parse(sessionStorage.getItem(SESSION_KEY) || localStorage.getItem(SESSION_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  return {
    getSession,

    setSession(user, role) {
      const data = { user, role, loggedInAt: new Date().toISOString() };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
      localStorage.setItem(SESSION_KEY, JSON.stringify(data));
    },

    clearSession() {
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(SESSION_KEY);
      window.location.href = 'login.html';
    },

    isStudent() {
      const s = getSession();
      return s && s.role === 'student';
    },

    isAdmin() {
      const s = getSession();
      return s && s.role === 'admin';
    },

    requireStudent() {
      const s = getSession();
      if (!s || s.role !== 'student') {
        window.location.href = 'login.html?role=student&redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
      }
      return s ? s.user : null;
    },

    requireAdmin() {
      const s = getSession();
      if (!s || s.role !== 'admin') {
        window.location.href = 'login.html?role=admin&redirect=' + encodeURIComponent(window.location.pathname.split('/').pop());
      }
      return s ? s.user : null;
    },

    renderHeaderUser() {
      const container = document.getElementById('user-session-widget');
      if (!container) return;

      const s = getSession();
      if (s && s.user) {
        const isStud = s.role === 'student';
        const name = isStud ? s.user.Name : s.user.Full_Name;
        const sub = isStud ? s.user.Roll_No : s.user.Role;
        const badgeClass = isStud ? 'user-role-student' : 'user-role-admin';
        const roleLabel = isStud ? 'Student' : 'Staff / Management';

        container.innerHTML = `
          <div class="user-session-pill">
            <span class="user-role-badge ${badgeClass}">${roleLabel}</span>
            <span style="font-weight: 600;">${escapeHtml(name)}</span>
            <span style="font-size: 0.78rem; color: var(--text-muted);">(${escapeHtml(sub)})</span>
            <button onclick="Auth.clearSession()" class="btn btn-secondary btn-sm" style="padding: 2px 8px; margin-left: 6px;" title="Logout">
              🚪 Logout
            </button>
          </div>
        `;
      } else {
        container.innerHTML = `
          <div style="display: flex; gap: 8px;">
            <a href="login.html?role=student" class="btn btn-student btn-sm">Student Login</a>
            <a href="login.html?role=admin" class="btn btn-admin btn-sm">Management Login</a>
          </div>
        `;
      }
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Auth.renderHeaderUser();
});
