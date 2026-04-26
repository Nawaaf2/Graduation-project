// ===== goals.js =====
checkAuth();
renderSidebar('goals');

const COLORS = ['#10b981','#6366f1','#eab308','#ef4444','#8b5cf6','#ec4899'];
let allGoals = [];

async function loadGoals() {
  try { allGoals = await Storage.getGoals() || []; renderGoals(); }
  catch(e) { document.getElementById('goals-list').innerHTML = '<p style="color:var(--red)">تعذر جلب البيانات</p>'; }
}

function renderGoals() {
  let saved = 0, target = 0;
  document.getElementById('goals-list').innerHTML = allGoals.length ? allGoals.map(g => {
    const pct = Math.min((parseFloat(g.current||0)/parseFloat(g.target))*100, 100);
    saved += parseFloat(g.current||0); target += parseFloat(g.target);
    const tDate    = g.targetDate || g.target_date;
    const daysLeft = tDate ? Math.ceil((new Date(tDate) - new Date()) / 86400000) : null;
    const urgency  = daysLeft === null ? 'color:var(--text-3)' : daysLeft<30 ? 'color:var(--red)' : daysLeft<90 ? 'color:var(--yellow)' : 'color:var(--text-3)';
    return `<div class="goal-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:14px">
          <div style="width:48px;height:48px;background:rgba(0,0,0,0.1);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:26px">${g.icon||'🎯'}</div>
          <div>
            <div style="font-size:17px;font-weight:600">${g.name}</div>
            <div style="font-size:12px;${urgency}">⏰ ${daysLeft===null?'لا يوجد موعد':daysLeft>0?daysLeft+' يوم متبقي':'انتهى الموعد'}</div>
          </div>
        </div>
        <div style="text-align:left">
          <div style="font-size:21px;font-weight:700;color:${g.color||'var(--accent)'}">${fmt(g.current||0)}</div>
          <div style="font-size:12px;color:var(--text-3)">من ${fmt(g.target)} ر.س</div>
        </div>
      </div>
      <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${g.color||'var(--accent)'}"></div></div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px">
        <span style="font-weight:600;color:${g.color||'var(--accent)'};font-size:14px">${pct.toFixed(1)}%</span>
        <span style="font-size:12px;color:var(--text-3)">متبقي ${fmt(parseFloat(g.target)-parseFloat(g.current||0))} ر.س</span>
        <div style="display:flex;gap:6px">
          <button class="btn-icon" onclick="openDeposit(${g.id})">💰 إضافة</button>
          <button class="btn-icon" onclick="editGoal(${g.id})">✏️</button>
          <button class="btn-icon" style="color:var(--red)" onclick="delGoal(${g.id})">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">🎯</div><p>لا توجد أهداف بعد</p></div>';
  document.getElementById('st-count').textContent = allGoals.length;
  document.getElementById('st-saved').innerHTML   = `${fmt(saved)} <span class="stat-currency">ر.س</span>`;
  document.getElementById('st-pct').textContent   = target ? `${((saved/target)*100).toFixed(0)}%` : '0%';
}

async function addGoal() {
  const name       = document.getElementById('g-name').value.trim();
  const icon       = document.getElementById('g-icon').value || '🎯';
  const target     = parseFloat(document.getElementById('g-target').value);
  const current    = parseFloat(document.getElementById('g-current').value) || 0;
  const targetDate = document.getElementById('g-date').value;
  if (!name||!target||!targetDate) { alert('يرجى ملء جميع الحقول'); return; }
  try {
    await Storage.addGoal({name, icon, target, current, targetDate, color:COLORS[Math.floor(Math.random()*COLORS.length)]});
    closeModal('add-modal');
    ['g-name','g-icon','g-target','g-current','g-date'].forEach(id => document.getElementById(id).value = '');
    await loadGoals();
  } catch(e) { alert(e.message); }
}

function openDeposit(id) {
  document.getElementById('dep-id').value     = id;
  document.getElementById('dep-amount').value = '';
  openModal('deposit-modal');
}

async function saveDeposit() {
  const id     = parseInt(document.getElementById('dep-id').value);
  const amount = parseFloat(document.getElementById('dep-amount').value) || 0;
  if (amount<=0) { alert('يرجى إدخال مبلغ صحيح'); return; }
  try { await Storage.depositGoal(id, amount); closeModal('deposit-modal'); await loadGoals(); }
  catch(e) { alert(e.message); }
}

function editGoal(id) {
  const g = allGoals.find(x => x.id===id); if (!g) return;
  document.getElementById('edit-id').value      = id;
  document.getElementById('edit-name').value    = g.name;
  document.getElementById('edit-icon').value    = g.icon||'';
  document.getElementById('edit-target').value  = g.target;
  document.getElementById('edit-current').value = g.current||0;
  document.getElementById('edit-date').value    = g.targetDate||g.target_date||'';
  openModal('edit-modal');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('edit-id').value);
  const existing = allGoals.find(x => x.id === id);
  try {
    await Storage.updateGoal(id, {
      name:       document.getElementById('edit-name').value,
      icon:       document.getElementById('edit-icon').value,
      target:     parseFloat(document.getElementById('edit-target').value),
      current:    parseFloat(document.getElementById('edit-current').value),
      targetDate: document.getElementById('edit-date').value || null,
      color:      existing?.color || COLORS[0]
    });
    closeModal('edit-modal'); await loadGoals();
  } catch(e) { alert(e.message); }
}

async function delGoal(id) {
  if (!confirm(t('confirm_del'))) return;
  try { await Storage.deleteGoal(id); await loadGoals(); }
  catch(e) { alert(e.message); }
}

loadGoals();
