async function handleSendEmail() {
    const email = document.getElementById('email-input').value.trim();
    if (!email) { showError('email-error', 'الرجاء إدخال البريد الإلكتروني'); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { showError('email-error', 'البريد الإلكتروني غير صحيح'); return; }

    try {
        const res = await fetch('http://localhost:8080/api/auth/forgot-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await res.json();

        if (data.token) localStorage.setItem('reset_token', data.token);

        document.getElementById('sent-email-display').textContent = email;
        document.getElementById('step-email').style.display = 'none';
        document.getElementById('step-sent').style.display  = 'block';

    } catch (e) {
        showError('email-error', 'تعذر الاتصال بالسيرفر');
    }
}

function resendEmail() {
    document.getElementById('step-sent').style.display  = 'none';
    document.getElementById('step-email').style.display = 'block';
    showSuccess('email-success', 'يمكنك إعادة إدخال بريدك وإرسال طلب جديد');
}

document.addEventListener('DOMContentLoaded', () => {
    applyThemeAndLang();
    document.getElementById('email-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') handleSendEmail();
    });
});