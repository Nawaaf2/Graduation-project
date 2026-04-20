// ===== analytics.js — التحليلات =====
checkAuth();
renderSidebar('analytics');

const COLORS = ['#6366f1','#10b981','#eab308','#ef4444','#ec4899','#8b5cf6','#f97316','#14b8a6'];
const CAT_ICONS = {'طعام':'🍽️','مواصلات':'🚗','تسوق':'🛍️','فواتير':'📄','ترفيه':'🎬','صحة':'💊','تعليم':'📚','أخرى':'📌'};

(async () => {
  try {
    const [expenses, incomeList] = await Promise.all([Storage.getExpenses(), Storage.getIncome()]);
    const exp = expenses||[], inc = incomeList||[];

    const totalExp = exp.reduce((s,e) => s+parseFloat(e.amount||0), 0);
    const totalInc = inc.reduce((s,i) => s+parseFloat(i.amount||0), 0);
    const balance  = totalInc - totalExp;

    // ===== بطاقات الملخص =====
    const savingsRate = totalInc > 0 ? ((balance/totalInc)*100).toFixed(1) : 0;
    const dates = exp.filter(e=>e.date).map(e=>e.date).sort();
    const dayCount = dates.length >= 2
      ? Math.max(1, Math.ceil((new Date(dates[dates.length-1]) - new Date(dates[0])) / 86400000))
      : 1;
    const avgDaily = (totalExp / dayCount).toFixed(1);

    // أعلى تصنيف إنفاق
    const catMap = {};
    exp.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + parseFloat(e.amount||0); });
    const topCat = Object.entries(catMap).sort((a,b)=>b[1]-a[1])[0];

    document.getElementById('kpi-row').innerHTML = `
      <div class="stat-card">
        <div class="stat-header"><span class="stat-label">نسبة التوفير</span><div class="stat-icon">💎</div></div>
        <div class="stat-value" style="color:${savingsRate>=20?'var(--green)':savingsRate>=0?'var(--yellow)':'var(--red)'}">${savingsRate}%</div>
        <div class="stat-sub">${savingsRate>=20?'ممتاز 🎉':savingsRate>=10?'جيد 👍':'يحتاج تحسين ⚠️'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-header"><span class="stat-label">متوسط الإنفاق اليومي</span><div class="stat-icon">📅</div></div>
        <div class="stat-value">${fmt(avgDaily)} <span class="stat-currency">ر.س</span></div>
        <div class="stat-sub">خلال ${dayCount} يوم</div>
      </div>
      <div class="stat-card">
        <div class="stat-header"><span class="stat-label">أعلى تصنيف إنفاق</span><div class="stat-icon">🏆</div></div>
        <div class="stat-value" style="font-size:18px">${topCat ? topCat[0] : '—'}</div>
        <div class="stat-sub">${topCat ? fmt(topCat[1])+' ر.س' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-header"><span class="stat-label">إجمالي العمليات</span><div class="stat-icon">🧾</div></div>
        <div class="stat-value">${exp.length}</div>
        <div class="stat-sub">مصروف مسجل</div>
      </div>`;

    // ===== توزيع التصنيفات =====
    const sorted = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
    const maxVal = sorted[0]?.[1]||1;
    document.getElementById('cat-breakdown').innerHTML = sorted.length ? sorted.map(([cat, total], i) => {
      const pct = ((total/totalExp)*100).toFixed(1);
      return `<div class="insight-item">
        <div class="insight-icon" style="background:${COLORS[i%COLORS.length]}22">${CAT_ICONS[cat]||'💰'}</div>
        <div style="flex:1">
          <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px">
            <span>${cat}</span>
            <span style="color:${COLORS[i%COLORS.length]};font-weight:600">${fmt(total)} ر.س</span>
          </div>
          <div class="bar-track" style="height:8px">
            <div class="bar-fill" style="width:${(total/maxVal)*100}%;background:${COLORS[i%COLORS.length]}"></div>
          </div>
        </div>
        <span style="font-size:12px;color:var(--text-3);min-width:36px;text-align:left">${pct}%</span>
      </div>`;
    }).join('') : '<p style="color:var(--text-3)">لا توجد بيانات</p>';

    // ===== اتجاه الإنفاق الشهري =====
    const monthMap = {};
    exp.forEach(e => { if(e.date){ const m=e.date.slice(0,7); monthMap[m]=(monthMap[m]||0)+parseFloat(e.amount||0); }});
    const months = Object.keys(monthMap).sort().slice(-6);
    const vals   = months.map(m => monthMap[m]);
    const maxM   = Math.max(...vals, 1);

    if (months.length >= 2) {
      document.getElementById('trend-bars').innerHTML = months.map((m, i) => {
        const h = Math.max(((vals[i]/maxM)*100), 4);
        const isLast = i === months.length-1;
        return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:4px">
          <span style="font-size:11px;color:var(--text-3)">${fmt(vals[i])}</span>
          <div class="trend-bar" style="height:${h}%;background:${isLast?'var(--accent)':COLORS[i%COLORS.length]};opacity:${isLast?1:0.6}"></div>
          <span style="font-size:10px;color:var(--text-3)">${m.slice(5)}</span>
        </div>`;
      }).join('');

      // تحليل الاتجاه
      const last  = vals[vals.length-1];
      const prev  = vals[vals.length-2];
      const trend = last > prev ? `▲ ارتفع بنسبة ${Math.round(((last-prev)/prev)*100)}% عن الشهر السابق` :
                    last < prev ? `▼ انخفض بنسبة ${Math.round(((prev-last)/prev)*100)}% عن الشهر السابق` :
                    'لم يتغير عن الشهر السابق';
      document.getElementById('trend-insight').textContent = trend;
      document.getElementById('trend-insight').style.color = last > prev ? 'var(--red)' : 'var(--green)';
    } else {
      document.getElementById('trend-bars').innerHTML = '<p style="color:var(--text-3);font-size:13px">أضف بيانات لأكثر من شهر</p>';
    }

    // ===== رؤى ذكية =====
    const insights = [];
    if (savingsRate < 10) insights.push({ icon:'⚠️', color:'rgba(239,68,68,0.1)', text:`نسبة توفيرك ${savingsRate}% — يُنصح بتوفير 20% على الأقل من دخلك` });
    if (topCat && totalExp > 0 && (catMap[topCat[0]]/totalExp) > 0.4) insights.push({ icon:'🔍', color:'rgba(234,179,8,0.1)', text:`${topCat[0]} يستنزف ${((catMap[topCat[0]]/totalExp)*100).toFixed(0)}% من إنفاقك — هل يمكن تقليله؟` });
    if (avgDaily > 200) insights.push({ icon:'📊', color:'rgba(239,68,68,0.1)', text:`متوسط إنفاقك اليومي مرتفع (${fmt(avgDaily)} ر.س) — راجع مصاريفك اليومية` });
    if (balance > 0) insights.push({ icon:'✅', color:'rgba(16,185,129,0.1)', text:`أنت في الإيجاب — وفّرت ${fmt(balance)} ر.س حتى الآن` });
    if (exp.length === 0) insights.push({ icon:'💡', color:'rgba(99,102,241,0.1)', text:'ابدأ بتسجيل مصاريفك للحصول على تحليلات دقيقة' });

    document.getElementById('smart-insights').innerHTML = insights.length ? insights.map(ins => `
      <div class="insight-item">
        <div class="insight-icon" style="background:${ins.color}">${ins.icon}</div>
        <p style="font-size:13px;color:var(--text-1);line-height:1.5">${ins.text}</p>
      </div>`).join('') : '<p style="color:var(--text-3)">لا توجد رؤى بعد — أضف المزيد من البيانات</p>';

  } catch(e) {
    console.error(e);
  }
})();
