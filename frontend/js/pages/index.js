// ===== index.js =====
const user = localStorage.getItem('currentUser');
window.location.replace(user ? 'dashboard.html' : 'login.html');
