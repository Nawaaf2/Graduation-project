// ===== expenses.js =====
checkAuth();
renderSidebar('expenses');

const CAT_ICONS = {'طعام':'🍽️','مواصلات':'🚗','تسوق':'🛍️','فواتير':'📄','ترفيه':'🎬','صحة':'💊','تعليم':'📚','أخرى':'📌'};
let selectedCat = '';
let allExpenses = [];

document.getElementById('date').value = new Date().toISOString().split('T')[0];

(async () => {
  try {
    const cats = await Storage.getCategories();
    if (cats?.length) {
      selectedCat = cats[0].name;
      document.getElementById('cat-grid').innerHTML = cats.map(c => `
        <button class="cat-btn ${c.name===selectedCat?'selected':''}" onclick="selCat(this,'${c.name}')">
          <span>${c.icon||'📌'}</span><span>${c.name}</span>
        </button>`).join('');
      document.getElementById('filter-cat').innerHTML =
        '<option value="">كل التصنيفات</option>' + cats.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
      document.getElementById('edit-cat').innerHTML =
        cats.map(c=>`<option value="${c.name}">${c.icon||''} ${c.name}</option>`).join('');
    } else {
      document.getElementById('cat-grid').innerHTML = '<p style="color:var(--text-3)">لا توجد تصنيفات — <a href="categories.html" class="link">أضف تصنيف</a></p>';
    }
  } catch(e) {
    document.getElementById('cat-grid').innerHTML = '<p style="color:var(--red)">تعذر جلب التصنيفات</p>';
  }
  await loadExpenses();
})();

function selCat(btn, name) {
  document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedCat = name;
}

async function loadExpenses() {
  try {
    allExpenses = await Storage.getExpenses() || [];
    renderList();
  } catch(e) {
    document.getElementById('exp-list').innerHTML = '<p style="color:var(--red)">تعذر جلب المصاريف</p>';
  }
}

function renderList() {
  const search    = document.getElementById('search').value.toLowerCase();
  const filterCat = document.getElementById('filter-cat').value;
  const data = allExpenses.filter(e => {
    const matchSearch = !search || (e.description||'').toLowerCase().includes(search) || (e.category||'').includes(search);
    const matchCat    = !filterCat || e.category === filterCat;
    return matchSearch && matchCat;
  });
  const total = data.reduce((s,e) => s + parseFloat(e.amount||0), 0);
  document.getElementById('total-bar').innerHTML = `المجموع: <strong style="color:var(--red)">${fmt(total)} ر.س</strong> (${data.length} عملية)`;
  document.getElementById('exp-list').innerHTML = data.length ? data.map(e => `
    <div class="exp-item">
      <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
        <div style="width:36px;height:36px;background:rgba(239,68,68,0.1);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0">${CAT_ICONS[e.category]||'💸'}</div>
        <div style="min-width:0">
          <div style="font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${e.description||'—'}</div>
          <div style="font-size:11px;color:var(--text-3)">${e.category||''} • ${e.date||''}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
        <span style="font-size:15px;font-weight:700;color:var(--red)">-${fmt(e.amount)} ر.س</span>
        <button class="btn-icon" onclick="editExpense(${e.id})">✏️</button>
        <button class="btn-icon" style="color:var(--red)" onclick="delExp(${e.id})">🗑️</button>
      </div>
    </div>`).join('')
  : '<div class="empty-state"><div class="empty-icon">🗂️</div><p>لا توجد نتائج</p></div>';
}

async function saveExpense() {
  const amount      = parseFloat(document.getElementById('amount').value);
  const description = document.getElementById('description').value.trim();
  const date        = document.getElementById('date').value;
  const notes       = document.getElementById('notes').value.trim();
  if (!amount||amount<=0) { showError('error-msg','يرجى إدخال مبلغ صحيح'); return; }
  if (!description)        { showError('error-msg','يرجى إدخال وصف'); return; }
  try {
    await Storage.addExpense({category:selectedCat, amount, description, date, notes});
    showSuccess('success-msg','تم حفظ المصروف ✓');
    document.getElementById('amount').value = '';
    document.getElementById('description').value = '';
    document.getElementById('notes').value = '';
    await loadExpenses();
  } catch(e) { showError('error-msg', e.message); }
}

function editExpense(id) {
  const e = allExpenses.find(x => x.id===id);
  if (!e) return;
  document.getElementById('edit-id').value     = id;
  document.getElementById('edit-cat').value    = e.category;
  document.getElementById('edit-amount').value = e.amount;
  document.getElementById('edit-desc').value   = e.description;
  document.getElementById('edit-date').value   = e.date||'';
  openModal('edit-modal');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('edit-id').value);
  const existing = allExpenses.find(x => x.id === id);
  try {
    await Storage.updateExpense(id, {
      category:    document.getElementById('edit-cat').value,
      amount:      parseFloat(document.getElementById('edit-amount').value),
      description: document.getElementById('edit-desc').value,
      date:        document.getElementById('edit-date').value,
      notes:       existing?.notes || ''
    });
    closeModal('edit-modal');
    await loadExpenses();
  } catch(e) { alert(e.message); }
}

async function delExp(id) {
  if (!confirm(t('confirm_del'))) return;
  try { await Storage.deleteExpense(id); await loadExpenses(); }
  catch(e) { alert(e.message); }
}

async function doExport() {
  const data = await Storage.getExpenses();
  exportCSV((data||[]).map(e=>({category:e.category,amount:e.amount,description:e.description,date:e.date,notes:e.notes||''})), 'expenses');
}
