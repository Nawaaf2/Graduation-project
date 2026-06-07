// ===== register.js =====
async function doRegister() {
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  const btn      = document.getElementById('reg-btn');
  if (!name || !email || !password) { showErr('يرجى تعبئة جميع الحقول'); return; }
  if (password.length < 6)           { showErr('كلمة المرور 6 أحرف على الأقل'); return; }
  if (password !== confirm)           { showErr('كلمتا المرور غير متطابقتين'); return; }
  btn.textContent = '...جاري الإنشاء';
  btn.disabled    = true;
  const result = await Storage.register(name, email, password);
  if (result.success) {
    const s = document.getElementById('success-msg');
    s.textContent = 'تم إنشاء الحساب! جاري التحويل...';
    s.style.display = 'block';
    setTimeout(() => window.location.href = 'dashboard.html', 1200);
  } else {
    showErr(result.message);
    btn.textContent = 'إنشاء الحساب';
    btn.disabled    = false;
  }
}

function showErr(msg) {
  const el = document.getElementById('error-msg');
  el.textContent = msg;
  el.style.display = 'block';
}
