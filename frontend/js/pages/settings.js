// ===== settings.js =====
checkAuth();
renderSidebar('settings');

// ── تحميل القيم المحفوظة ──
document.getElementById('balance-threshold').value = localStorage.getItem('mufakkira_balance_threshold') || '';
document.getElementById('monthly-budget').value    = localStorage.getItem('mufakkira_monthly_budget')    || '';

// ── المظهر ──
function updateBtn() {
  const btn    = document.getElementById('theme-btn');
  const isDark = getTheme() === 'dark';
  btn.innerHTML = `<span style="font-size:13px;color:var(--text-2)">${isDark ? 'داكن' : 'فاتح'}</span>
    <div class="theme-toggle-pill">
      <span class="${isDark ? 'active-pill' : ''}"><i class="fa-solid fa-moon"></i></span>
      <span class="${!isDark ? 'active-pill' : ''}"><i class="fa-solid fa-sun" style="color:rgb(255,212,59)"></i></span>
    </div>`;
}
updateBtn();

// ── حفظ حد التحذير ──
function saveThreshold() {
  const val = parseFloat(document.getElementById('balance-threshold').value);
  if (!val || val < 1 || val > 99) { showError('error-msg', 'أدخل نسبة بين 1 و 99'); return; }
  localStorage.setItem('mufakkira_balance_threshold', val);
  showSuccess('success-msg', `✓ سيظهر التحذير لما يقل الرصيد عن ${val}% من دخلك`);
}

// ── حفظ الميزانية ──
function saveBudget() {
  const val = parseFloat(document.getElementById('monthly-budget').value);
  if (!val || val <= 0) { showError('error-msg', 'أدخل مبلغاً صحيحاً'); return; }
  localStorage.setItem('mufakkira_monthly_budget', val);
  showSuccess('success-msg', `✓ الميزانية الشهرية: ${val.toLocaleString('ar-SA')} ر.س`);
}

// ── تصدير الكل ──
async function doExportAll() {
  try {
    const [expenses, income, subs] = await Promise.all([
      Storage.getExpenses(),
      Storage.getIncome(),
      Storage.getSubscriptions()
    ]);
    const rows = [
      ...(expenses || []).map(e => ({ النوع: 'مصروف',  التفاصيل: e.description || e.category || '', المبلغ: e.amount, التاريخ: e.date })),
      ...(income   || []).map(i => ({ النوع: 'دخل',    التفاصيل: i.source || '',                   المبلغ: i.amount, التاريخ: i.date })),
      ...(subs     || []).map(s => ({ النوع: 'اشتراك', التفاصيل: s.name || '',                     المبلغ: s.amount, التاريخ: s.renewal })),
    ];
    exportCSV(rows, 'mufakkira-all-data');
  } catch(e) {
    showError('error-msg', 'تعذّر التصدير، حاول مجدداً');
  }
}

// ── تصدير المصاريف ──
async function doExportExp() {
  const d = await Storage.getExpenses();
  exportCSV((d || []).map(e => ({ category: e.category, amount: e.amount, description: e.description, date: e.date })), 'expenses');
}

// ── تصدير الدخل ──
async function doExportInc() {
  const d = await Storage.getIncome();
  exportCSV((d || []).map(i => ({ source: i.source, amount: i.amount, date: i.date })), 'income');
}

// ── حذف جميع البيانات ──
let deleteConfirmPending = false;

async function handleDeleteAll() {
  const btn = document.getElementById('delete-btn');

  if (!deleteConfirmPending) {
    deleteConfirmPending = true;
    btn.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> اضغط مجدداً للتأكيد';
    btn.style.background = 'rgba(239,68,68,0.12)';
    setTimeout(() => {
      if (deleteConfirmPending) {
        deleteConfirmPending = false;
        btn.innerHTML = '<i class="fa-solid fa-trash"></i> حذف الكل';
        btn.style.background = '';
      }
    }, 4000);
    return;
  }

  deleteConfirmPending = false;
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحذف...';

  try {
    const [expenses, income, goals, subs] = await Promise.all([
      Storage.getExpenses(),
      Storage.getIncome(),
      Storage.getGoals(),
      Storage.getSubscriptions()
    ]);
    await Promise.all([
      ...(expenses || []).map(e => Storage.deleteExpense(e.id)),
      ...(income   || []).map(i => Storage.deleteIncome(i.id)),
      ...(goals    || []).map(g => Storage.deleteGoal(g.id)),
      ...(subs     || []).map(s => Storage.deleteSubscription(s.id)),
    ]);
    showSuccess('success-msg', '✓ تم حذف جميع البيانات');
  } catch(e) {
    showError('error-msg', 'حدث خطأ أثناء الحذف');
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-trash"></i> حذف الكل';
    btn.style.background = '';
  }
}
