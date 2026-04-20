// ===== comparison.js — مقارنة الأشهر =====
checkAuth();
renderSidebar('comparison');

const COLORS = ['#6366f1','#10b981','#eab308','#ef4444','#ec4899','#8b5cf6','#f97316','#14b8a6'];

// بناء قائمة الأشهر المتاحة
function buildMonthOptions(expenses) {
  const months = {};
  expenses.forEach(e => { if (e.date) months[e.date.slice(0,7)] = true; });
  return Object.keys(months).sort().reverse();
}

// حساب إحصائيات شهر معين
function calcMonth(expenses, income, month) {
  const exp = expenses.filter(e => e.date?.startsWith(month));
  const inc = income.filter(i => i.date?.startsWith(month));
  const totalExp = exp.reduce((s,e) => s + parseFloat(e.amount||0), 0);
  const totalInc = inc.reduce((s,i) => s + parseFloat(i.amount||0), 0);
  const catMap = {};
  exp.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + parseFloat(e.amount||0); });
  return { totalExp, totalInc, balance: totalInc - totalExp, catMap, count: exp.length };
}

function diffBadge(a, b, invert = false) {
  if (b === 0 && a === 0) return `<span class="diff-badge diff-same">—</span>`;
  const pct = b === 0 ? 100 : Math.round(((a - b) / b) * 100);
  const up = pct > 0;
  // invert=true → زيادة المصاريف سيئة
  const isGood = invert ? !up : up;
  return `<span class="diff-badge ${up ? (invert?'diff-up':'diff-down') : (invert?'diff-down':'diff-up')}">
    ${up ? '▲' : '▼'} ${Math.abs(pct)}%
  </span>`;
}

(async () => {
  try {
    const [expenses, incomeList] = await Promise.all([Storage.getExpenses(), Storage.getIncome()]);
    const exp = expenses||[], inc = incomeList||[];

    const months = buildMonthOptions(exp);
    if (months.length < 1) {
      document.getElementById('compare-body').innerHTML =
        '<div class="empty-state"><div class="empty-icon">📊</div><p>أضف مصاريف لأكثر من شهر لعرض المقارنة</p></div>';
      return;
    }

    // ملء قوائم الأشهر
    const selA = document.getElementById('month-a');
    const selB = document.getElementById('month-b');
    months.forEach((m, i) => {
      selA.innerHTML += `<option value="${m}" ${i===0?'selected':''}>${m}</option>`;
      selB.innerHTML += `<option value="${m}" ${i===1?'selected':''}>${m}</option>`;
    });

    function render() {
      const mA = selA.value, mB = selB.value;
      const dA = calcMonth(exp, inc, mA);
      const dB = calcMonth(exp, inc, mB);

      document.getElementById('month-a-title').textContent = mA;
      document.getElementById('month-b-title').textContent = mB;

      // إحصائيات رئيسية
      const rows = [
        { label:'إجمالي المصاريف', a:dA.totalExp, b:dB.totalExp, color:'var(--red)',   invert:true },
        { label:'إجمالي الدخل',    a:dA.totalInc, b:dB.totalInc, color:'var(--green)', invert:false },
        { label:'صافي التوفير',    a:dA.balance,  b:dB.balance,  color:'var(--accent)',invert:false },
        { label:'عدد العمليات',    a:dA.count,    b:dB.count,    color:'var(--text-1)',invert:true,  noFmt:true },
      ];

      document.getElementById('stats-compare').innerHTML = rows.map(r => `
        <div class="compare-row">
          <span style="color:var(--text-3)">${r.label}</span>
          <div style="display:flex;align-items:center;gap:12px">
            <span style="color:${r.color};font-weight:600">${r.noFmt ? r.a : fmt(r.a)+' ر.س'}</span>
            <span style="color:var(--text-3);font-size:12px">vs</span>
            <span style="color:${r.color};font-weight:600">${r.noFmt ? r.b : fmt(r.b)+' ر.س'}</span>
            ${diffBadge(r.a, r.b, r.invert)}
          </div>
        </div>`).join('');

      // مقارنة التصنيفات
      const allCats = [...new Set([...Object.keys(dA.catMap), ...Object.keys(dB.catMap)])];
      const catIcons = {'طعام':'🍽️','مواصلات':'🚗','تسوق':'🛍️','فواتير':'📄','ترفيه':'🎬','صحة':'💊','تعليم':'📚','أخرى':'📌'};
      const maxVal = Math.max(...allCats.map(c => Math.max(dA.catMap[c]||0, dB.catMap[c]||0)), 1);

      document.getElementById('cat-compare').innerHTML = allCats.length ? allCats.map((cat, i) => {
        const vA = dA.catMap[cat]||0, vB = dB.catMap[cat]||0;
        const pA = (vA/maxVal)*100, pB = (vB/maxVal)*100;
        return `<div style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:6px">
            <span>${catIcons[cat]||'💰'} ${cat}</span>
            <div style="display:flex;gap:8px;align-items:center">
              <span style="color:${COLORS[i%COLORS.length]};font-weight:600">${fmt(vA)} ر.س</span>
              <span style="color:var(--text-3);font-size:11px">vs ${fmt(vB)} ر.س</span>
              ${diffBadge(vA, vB, true)}
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:4px">
            <div class="bar-track" title="${mA}"><div class="bar-fill" style="width:${pA}%;background:${COLORS[i%COLORS.length]};opacity:1"></div></div>
            <div class="bar-track" title="${mB}"><div class="bar-fill" style="width:${pB}%;background:${COLORS[i%COLORS.length]};opacity:0.4"></div></div>
          </div>
          <div style="display:flex;gap:16px;font-size:11px;color:var(--text-3);margin-top:3px">
            <span>■ ${mA}</span><span style="opacity:0.5">■ ${mB}</span>
          </div>
        </div>`;
      }).join('') : '<p style="color:var(--text-3)">لا توجد مصاريف في هذين الشهرين</p>';
    }

    selA.addEventListener('change', render);
    selB.addEventListener('change', render);
    render();

  } catch(e) {
    console.error(e);
    document.getElementById('compare-body').innerHTML =
      '<div class="alert-card"><span>⚠️</span><div>تعذر جلب البيانات</div></div>';
  }
})();
