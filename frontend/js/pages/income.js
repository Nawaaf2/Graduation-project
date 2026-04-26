// ===== income.js =====
checkAuth();
renderSidebar('income');

let selSource = 'راتب', selIcon = '💼', allIncome = [];

document.getElementById('date').value = new Date().toISOString().split('T')[0];
document.getElementById('time').value = new Date().toTimeString().slice(0,5);

function selSrc(btn, name, icon) {
  document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selSource = name; selIcon = icon;
}

async function loadIncome() {
  try { allIncome = await Storage.getIncome() || []; renderList(); }
  catch(e) { document.getElementById('income-list').innerHTML = '<p style="color:var(--red)">تعذر جلب البيانات</p>'; }
}

function renderList() {
  document.getElementById('income-list').innerHTML = allIncome.length ? allIncome.map(i => `
    <div class="income-item">
      <div style="display:flex;align-items:center;gap:10px;flex:1">
        <div style="width:36px;height:36px;background:rgba(16,185,129,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">${i.icon||'💰'}</div>
        <div>
          <div style="font-size:14px;font-weight:500">${i.source}${i.description?' — '+i.description:''}</div>
          <div style="font-size:11px;color:var(--text-3)">${i.date||''}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span style="font-size:15px;font-weight:700;color:var(--green)">+${fmt(i.amount)} ر.س</span>
        <button class="btn-icon" onclick="editInc(${i.id})">✏️</button>
        <button class="btn-icon" style="color:var(--red)" onclick="delInc(${i.id})">🗑️</button>
      </div>
    </div>`).join('')
  : '<div class="empty-state"><div class="empty-icon">💰</div><p>لا توجد إدخالات بعد</p></div>';
}

async function saveIncome() {
  const amount = parseFloat(document.getElementById('amount').value);
  const desc   = document.getElementById('desc').value.trim();
  const date   = document.getElementById('date').value;
  const time   = document.getElementById('time').value;
  if (!amount||amount<=0) { showError('error-msg','يرجى إدخال مبلغ صحيح'); return; }
  try {
    await Storage.addIncome({source:selSource, icon:selIcon, amount, description:desc, date, time});
    showSuccess('success-msg','تم حفظ الدخل ✓');
    document.getElementById('amount').value = '';
    document.getElementById('desc').value   = '';
    await loadIncome();
  } catch(e) { showError('error-msg', e.message); }
}

function editInc(id) {
  const i = allIncome.find(x => x.id===id); if (!i) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-source').value = i.source;
  document.getElementById('edit-amount').value = i.amount;
  document.getElementById('edit-date').value   = i.date||'';
  openModal('edit-modal');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('edit-id').value);
  const existing = allIncome.find(x => x.id === id);
  try {
    await Storage.updateIncome(id, {
      source:      document.getElementById('edit-source').value,
      amount:      parseFloat(document.getElementById('edit-amount').value),
      date:        document.getElementById('edit-date').value,
      icon:        existing?.icon || '💰',
      description: existing?.description || ''
    });
    closeModal('edit-modal'); await loadIncome();
  } catch(e) { alert(e.message); }
}

async function delInc(id) {
  if (!confirm(t('confirm_del'))) return;
  try { await Storage.deleteIncome(id); await loadIncome(); }
  catch(e) { alert(e.message); }
}

async function doExport() {
  const data = await Storage.getIncome();
  exportCSV((data||[]).map(i=>({source:i.source,amount:i.amount,date:i.date,description:i.description||''})), 'income');
}

loadIncome();
