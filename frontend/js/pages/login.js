// ===== login.js =====
if (getCurrentUser() && Storage.getToken()) {
  window.location.href = 'dashboard.html';
}

async function doLogin() {
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const btn      = document.getElementById('login-btn');
  if (!email || !password) { showErr('يرجى تعبئة جميع الحقول'); return; }
  btn.textContent = '...جاري التحقق';
  btn.disabled    = true;
  const result = await Storage.login(email, password);
  if (result.success) {
    window.location.href = 'dashboard.html';
  } else {
    showErr(result.message);
    btn.textContent = 'تسجيل الدخول';
    btn.disabled    = false;
  }
}

function showErr(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}

document.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
