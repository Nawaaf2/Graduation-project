// ===== subscriptions.js =====
checkAuth();
renderSidebar('subscriptions');

const COLORS      = ['#1DB954','#6366f1','#10b981','#E50914','#f97316','#8b5cf6'];
const cycleLabel  = {monthly:'شهري', yearly:'سنوي', weekly:'أسبوعي'};
let allSubs = [];

async function loadSubs() {
  try { allSubs = await Storage.getSubscriptions() || []; renderSubs(); }
  catch(e) { document.getElementById('subs-list').innerHTML = '<p style="color:var(--red)">تعذر جلب البيانات</p>'; }
}

function renderSubs() {
  const today = new Date();
  let monthly = 0, yearly = 0, due = 0;
  document.getElementById('subs-list').innerHTML = allSubs.length ? allSubs.map(s => {
    const days   = Math.ceil((new Date(s.renewal) - today) / 86400000);
    const isSoon = days>=0 && days<=7;
    if (isSoon) due++;
    if (s.cycle==='monthly')      { monthly += parseFloat(s.amount);    yearly += parseFloat(s.amount)*12; }
    else if (s.cycle==='yearly')  { monthly += parseFloat(s.amount)/12; yearly += parseFloat(s.amount); }
    else                          { monthly += parseFloat(s.amount)*4;  yearly += parseFloat(s.amount)*52; }
    return `<div class="sub-item">
      <div style="display:flex;align-items:center;gap:14px;flex:1">
        <div class="sub-icon">${s.icon||'📌'}</div>
        <div>
          <div style="font-size:15px;font-weight:500">${s.name}</div>
          <div style="font-size:12px;color:var(--text-3)">${cycleLabel[s.cycle]||s.cycle} • ${s.renewal||''}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <span style="font-size:15px;font-weight:700;color:var(--red)">-${fmt(s.amount)} ر.س</span>
        ${isSoon ? `<span class="badge-soon">⏰ ${days} أيام</span>` : '<span class="badge-ok">✓ نشط</span>'}
        <button class="btn-icon" onclick="editSub(${s.id})">✏️</button>
        <button class="btn-icon" style="color:var(--red)" onclick="delSub(${s.id})">🗑️</button>
      </div>
    </div>`;
  }).join('') : '<div class="empty-state"><div class="empty-icon">🔄</div><p>لا توجد اشتراكات</p></div>';
  document.getElementById('s-monthly').innerHTML = `${fmt(Math.round(monthly))} <span class="stat-currency">ر.س</span>`;
  document.getElementById('s-yearly').innerHTML  = `${fmt(Math.round(yearly))} <span class="stat-currency">ر.س</span>`;
  document.getElementById('s-due').textContent   = due;
}

async function addSub() {
  const name    = document.getElementById('s-name').value.trim();
  const icon    = document.getElementById('s-icon').value || '📌';
  const amount  = parseFloat(document.getElementById('s-amount').value);
  const cycle   = document.getElementById('s-cycle').value;
  const renewal = document.getElementById('s-renewal').value;
  if (!name||!amount||!renewal) { alert('يرجى ملء جميع الحقول'); return; }
  try {
    await Storage.addSubscription({name, icon, amount, cycle, renewal, color:COLORS[Math.floor(Math.random()*COLORS.length)]});
    closeModal('add-modal');
    ['s-name','s-icon','s-amount','s-renewal'].forEach(id => document.getElementById(id).value = '');
    await loadSubs();
  } catch(e) { alert(e.message); }
}

function editSub(id) {
  const s = allSubs.find(x => x.id===id); if (!s) return;
  document.getElementById('edit-id').value      = id;
  document.getElementById('edit-name').value    = s.name;
  document.getElementById('edit-icon').value    = s.icon||'';
  document.getElementById('edit-amount').value  = s.amount;
  document.getElementById('edit-cycle').value   = s.cycle;
  document.getElementById('edit-renewal').value = s.renewal||'';
  openModal('edit-modal');
}

async function saveEdit() {
  const id = parseInt(document.getElementById('edit-id').value);
  try {
    await Storage.updateSubscription(id, {name:document.getElementById('edit-name').value, icon:document.getElementById('edit-icon').value, amount:parseFloat(document.getElementById('edit-amount').value), cycle:document.getElementById('edit-cycle').value, renewal:document.getElementById('edit-renewal').value});
    closeModal('edit-modal'); await loadSubs();
  } catch(e) { alert(e.message); }
}

async function delSub(id) {
  if (!confirm(t('confirm_del'))) return;
  try { await Storage.deleteSubscription(id); await loadSubs(); }
  catch(e) { alert(e.message); }
}

loadSubs();
