let currentLang = 'ar';

// Show a specific page/section and hide all others
function showPage(page) {
  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-register').classList.add('hidden');
  document.getElementById('app-layout').classList.add('hidden');

  const sections = ['dashboard', 'add-expense', 'add-income', 'categories', 'reports', 'settings'];
  sections.forEach(s => document.getElementById('sec-' + s).classList.add('hidden'));

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  if (page === 'login') {
    document.getElementById('page-login').classList.remove('hidden');
  } else if (page === 'register') {
    document.getElementById('page-register').classList.remove('hidden');
  } else {
    document.getElementById('app-layout').classList.remove('hidden');
    const secId = page || 'dashboard';
    document.getElementById('sec-' + secId).classList.remove('hidden');

    const navBtn = document.querySelector(`.nav-item[data-page="${page}"]`);
    if (navBtn) navBtn.classList.add('active');
    else document.querySelector('.nav-item[data-page="dashboard"]').classList.add('active');
  }
}

// Toggle between Arabic and English
function toggleLang() {
  currentLang = currentLang === 'ar' ? 'en' : 'ar';
  document.body.classList.toggle('en', currentLang === 'en');
  document.documentElement.dir  = currentLang === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = currentLang;

  // Update all text nodes
  document.querySelectorAll('[data-ar]').forEach(el => {
    el.textContent = el.getAttribute('data-' + currentLang);
  });

  // Update input placeholders
  document.querySelectorAll('[data-ph-ar]').forEach(el => {
    el.placeholder = el.getAttribute('data-ph-' + currentLang);
  });

  // Update language toggle buttons
  document.querySelectorAll('.btn-lang').forEach(btn => {
    if (!btn.hasAttribute('data-ar')) {
      btn.textContent = currentLang === 'ar' ? 'EN' : 'عربي';
    }
  });
}
