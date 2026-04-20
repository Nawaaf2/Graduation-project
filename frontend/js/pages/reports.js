// ===== reports.js =====
checkAuth();
renderSidebar('reports');

const COLORS    = ['#6366f1','#10b981','#eab308','#ef4444','#ec4899','#8b5cf6','#f97316','#14b8a6'];
const CAT_ICONS = {'طعام':'🍽️','مواصلات':'🚗','تسوق':'🛍️','فواتير':'📄','ترفيه':'🎬','صحة':'💊','تعليم':'📚','أخرى':'📌'};

(async () => {
  try {
    const [expenses, incomeList] = await Promise.all([Storage.getExpenses(), Storage.getIncome()]);
    const exp = expenses||[], inc = incomeList||[];
    const totalIncome   = inc.reduce((s,i) => s+parseFloat(i.amount||0), 0);
    const totalExpenses = exp.reduce((s,e) => s+parseFloat(e.amount||0), 0);
    const balance       = totalIncome - totalExpenses;

    document.getElementById('r-income').innerHTML   = `${fmt(totalIncome)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('r-exp').innerHTML      = `${fmt(totalExpenses)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('r-balance').innerHTML  = `${fmt(balance)} <span class="stat-currency">ر.س</span>`;
    document.getElementById('r-balance').style.color = balance>=0 ? 'var(--green)' : 'var(--red)';

    // أعمدة التصنيفات
    const catMap = {};
    exp.forEach(e => { catMap[e.category] = (catMap[e.category]||0) + parseFloat(e.amount||0); });
    const sorted = Object.entries(catMap).sort((a,b) => b[1]-a[1]);
    const maxVal = sorted[0]?.[1] || 1;
    document.getElementById('bar-chart').innerHTML = sorted.length ? sorted.map(([name,total],i) => `
      <div class="bar-row">
        <span class="bar-label">${CAT_ICONS[name]||''} ${name}</span>
        <div class="bar-track"><div class="bar-fill" style="width:${(total/maxVal)*100}%;background:${COLORS[i%COLORS.length]}"></div></div>
        <span class="bar-val" style="color:${COLORS[i%COLORS.length]}">${fmt(total)} ر.س</span>
      </div>`).join('')
    : '<p style="color:var(--text-3)">لا توجد بيانات بعد</p>';

    // مخطط شهري
    const monthMap = {};
    exp.forEach(e => { if(e.date){ const m=e.date.slice(0,7); monthMap[m]=(monthMap[m]||0)+parseFloat(e.amount||0); }});
    const months = Object.keys(monthMap).sort().slice(-6);
    if (months.length > 1) {
      const canvas = document.getElementById('line-chart');
      const ctx    = canvas.getContext('2d');
      const W=canvas.width, H=canvas.height;
      const vals   = months.map(m => monthMap[m]);
      const maxV   = Math.max(...vals)||1;
      const pad=40, chartW=W-pad*2, chartH=H-pad*2;
      const isDark = document.body.dataset.theme !== 'light';
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      ctx.lineWidth   = 1;
      for(let i=0;i<=4;i++){ const y=pad+chartH*(i/4); ctx.beginPath(); ctx.moveTo(pad,y); ctx.lineTo(W-pad,y); ctx.stroke(); }
      const pts = months.map((m,i) => ({x:pad+i*(chartW/(months.length-1)), y:pad+chartH*(1-monthMap[m]/maxV)}));
      ctx.strokeStyle='#6366f1'; ctx.lineWidth=2.5; ctx.lineJoin='round';
      ctx.beginPath(); pts.forEach((p,i) => i===0?ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y)); ctx.stroke();
      const grad = ctx.createLinearGradient(0,pad,0,H-pad);
      grad.addColorStop(0,'rgba(99,102,241,0.25)'); grad.addColorStop(1,'rgba(99,102,241,0)');
      ctx.fillStyle=grad; ctx.beginPath(); ctx.moveTo(pts[0].x,pts[0].y);
      pts.forEach(p => ctx.lineTo(p.x,p.y));
      ctx.lineTo(pts[pts.length-1].x,H-pad); ctx.lineTo(pts[0].x,H-pad); ctx.closePath(); ctx.fill();
      pts.forEach((p,i) => {
        ctx.fillStyle='#6366f1'; ctx.beginPath(); ctx.arc(p.x,p.y,5,0,2*Math.PI); ctx.fill();
        ctx.fillStyle=isDark?'#a0a0b8':'#52527a'; ctx.font='10px sans-serif'; ctx.textAlign='center';
        ctx.fillText(months[i].slice(5), p.x, H-pad+14);
        ctx.fillText(fmt(vals[i]), p.x, p.y-10);
      });
    } else {
      document.getElementById('line-chart').style.display = 'none';
    }
  } catch(e) { console.error(e); }
})();

async function doExport() {
  const data = await Storage.getExpenses();
  exportCSV((data||[]).map(e=>({category:e.category,amount:e.amount,description:e.description,date:e.date})), 'expenses_report');
}
