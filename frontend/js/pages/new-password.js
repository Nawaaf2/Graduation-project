async function handleReset() {
    const password = document.getElementById('new-password').value;
    const confirm  = document.getElementById('confirm-password').value;
    
    // --- التعديل المهم هنا: نجيب التوكن من الرابط (URL) ---
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    // --------------------------------------------------

    if (!password || password.length < 6) { 
        showError('np-error', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'); 
        return; 
    }
    if (password !== confirm) { 
        showError('np-error', 'كلمتا المرور غير متطابقتين'); 
        return; 
    }
    if (!token) { 
        showError('np-error', 'رابط غير صحيح، اطلب رابطاً جديداً من الإيميل'); 
        return; 
    }

    try {
const res = await fetch('https://graduation-project-lh89.onrender.com/api/auth/forgot-password', {
                method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }) // نرسل التوكن والباسورد الجديد
        });
        
        const data = await res.json();

        if (!res.ok) { 
            showError('np-error', data.error || 'حدث خطأ'); 
            return; 
        }

        showSuccess('np-success', 'تم تغيير كلمة المرور! سيتم تحويلك...');
        setTimeout(() => window.location.href = 'login.html', 2000);

    } catch (e) {
        showError('np-error', 'تعذر الاتصال بالسيرفر');
    }
}