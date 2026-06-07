// ===== account.js =====
const user = checkAuth();
renderSidebar('account');

if (user) {
  document.getElementById('a-name').textContent  = user.name;
  document.getElementById('a-email').textContent = user.email;
}

async function doResetPassword() {
  if (!user) return;
  try {
    const res = await fetch(`${Storage.BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user.email })
    });
    if (res.ok) {
      showSuccess('success-msg', 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني');
    } else {
      showError('error-msg', 'حدث خطأ، حاول مجدداً');
    }
  } catch (e) {
    showError('error-msg', 'تعذّر الاتصال بالخادم');
  }
}
