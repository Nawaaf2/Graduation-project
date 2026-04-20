// ===== index.js =====
const user = sessionStorage.getItem('currentUser');
window.location.replace(user ? 'dashboard.html' : 'login.html');
