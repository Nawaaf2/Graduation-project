// ===== settings.js =====
const user = checkAuth();
renderSidebar('settings');

if (user) {
  document.getElementById('s-name').textContent  = user.name;
  document.getElementById('s-email').textContent = user.email;
}

function updateBtn() {
  const btn    = document.getElementById('theme-btn');
  const isDark = getTheme() === 'dark';
  btn.innerHTML = `<span style="font-size:13px;color:var(--text-2)">${isDark?'داكن':'فاتح'}</span>
    <div class="theme-toggle-pill">
      <span class="${isDark?'active-pill':''}">🌙</span>
      <span class="${!isDark?'active-pill':''}">☀️</span>
    </div>`;
}
updateBtn();

async function doExportExp() {
  const d = await Storage.getExpenses();
  exportCSV((d||[]).map(e=>({category:e.category,amount:e.amount,description:e.description,date:e.date})), 'expenses');
}

async function doExportInc() {
  const d = await Storage.getIncome();
  exportCSV((d||[]).map(i=>({source:i.source,amount:i.amount,date:i.date})), 'income');
}

function doLogout() { logout(); }
