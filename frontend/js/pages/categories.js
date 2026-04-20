// ===== categories.js =====
checkAuth();
renderSidebar('categories');

let allCats = [], allExpenses = [];

async function loadAll() {
  try {
    [allCats, allExpenses] = await Promise.all([Storage.getCategories(), Storage.getExpenses()]);
    allCats = allCats||[]; allExpenses = allExpenses||[];
    renderCats();
  } catch(e) { document.getElementById('cats-grid').innerHTML = '<p style="color:var(--red)">تعذر جلب البيانات</p>'; }
}

function renderCats() {
  document.getElementById('total-c').textContent = allCats.length;
  document.getElementById('cats-grid').innerHTML = allCats.length ? allCats.map(c => {
    const rel   = allExpenses.filter(e => e.category===c.name);
    const total = rel.reduce((s,e) => s+parseFloat(e.amount||0), 0);
    return `<div class="cat-card" style="border-top:3px solid ${c.color||'#6366f1'}">
      <div style="font-size:40px;margin-bottom:8px">${c.icon||'📌'}</div>
      <div style="font-size:16px;font-weight:600">${c.name}</div>
      <div style="display:flex;justify-content:space-between;margin-top:10px;padding-top:10px;border-top:1px solid var(--border);font-size:12px;color:var(--text-3)">
        <span>📋 ${rel.length} عمليات</span><span>💰 ${fmt(total)} ر.س</span>
      </div>
      <button class="btn-outline" style="width:100%;margin-top:10px;font-size:12px;color:var(--red);border-color:rgba(239,68,68,0.3)" onclick="delCat(${c.id})">🗑️ حذف</button>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">📁</div><p>لا توجد تصنيفات</p></div>';
}

function toggleForm() {
  const f = document.getElementById('add-form');
  f.style.display = f.style.display==='none' ? 'block' : 'none';
}

async function addCat() {
  const name  = document.getElementById('c-name').value.trim();
  const icon  = document.getElementById('c-icon').value || '📌';
  const color = document.getElementById('c-color').value;
  if (!name) { alert('يرجى إدخال اسم التصنيف'); return; }
  try {
    await Storage.addCategory({name, icon, color});
    document.getElementById('c-name').value = '';
    document.getElementById('c-icon').value = '';
    toggleForm(); await loadAll();
  } catch(e) { alert(e.message); }
}

async function delCat(id) {
  if (!confirm(t('confirm_del'))) return;
  try { await Storage.deleteCategory(id); await loadAll(); }
  catch(e) { alert(e.message); }
}

loadAll();
