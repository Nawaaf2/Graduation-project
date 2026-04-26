// ===== dashboard.js =====
const user = checkAuth();
if (!user) throw new Error('not logged in');

document.getElementById('welcome-title').textContent = `مرحباً، ${user.name} 👋`;

const CAT_ICONS_DEFAULT = {'طعام':'🍽️','مواصلات':'🚗','تسوق':'🛍️','فواتير':'📄','ترفيه':'🎬','صحة':'💊','تعليم':'📚','أخرى':'📌'};

(async () => {
  renderSidebar('dashboard');
  try {
    const [data, categories] = await Promise.all([Storage.getDashboard(), Storage.getCategories()]);
    const CAT_ICONS = {...CAT_ICONS_DEFAULT, ...Object.fromEntries((categories||[]).map(c => [c.name, c.icon||'📌']))};
    if (!data) return;

    document.getElementById('s-income').innerHTML   = `${fmt(data.totalIncome)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('s-expenses').innerHTML = `${fmt(data.totalExpenses)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('s-balance').innerHTML  = `${fmt(data.balance)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('s-balance').style.color = parseFloat(data.balance)>=0?'var(--green)':'var(--red)';
    document.getElementById('s-monthly').innerHTML  = `${fmt(data.monthly)} <span class="stat-currency">ر.س</span>`;

    if (data.dueSoon > 0) {
      document.getElementById('alerts-section').innerHTML = `
        <div class="alert-card">
          <span style="font-size:22px">🔔</span>
          <div>لديك <strong>${data.dueSoon}</strong> اشتراك يجدد خلال 7 أيام —
            <a href="subscriptions.html" class="link">عرض الاشتراكات</a>
          </div>
        </div>`;
    }

    const goalsEl = document.getElementById('goals-preview');
    if (data.goals?.length) {
      goalsEl.innerHTML = data.goals.map(g => {
        const pct = Math.min((parseFloat(g.current)/parseFloat(g.target))*100, 100);
        return `<div class="card" style="margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
            <span>${g.icon||'🎯'} ${g.name}</span>
            <span style="font-size:13px;color:${g.color||'var(--accent)'};font-weight:600">${pct.toFixed(0)}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${g.color||'var(--accent)'}"></div></div>
          <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-3)">
            <span>${fmt(g.current)} ر.س</span><span>${fmt(g.target)} ر.س</span>
          </div>
        </div>`;
      }).join('');
    } else {
      goalsEl.innerHTML = `<p style="color:var(--text-3);font-size:14px">لا توجد أهداف بعد — <a href="goals.html" class="link">أضف هدفاً</a></p>`;
    }

    const listEl = document.getElementById('recent-list');
    if (data.recent?.length) {
      listEl.innerHTML = data.recent.map(op => `
        <div class="card" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:38px;height:38px;background:rgba(${op.type==='expense'?'239,68,68':'16,185,129'},0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">
              ${op.type==='expense'?(CAT_ICONS[op.category]||'💸'):(op.icon||'💰')}
            </div>
            <div>
              <div style="font-size:14px;font-weight:500">${op.type==='expense'?(op.description||op.category||'مصروف'):(op.source||'دخل')}</div>
              <div style="font-size:12px;color:var(--text-3)">${op.date?op.date.slice(0,10):''}</div>
            </div>
          </div>
          <div style="font-size:15px;font-weight:700;color:${op.type==='expense'?'var(--red)':'var(--green)'}">
            ${op.type==='expense'?'-':'+'} ${fmt(op.amount)} ر.س
          </div>
        </div>`).join('');
    } else {
      listEl.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>لا توجد عمليات بعد</p></div>`;
    }

  } catch(e) {
    console.error(e);
    document.getElementById('recent-list').innerHTML = `
      <div class="alert-card"><span>⚠️</span>
        <div>تعذر الاتصال بالسيرفر — تأكد إن الـ Backend شغّال على المنفذ 8080</div>
      </div>`;
  }
})();
