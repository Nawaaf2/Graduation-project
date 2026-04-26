// ===== ui.js — وظائف مشتركة =====
const T = {dashboard:'لوحة التحكم',expenses:'إضافة مصروف',income:'إضافة دخل',categories:'التصنيفات',goals:'الأهداف المالية',subscriptions:'الاشتراكات',reports:'التقارير',comparison:'مقارنة الأشهر',analytics:'التحليلات',reminders:'التذكيرات',settings:'الإعدادات',logout:'تسجيل خروج',dark:'داكن',light:'فاتح',sar:'ر.س',confirm_del:'هل أنت متأكد من الحذف؟',no_data:'لا توجد بيانات'};

function getTheme() { return localStorage.getItem('mufakkira_theme') || 'dark'; }
function t(k)       { return T[k] || k; }
function fmt(n)     { return Number(n||0).toLocaleString('ar-SA',{minimumFractionDigits:0,maximumFractionDigits:2}); }
function fmtDate(d) { if(!d)return''; return new Date(d).toLocaleDateString('ar-SA',{year:'numeric',month:'short',day:'numeric'}); }

function applyThemeAndLang() {
  document.body.dataset.theme = getTheme();
}

function toggleTheme() {
  const next = getTheme()==='dark'?'light':'dark';
  localStorage.setItem('mufakkira_theme', next);
  document.body.dataset.theme = next;
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => _updateThemeBtn(btn, next));
}
function _updateThemeBtn(btn, theme) {
  const isDark = (theme||getTheme())==='dark';
  btn.innerHTML = `<span style="font-size:13px;color:var(--text-2)">${isDark?t('dark'):t('light')}</span>
    <div class="theme-toggle-pill">
      <span class="${isDark?'active-pill':''}">🌙</span>
      <span class="${!isDark?'active-pill':''}">☀️</span>
    </div>`;
}
async function renderSidebar(activePage) {
  const el = document.getElementById('sidebar');
  if (!el) return;
  const isDark = getTheme()==='dark';
  const pages = [
    {id:'dashboard',     href:'dashboard.html',     icon:'📊'},
    {id:'expenses',      href:'expenses.html',      icon:'➖'},
    {id:'income',        href:'income.html',        icon:'➕'},
    {id:'categories',    href:'categories.html',    icon:'📁'},
    {id:'goals',         href:'goals.html',         icon:'🎯'},
    {id:'subscriptions', href:'subscriptions.html', icon:'🔄', badge:true},
    {id:'reports',       href:'reports.html',       icon:'📈'},
    {id:'comparison',    href:'comparison.html',    icon:'📊'},
    {id:'analytics',     href:'analytics.html',     icon:'🔍'},
    {id:'reminders',     href:'reminders.html',     icon:'🔔'},
    {id:'settings',      href:'settings.html',      icon:'⚙️'},
  ];
  let dueSoon = 0;
  try {
    const subs = await Storage.getSubscriptions();
    const today = new Date();
    dueSoon = (subs||[]).filter(s=>{ const d=Math.ceil((new Date(s.renewal)-today)/86400000); return d>=0&&d<=7; }).length;
  } catch(e) {}

  el.innerHTML = `
    <div class="sidebar-logo"><div class="sidebar-logo-icon">💰</div><span>مُفكّرة</span></div>
    <nav class="nav-menu">
      ${pages.map(p=>`
        <a href="${p.href}" class="nav-item ${activePage===p.id?'active':''}">
          <span class="nav-item-icon">${p.icon}</span>
          <span>${t(p.id)}</span>
          ${p.badge&&dueSoon>0?`<span class="nav-badge">${dueSoon}</span>`:''}
        </a>`).join('')}
    </nav>
    <div class="sidebar-bottom">
      <button class="theme-toggle-btn" onclick="toggleTheme()">
        <span style="font-size:13px;color:var(--text-2)">${isDark?t('dark'):t('light')}</span>
        <div class="theme-toggle-pill">
          <span class="${isDark?'active-pill':''}">🌙</span>
          <span class="${!isDark?'active-pill':''}">☀️</span>
        </div>
      </button>
<button class="btn-logout" onclick="logout()"><span>🚪</span><span>${t('logout')}</span></button>
    </div>`;
}

function showError(id,msg)   { const e=document.getElementById(id);if(!e)return;e.textContent=msg;e.style.display='block';setTimeout(()=>e.style.display='none',4000); }
function showSuccess(id,msg) { const e=document.getElementById(id);if(!e)return;e.textContent=msg;e.style.display='block';setTimeout(()=>e.style.display='none',3000); }
function openModal(id)  { document.getElementById(id)?.classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id)?.classList.add('hidden'); }
function exportCSV(data,filename) {
  if(!data||!data.length){alert(t('no_data'));return;}
  const keys=Object.keys(data[0]);
  const csv=[keys.join(','),...data.map(r=>keys.map(k=>`"${r[k]||''}"`).join(','))].join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download=filename+'.csv';a.click();
  URL.revokeObjectURL(url);
}
document.addEventListener('DOMContentLoaded', applyThemeAndLang);
