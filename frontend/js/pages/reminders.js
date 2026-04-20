// ===== reminders.js — التذكيرات =====
checkAuth();
renderSidebar('reminders');

const user = getCurrentUser();
const STORE_KEY = `mufakkira_${user?.id}_reminders`;

function getReminders() { return JSON.parse(localStorage.getItem(STORE_KEY)||'[]'); }
function saveReminders(r) { localStorage.setItem(STORE_KEY, JSON.stringify(r)); }

function daysUntil(dateStr) {
  if (!dateStr) return null;
  return Math.ceil((new Date(dateStr) - new Date()) / 86400000);
}

function statusClass(days) {
  if (days === null) return '';
  if (days < 0)   return 'reminder-overdue';
  if (days <= 3)  return 'reminder-soon';
  return 'reminder-ok';
}

function statusColor(days) {
  if (days === null) return 'var(--text-3)';
  if (days < 0)   return 'var(--red)';
  if (days <= 3)  return 'var(--yellow)';
  return 'var(--green)';
}

function statusLabel(days) {
  if (days === null) return '';
  if (days < 0)   return `متأخر ${Math.abs(days)} يوم`;
  if (days === 0) return 'اليوم!';
  if (days === 1) return 'غداً';
  if (days <= 7)  return `بعد ${days} أيام`;
  return `${days} يوم`;
}

function renderReminders() {
  let reminders = getReminders();

  // إضافة الاشتراكات تلقائياً كمرجع (للعرض فقط)
  Storage.getSubscriptions().then(subs => {
    const el = document.getElementById('sub-reminders');
    const today = new Date();
    const subItems = (subs||[]).filter(s => {
      const d = daysUntil(s.renewal);
      return d !== null && d <= 14;
    }).sort((a,b) => daysUntil(a.renewal) - daysUntil(b.renewal));

    el.innerHTML = subItems.length ? subItems.map(s => {
      const days = daysUntil(s.renewal);
      return `<div class="reminder-item ${statusClass(days)}">
        <div style="display:flex;align-items:center;gap:12px;flex:1">
          <div style="font-size:22px">${s.icon||'📌'}</div>
          <div>
            <div style="font-size:14px;font-weight:500">${s.name}</div>
            <div style="font-size:12px;color:var(--text-3)">${s.renewal} • ${fmt(s.amount)} ر.س</div>
          </div>
        </div>
        <span style="font-size:12px;font-weight:600;color:${statusColor(days)}">${statusLabel(days)}</span>
      </div>`;
    }).join('') : '<p style="color:var(--text-3);font-size:14px;padding:8px 0">لا توجد اشتراكات قريبة من التجديد</p>';
  }).catch(() => {});

  // تذكيرات مخصصة
  const sorted = [...reminders].sort((a,b) => {
    const dA = daysUntil(a.dueDate), dB = daysUntil(b.dueDate);
    return (dA??999) - (dB??999);
  });

  // إحصائيات
  const overdue = reminders.filter(r => daysUntil(r.dueDate) !== null && daysUntil(r.dueDate) < 0).length;
  const soon    = reminders.filter(r => { const d=daysUntil(r.dueDate); return d!==null&&d>=0&&d<=3; }).length;
  document.getElementById('stat-total').textContent   = reminders.length;
  document.getElementById('stat-overdue').textContent = overdue;
  document.getElementById('stat-soon').textContent    = soon;

  document.getElementById('reminders-list').innerHTML = sorted.length ? sorted.map(r => {
    const days = daysUntil(r.dueDate);
    return `<div class="reminder-item ${statusClass(days)}">
      <div style="display:flex;align-items:center;gap:12px;flex:1">
        <div style="font-size:22px">${r.icon||'🔔'}</div>
        <div>
          <div style="font-size:14px;font-weight:500">${r.title}</div>
          <div style="font-size:12px;color:var(--text-3)">${r.dueDate||'بدون تاريخ'}${r.amount?` • ${fmt(r.amount)} ر.س`:''}</div>
          ${r.note ? `<div style="font-size:12px;color:var(--text-3);margin-top:2px">${r.note}</div>` : ''}
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        ${days !== null ? `<span style="font-size:12px;font-weight:600;color:${statusColor(days)}">${statusLabel(days)}</span>` : ''}
        <button class="btn-icon" onclick="editReminder(${r.id})">✏️</button>
        <button class="btn-icon" style="color:var(--red)" onclick="delReminder(${r.id})">🗑️</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">🔔</div><p>لا توجد تذكيرات — أضف تذكيرك الأول</p></div>';
}

function addReminder() {
  const title   = document.getElementById('r-title').value.trim();
  const icon    = document.getElementById('r-icon').value  || '🔔';
  const dueDate = document.getElementById('r-date').value;
  const amount  = document.getElementById('r-amount').value;
  const note    = document.getElementById('r-note').value.trim();
  if (!title) { alert('يرجى إدخال عنوان التذكير'); return; }
  const reminders = getReminders();
  reminders.push({ id:Date.now(), title, icon, dueDate, amount:amount?parseFloat(amount):null, note });
  saveReminders(reminders);
  closeModal('add-modal');
  ['r-title','r-icon','r-date','r-amount','r-note'].forEach(id => document.getElementById(id).value='');
  renderReminders();
}

function editReminder(id) {
  const r = getReminders().find(x=>x.id===id); if (!r) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-title').value  = r.title;
  document.getElementById('edit-icon').value   = r.icon||'';
  document.getElementById('edit-date').value   = r.dueDate||'';
  document.getElementById('edit-amount').value = r.amount||'';
  document.getElementById('edit-note').value   = r.note||'';
  openModal('edit-modal');
}

function saveEdit() {
  const id = parseInt(document.getElementById('edit-id').value);
  const reminders = getReminders().map(r => r.id===id ? {
    ...r,
    title:   document.getElementById('edit-title').value.trim(),
    icon:    document.getElementById('edit-icon').value||'🔔',
    dueDate: document.getElementById('edit-date').value,
    amount:  document.getElementById('edit-amount').value ? parseFloat(document.getElementById('edit-amount').value) : null,
    note:    document.getElementById('edit-note').value.trim()
  } : r);
  saveReminders(reminders);
  closeModal('edit-modal');
  renderReminders();
}

function delReminder(id) {
  if (!confirm(t('confirm_del'))) return;
  saveReminders(getReminders().filter(r => r.id!==id));
  renderReminders();
}


renderReminders();
