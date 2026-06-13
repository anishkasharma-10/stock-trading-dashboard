// ─── STOCK DATA ───────────────────────────────────────────────
const STOCKS = {
  TCS:       { name: 'Tata Consultancy', price: 3842.50, base: 3842.50 },
  INFY:      { name: 'Infosys Ltd',      price: 1543.75, base: 1543.75 },
  RELIANCE:  { name: 'Reliance Ind.',    price: 2930.20, base: 2930.20 },
  WIPRO:     { name: 'Wipro Ltd',        price: 452.60,  base: 452.60  },
  HDFC:      { name: 'HDFC Bank',        price: 1672.30, base: 1672.30 },
  ICICIBANK: { name: 'ICICI Bank',       price: 1089.45, base: 1089.45 },
};

const SECTORS = [
  { name: 'IT & Tech',    change: +3.2,  color: '#4D9EFF' },
  { name: 'Banking',      change: +1.8,  color: '#00D47E' },
  { name: 'Energy',       change: -0.9,  color: '#FF4D6A' },
  { name: 'FMCG',         change: +0.5,  color: '#FFB800' },
  { name: 'Auto',         change: +2.1,  color: '#A855F7' },
];

let currentTradeType = 'BUY';
let chartHistory = [];
let chartRange = '1D';
let recentTrades = [];

// ─── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  generateChartHistory();
  renderStocks();
  renderWatchlist();
  renderSectors();
  renderRecentTrades();
  drawChart();
  updateClock();
  updateTradeSummary();

  setInterval(tickPrices, 1800);
  setInterval(updateClock, 1000);
  setInterval(drawChart, 3000);
});

// ─── CLOCK ─────────────────────────────────────────────────────
function updateClock() {
  const now = new Date();
  const t = now.toLocaleTimeString('en-IN', { hour12: false });
  document.getElementById('navTime').textContent = `IST ${t}`;
}

// ─── CHART HISTORY ─────────────────────────────────────────────
function generateChartHistory() {
  chartHistory = [];
  let val = 21200 + Math.random() * 400;
  const points = chartRange === '1Y' ? 365 : chartRange === '1M' ? 30 : chartRange === '1W' ? 7 : 78;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.48) * (chartRange === '1Y' ? 80 : 30);
    val = Math.max(19000, Math.min(23000, val));
    chartHistory.push(val);
  }
}

function setRange(range) {
  chartRange = range;
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  event.target.classList.add('active');
  generateChartHistory();
  drawChart();
}

// ─── CANVAS CHART ──────────────────────────────────────────────
function drawChart() {
  const canvas = document.getElementById('mainChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.offsetWidth;
  const H = 200;
  canvas.width = W;
  canvas.height = H;

  const data = [...chartHistory];
  if (data.length < 2) return;

  const min = Math.min(...data) - 50;
  const max = Math.max(...data) + 50;
  const pad = { top: 10, right: 10, bottom: 30, left: 50 };

  ctx.clearRect(0, 0, W, H);

  const toX = i => pad.left + (i / (data.length - 1)) * (W - pad.left - pad.right);
  const toY = v => pad.top + (1 - (v - min) / (max - min)) * (H - pad.top - pad.bottom);

  // Gradient fill
  const isUp = data[data.length - 1] >= data[0];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  if (isUp) {
    grad.addColorStop(0, 'rgba(0,212,126,0.25)');
    grad.addColorStop(1, 'rgba(0,212,126,0)');
  } else {
    grad.addColorStop(0, 'rgba(255,77,106,0.25)');
    grad.addColorStop(1, 'rgba(255,77,106,0)');
  }

  // Fill area
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.lineTo(toX(data.length - 1), H - pad.bottom);
  ctx.lineTo(toX(0), H - pad.bottom);
  ctx.closePath();
  ctx.fillStyle = grad;
  ctx.fill();

  // Line
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(data[0]));
  data.forEach((v, i) => ctx.lineTo(toX(i), toY(v)));
  ctx.strokeStyle = isUp ? '#00D47E' : '#FF4D6A';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.stroke();

  // Y-axis labels
  ctx.fillStyle = '#4A5568';
  ctx.font = '10px JetBrains Mono, monospace';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = min + (max - min) * (i / 4);
    const y = toY(v);
    ctx.fillText(v.toFixed(0), pad.left - 5, y + 3);
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(W - pad.right, y);
    ctx.strokeStyle = 'rgba(30,45,61,0.8)';
    ctx.lineWidth = 0.5;
    ctx.stroke();
  }

  // Update chart price display
  const last = data[data.length - 1];
  const first = data[0];
  const pct = ((last - first) / first * 100).toFixed(2);
  document.getElementById('chartPrice').textContent = last.toFixed(2);
  const changeEl = document.getElementById('chartChange');
  changeEl.textContent = `${pct >= 0 ? '▲' : '▼'} ${pct >= 0 ? '+' : ''}${pct}%`;
  changeEl.className = 'chart-change ' + (pct >= 0 ? 'positive' : 'negative');
}

// ─── STOCK CARDS ───────────────────────────────────────────────
function renderStocks() {
  const container = document.getElementById('stocksList');
  container.innerHTML = '';

  Object.entries(STOCKS).forEach(([sym, s]) => {
    const change = ((s.price - s.base) / s.base * 100);
    const isUp = change >= 0;
    const div = document.createElement('div');
    div.className = `stock-item ${isUp ? 'up' : 'down'}`;
    div.id = `stock-${sym}`;
    div.onclick = () => selectStock(sym);
    div.innerHTML = `
      <div class="stock-top">
        <span class="stock-name">${sym}</span>
        <span class="stock-price">₹${s.price.toFixed(2)}</span>
      </div>
      <div class="stock-bottom">
        <span class="stock-fullname">${s.name}</span>
        <span class="stock-change">${isUp ? '▲' : '▼'} ${change >= 0 ? '+' : ''}${change.toFixed(2)}%</span>
      </div>`;
    container.appendChild(div);
  });
}

function selectStock(sym) {
  const s = STOCKS[sym];
  document.getElementById('chartTitle').textContent = sym;
  document.getElementById('tradeStock').value = sym;
  generateChartHistory();
  drawChart();
  updateTradeSummary();
}

// ─── WATCHLIST ─────────────────────────────────────────────────
function renderWatchlist() {
  const ul = document.getElementById('watchlist');
  ul.innerHTML = '';
  Object.entries(STOCKS).slice(0, 5).forEach(([sym, s]) => {
    const change = ((s.price - s.base) / s.base * 100);
    const isUp = change >= 0;
    const li = document.createElement('li');
    li.innerHTML = `
      <span class="wl-name">${sym}</span>
      <div style="text-align:right">
        <div class="wl-price" style="color:${isUp ? 'var(--green)' : 'var(--red)'}" id="wl-${sym}">₹${s.price.toFixed(0)}</div>
        <div class="wl-change" style="color:${isUp ? 'var(--green)' : 'var(--red)'}">${isUp ? '+' : ''}${change.toFixed(1)}%</div>
      </div>`;
    ul.appendChild(li);
  });
}

// ─── SECTORS ───────────────────────────────────────────────────
function renderSectors() {
  const container = document.getElementById('sectorsList');
  container.innerHTML = '';
  SECTORS.forEach(sec => {
    const isUp = sec.change >= 0;
    const barWidth = Math.min(Math.abs(sec.change) / 5 * 100, 100);
    const div = document.createElement('div');
    div.className = 'sector-row';
    div.innerHTML = `
      <div class="sector-top">
        <span class="sector-name">${sec.name}</span>
        <span class="sector-val" style="color:${isUp ? 'var(--green)' : 'var(--red)'}">${isUp ? '+' : ''}${sec.change}%</span>
      </div>
      <div class="sector-bar">
        <div class="sector-fill" style="width:${barWidth}%;background:${isUp ? 'var(--green)' : 'var(--red)'}"></div>
      </div>`;
    container.appendChild(div);
  });
}

// ─── RECENT TRADES ─────────────────────────────────────────────
function addDefaultTrades() {
  const samples = [
    { sym: 'TCS', type: 'BUY', qty: 5, price: 3840.00 },
    { sym: 'INFY', type: 'SELL', qty: 10, price: 1542.00 },
    { sym: 'RELIANCE', type: 'BUY', qty: 3, price: 2928.50 },
  ];
  const now = new Date();
  samples.forEach((t, i) => {
    const d = new Date(now - i * 25 * 60000);
    recentTrades.push({ ...t, time: d.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' }) });
  });
}

function renderRecentTrades() {
  if (recentTrades.length === 0) addDefaultTrades();
  const container = document.getElementById('tradesList');
  container.innerHTML = '';
  [...recentTrades].reverse().slice(0, 8).forEach(t => {
    const val = (t.qty * t.price).toFixed(0);
    const div = document.createElement('div');
    div.className = 'trade-row';
    div.innerHTML = `
      <div class="trade-row-left">
        <span class="trade-row-sym">${t.sym}</span>
        <span class="trade-row-time">${t.time}</span>
      </div>
      <div class="trade-row-right">
        <div class="trade-row-val" style="color:${t.type === 'BUY' ? 'var(--green)' : 'var(--red)'}">${t.type} · ₹${parseInt(val).toLocaleString('en-IN')}</div>
        <div class="trade-row-qty">Qty: ${t.qty}</div>
      </div>`;
    container.appendChild(div);
  });
}

// ─── TRADE TYPE ────────────────────────────────────────────────
function setTradeType(type, el) {
  currentTradeType = type;
  document.querySelectorAll('.trade-tab').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  const btn = document.getElementById('tradeBtn');
  btn.textContent = `Place ${type} Order`;
  btn.className = `trade-btn ${type.toLowerCase()}`;
  updateTradeSummary();
}

function updateTradeSummary() {
  const sym = document.getElementById('tradeStock')?.value || 'TCS';
  const qty = parseInt(document.getElementById('tradeQty')?.value || 10);
  const price = STOCKS[sym]?.price || 0;
  const total = (qty * price).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  document.getElementById('tradeSummary').textContent = `Estimated: ₹${total}`;
}

document.addEventListener('change', e => {
  if (e.target.id === 'tradeStock' || e.target.id === 'tradeQty') updateTradeSummary();
});

// ─── PLACE ORDER ───────────────────────────────────────────────
function placeOrder() {
  const sym = document.getElementById('tradeStock').value;
  const qty = parseInt(document.getElementById('tradeQty').value);
  const price = STOCKS[sym].price;
  const type = currentTradeType;

  if (!qty || qty < 1) return showToast('❌ Invalid quantity', 'error');

  const now = new Date();
  const time = now.toLocaleTimeString('en-IN', { hour12: false, hour: '2-digit', minute: '2-digit' });
  recentTrades.push({ sym, type, qty, price, time });
  renderRecentTrades();

  const total = (qty * price).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  showToast(`✅ ${type} ${qty}x ${sym} @ ₹${price.toFixed(2)}\nTotal: ₹${total}`, 'success');
}

// ─── TOAST ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.borderColor = type === 'success' ? 'var(--green)' : 'var(--red)';
  toast.style.color = type === 'success' ? 'var(--green)' : 'var(--red)';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ─── PRICE TICK (Real-time Simulation) ────────────────────────
function tickPrices() {
  Object.keys(STOCKS).forEach(sym => {
    const s = STOCKS[sym];
    const volatility = sym === 'RELIANCE' ? 0.003 : 0.004;
    const drift = (Math.random() - 0.49) * volatility;
    s.price = Math.max(s.base * 0.85, s.price * (1 + drift));
  });

  chartHistory.push(chartHistory[chartHistory.length - 1] + (Math.random() - 0.48) * 25);
  if (chartHistory.length > 100) chartHistory.shift();

  renderStocks();
  renderWatchlist();
  updateTradeSummary();

  // Update portfolio value (simulate)
  const base = 1284320;
  const variance = (Math.random() - 0.48) * 5000;
  const newVal = base + variance;
  document.getElementById('portfolioVal').textContent =
    '₹' + newVal.toLocaleString('en-IN', { maximumFractionDigits: 0 });
}
