let currentLang = 'ar';

// Show a specific page/section and hide all others
function showPage(page) {
  document.getElementById('page-login').classList.add('hidden');
  document.getElementById('page-register').classList.add('hidden');
  document.getElementById('app-layout').classList.add('hidden');

  const sections = ['dashboard', 'add-expense', 'add-income', 'categories', 'goals', 'subscriptions', 'reports', 'settings'];
  sections.forEach(s => {
    const el = document.getElementById('sec-' + s);
    if (el) el.classList.add('hidden');
  });

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  if (page === 'login') {
    document.getElementById('page-login').classList.remove('hidden');
  } else if (page === 'register') {
    document.getElementById('page-register').classList.remove('hidden');
  } else {
    document.getElementById('app-layout').classList.remove('hidden');
    const secId = page || 'dashboard';
    const secEl = document.getElementById('sec-' + secId);
    if (secEl) secEl.classList.remove('hidden');

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

// ===== MODAL FUNCTIONS =====
function openModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

// ===== ADD GOAL =====
function addGoal() {
  const name = document.getElementById('goal-name-input').value;
  const target = parseFloat(document.getElementById('goal-target-input').value);
  const current = parseFloat(document.getElementById('goal-current-input').value) || 0;
  const date = document.getElementById('goal-date-input').value;

  if (!name || !target) {
    alert(currentLang === 'ar' ? 'الرجاء تعبئة اسم الهدف والمبلغ المستهدف' : 'Please fill in the goal name and target amount');
    return;
  }

  const pct = Math.min(100, Math.round((current / target) * 100));
  const remain = target - current;
  const isAr = currentLang === 'ar';

  const goalHTML = `
    <div class="goal-card" style="animation:fadeUp 0.4s ease">
      <div class="goal-header">
        <div class="goal-info">
          <div class="goal-icon-wrap" style="background:rgba(99,102,241,0.1)">🎯</div>
          <div>
            <div class="goal-name">${name}</div>
            <div class="goal-dates">${date ? (isAr ? 'الهدف: ' : 'Goal: ') + date : ''}</div>
          </div>
        </div>
        <div class="goal-amount">
          <div class="goal-current" style="color:var(--accent)">${current.toLocaleString()}</div>
          <div class="goal-target">${isAr ? 'من' : 'of'} ${target.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}</div>
        </div>
      </div>
      <div class="goal-progress-bar">
        <div class="goal-progress-fill" style="width:${pct}%;background:linear-gradient(90deg,var(--accent),var(--accent-dark))"></div>
      </div>
      <div class="goal-footer">
        <span class="goal-pct" style="color:var(--accent)">${pct}%</span>
        <span class="goal-remain">${isAr ? 'متبقي' : 'remaining'} ${remain.toLocaleString()} ${isAr ? 'ر.س' : 'SAR'}</span>
      </div>
    </div>`;

  // Insert before the add button
  const addBtn = document.querySelector('.btn-add-goal');
  if (addBtn) addBtn.insertAdjacentHTML('beforebegin', goalHTML);

  // Clear inputs
  document.getElementById('goal-name-input').value = '';
  document.getElementById('goal-target-input').value = '';
  document.getElementById('goal-current-input').value = '';
  document.getElementById('goal-date-input').value = '';
}

// ===== ADD SUBSCRIPTION =====
function addSubscription() {
  const name = document.getElementById('sub-name-input').value;
  const amount = parseFloat(document.getElementById('sub-amount-input').value);
  const cycle = document.getElementById('sub-cycle-input').value;
  const date = document.getElementById('sub-date-input').value;

  if (!name || !amount) {
    alert(currentLang === 'ar' ? 'الرجاء تعبئة اسم الاشتراك والمبلغ' : 'Please fill in the subscription name and amount');
    return;
  }

  const isAr = currentLang === 'ar';
  const cycleText = cycle === 'monthly' ? (isAr ? 'شهري' : 'Monthly') :
                    cycle === 'yearly' ? (isAr ? 'سنوي' : 'Yearly') :
                    (isAr ? 'أسبوعي' : 'Weekly');

  const subHTML = `
    <div class="sub-item" style="animation:fadeUp 0.4s ease">
      <div class="sub-icon-wrap" style="background:rgba(99,102,241,0.1)">📋</div>
      <div class="sub-info">
        <div class="sub-name">${name}</div>
        <div class="sub-cycle">${cycleText}</div>
      </div>
      <div class="sub-right">
        <div class="sub-price">-${amount} ${isAr ? 'ر.س' : 'SAR'}</div>
        <div class="sub-renewal"><span class="sub-badge active">${date || (isAr ? 'نشط' : 'Active')}</span></div>
      </div>
    </div>`;

  const addBtn = document.querySelector('.btn-add-sub');
  if (addBtn) addBtn.insertAdjacentHTML('beforebegin', subHTML);

  // Clear inputs
  document.getElementById('sub-name-input').value = '';
  document.getElementById('sub-amount-input').value = '';
  document.getElementById('sub-date-input').value = '';
}

// ===== UPDATE SPENDING LIMIT =====
function updateLimit() {
  const newLimit = parseFloat(document.getElementById('limit-amount-input').value);
  if (!newLimit || newLimit <= 0) return;

  const spent = 1295; // Current expenses
  const pct = Math.round((spent / newLimit) * 100);
  const remain = newLimit - spent;

  // Update circle
  const circumference = 263.9;
  const offset = circumference - (circumference * Math.min(pct, 100) / 100);
  const circle = document.getElementById('limit-circle-progress');
  const pctText = document.getElementById('limit-pct-text');

  if (circle) {
    circle.setAttribute('stroke-dashoffset', offset);
    // Change color based on percentage
    if (pct >= 100) {
      circle.setAttribute('stroke', '#EF4444');
    } else if (pct >= 80) {
      circle.setAttribute('stroke', '#EAB308');
    } else {
      circle.setAttribute('stroke', '#10B981');
    }
  }

  if (pctText) pctText.textContent = pct + '%';

  // Update alert
  const alertBox = document.getElementById('limit-alert-box');
  if (alertBox) {
    if (pct >= 100) {
      alertBox.className = 'limit-alert danger';
      alertBox.innerHTML = `<span class="limit-alert-icon">🚨</span>
        <span>${currentLang === 'ar' ? 'تجاوزت حد الإنفاق! المصروف أكثر من الحد المسموح' : 'Spending limit exceeded! You have spent more than allowed'}</span>`;
    } else if (pct >= 80) {
      alertBox.className = 'limit-alert warning';
      alertBox.innerHTML = `<span class="limit-alert-icon">⚠️</span>
        <span>${currentLang === 'ar' ? 'تجاوزت 80% من حد الإنفاق! حاول تقلل المصاريف باقي الشهر' : 'You\'ve exceeded 80% of your limit! Try to reduce spending'}</span>`;
    } else {
      alertBox.className = 'limit-alert';
      alertBox.style.display = 'none';
    }
  }
}
