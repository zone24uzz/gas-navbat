// Admin panel

const token = sessionStorage.getItem('admin_token');
if (!token) location.href = '/admin-login.html';

const adminHeaders = { 'Content-Type': 'application/json', 'x-admin-token': token };

let servedCount = 0;
let currentQueue = [];
let currentSections = {};

function getSectionCount() {
  return parseInt(document.getElementById('section-count').value, 10);
}

// ── Sections ──────────────────────────────────────────────

function renderSections() {
  const count = getSectionCount();
  const grid = document.getElementById('sections-grid');
  let busy = 0;

  grid.innerHTML = '';
  for (let i = 1; i <= count; i++) {
    const key = `Sektsiya ${i}`;
    const user = currentSections[key];
    if (user) busy++;

    const card = document.createElement('div');
    card.className = 'section-card' + (user ? ' occupied' : '');
    card.innerHTML = `
      <div class="section-badge ${user ? '' : 'empty'}">${i}</div>
      <div style="flex:1;min-width:0;">
        <p style="margin:0;font-size:12px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:0.5px;">Sektsiya ${i}</p>
        ${user
          ? `<p style="margin:2px 0 0;font-weight:700;font-size:14px;color:var(--text);">${user.name}</p>
             <p style="margin:1px 0 0;font-size:12px;color:var(--text3);">🚗 ${user.carNumber || '—'}</p>`
          : `<p style="margin:2px 0 0;font-size:13px;color:var(--text3);">Bo'sh</p>`
        }
      </div>
      ${user
        ? `<button onclick="clearSection('${key}')" style="font-size:11px;font-weight:700;padding:5px 10px;border-radius:8px;border:1.5px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);color:#ef4444;cursor:pointer;">✓ Tayyor</button>`
        : ''
      }`;
    grid.appendChild(card);
  }

  document.getElementById('admin-sections-busy').textContent = busy;
}

async function clearSection(key) {
  // Get user info before clearing
  const user = currentSections[key];

  await fetch('/api/admin/sections/clear', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ section: key })
  });

  // Save to refueling history in localStorage
  if (user) {
    const history = JSON.parse(localStorage.getItem('refuel_history') || '[]');
    history.unshift({
      name:      user.name,
      carNumber: user.carNumber || '—',
      gasAmount: user.gasAmount || '—',
      section:   key,
      time:      new Date().toISOString()
    });
    // Keep max 500 records
    if (history.length > 500) history.splice(500);
    localStorage.setItem('refuel_history', JSON.stringify(history));
    updateHistoryUI();
  }

  delete currentSections[key];
  renderSections();
}

async function assignToSection(userId, section) {
  const res = await fetch('/api/admin/assign', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ userId, section })
  });
  if (res.ok) {
    servedCount++;
    document.getElementById('admin-served').textContent = servedCount;
    await loadQueue();
    await loadSections();
  }
}

async function loadSections() {
  try {
    currentSections = await fetch('/api/admin/sections', { headers: adminHeaders }).then(r => r.json());
    renderSections();
  } catch (e) {
    console.warn('Sections load error:', e);
  }
}

// ── Queue ─────────────────────────────────────────────────

async function loadQueue() {
  try {
    currentQueue = await fetch('/api/queue').then(r => r.json());
    document.getElementById('admin-count').textContent = currentQueue.length;
    document.getElementById('queue-count-badge').textContent = `${currentQueue.length} kishi`;

    const list = document.getElementById('admin-queue-list');
    if (currentQueue.length === 0) {
      list.innerHTML = '<p style="text-align:center;color:var(--text3);font-size:14px;padding:16px 0;">Navbat bo\'sh</p>';
      return;
    }

    const sectionCount = getSectionCount();

    list.innerHTML = currentQueue.map((u, i) => {
      // Build section buttons
      let btns = '';
      for (let s = 1; s <= sectionCount; s++) {
        const key = `Sektsiya ${s}`;
        const occupied = !!currentSections[key];
        btns += `<button class="assign-btn" ${occupied ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}
          onclick="assignToSection('${u.id}', '${key}')">
          ${occupied ? `S${s} ✗` : `→ S${s}`}
        </button>`;
      }

      return `
        <div class="queue-item ${i === 0 ? 'first' : ''}" style="flex-wrap:wrap;gap:8px;">
          <span style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;
            background:${i === 0 ? 'var(--accent2)' : 'var(--surface)'};
            color:${i === 0 ? '#fff' : 'var(--text2)'};
            border:1.5px solid ${i === 0 ? 'transparent' : 'var(--border)'};">${i + 1}</span>
          <div style="flex:1;min-width:120px;">
            <p style="margin:0;font-weight:600;font-size:14px;color:var(--text);">${u.name}</p>
            <p style="margin:2px 0 0;font-size:12px;color:var(--text3);">🚗 ${u.carNumber || '—'} · ${new Date(u.joinedAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}${u.gasAmount ? ` · ⛽ ${u.gasAmount}` : ''}</p>
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">${btns}</div>
        </div>`;
    }).join('');
  } catch (e) {
    console.warn('Queue poll error:', e);
  }
}

// ── Controls ──────────────────────────────────────────────

document.getElementById('btn-clear').addEventListener('click', async () => {
  if (!confirm('Navbatni tozalashni tasdiqlaysizmi?')) return;
  await fetch('/api/admin/clear', { method: 'POST', headers: adminHeaders });
  await loadQueue();
});

document.getElementById('btn-logout').addEventListener('click', () => {
  sessionStorage.removeItem('admin_token');
  location.href = '/admin-login.html';
});

document.getElementById('section-count').addEventListener('change', () => {
  renderSections();
  loadQueue();
});

// ── Refueling history ─────────────────────────────────────

function getTodayHistory() {
  const history = JSON.parse(localStorage.getItem('refuel_history') || '[]');
  const today = new Date().toDateString();
  return history.filter(r => new Date(r.time).toDateString() === today);
}

function updateHistoryUI() {
  const history = JSON.parse(localStorage.getItem('refuel_history') || '[]');
  const today = getTodayHistory();

  // Update today counter in stats
  const el = document.getElementById('admin-today');
  if (el) el.textContent = today.length;

  // Render table
  const tbody = document.getElementById('history-tbody');
  if (!tbody) return;

  if (!history.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text3);padding:24px;font-size:13px;">Hali zaправkalar yo'q</td></tr>`;
    return;
  }

  tbody.innerHTML = history.map((r, i) => {
    const t = new Date(r.time);
    const dateStr = t.toLocaleDateString('uz-UZ', { day:'2-digit', month:'2-digit' });
    const timeStr = t.toLocaleTimeString('uz-UZ', { hour:'2-digit', minute:'2-digit' });
    const isToday = t.toDateString() === new Date().toDateString();
    return `
      <tr style="border-bottom:1px solid var(--border);${isToday ? 'background:rgba(79,110,247,0.03);' : ''}">
        <td style="padding:10px 12px;font-size:13px;color:var(--text3);font-weight:500;">${history.length - i}</td>
        <td style="padding:10px 12px;">
          <p style="margin:0;font-size:13px;font-weight:600;color:var(--text);">${r.name}</p>
        </td>
        <td style="padding:10px 12px;font-size:13px;font-weight:700;color:var(--text2);">🚗 ${r.carNumber}</td>
        <td style="padding:10px 12px;font-size:12px;color:#f97316;font-weight:600;">⛽ ${r.gasAmount}</td>
        <td style="padding:10px 12px;font-size:12px;color:var(--text3);">
          ${isToday ? `<span style="color:var(--accent);font-weight:700;">Bugun</span> ` : dateStr + ' '}${timeStr}
        </td>
      </tr>`;
  }).join('');
}

function clearHistory() {
  if (!confirm('Barcha tarixni o\'chirishni tasdiqlaysizmi?')) return;
  localStorage.removeItem('refuel_history');
  updateHistoryUI();
}

// ── Gas status ────────────────────────────────────────────

let gasAvailable = true;

function setGasAvailable(val) {
  gasAvailable = val;
  const yes = document.getElementById('gas-btn-yes');
  const no  = document.getElementById('gas-btn-no');
  if (val) {
    yes.style.background = 'rgba(34,197,94,0.12)';
    yes.style.borderColor = '#22c55e';
    yes.style.color = '#15803d';
    no.style.background = 'var(--surface2)';
    no.style.borderColor = 'var(--border)';
    no.style.color = 'var(--text)';
  } else {
    no.style.background = 'rgba(239,68,68,0.08)';
    no.style.borderColor = '#ef4444';
    no.style.color = '#dc2626';
    yes.style.background = 'var(--surface2)';
    yes.style.borderColor = 'var(--border)';
    yes.style.color = 'var(--text)';
  }
}

async function saveGasStatus() {
  const message = document.getElementById('gas-message').value.trim();
  const eta     = document.getElementById('gas-eta').value.trim();
  await fetch('/api/admin/gas-status', {
    method: 'POST',
    headers: adminHeaders,
    body: JSON.stringify({ available: gasAvailable, message, eta })
  });
  const msg = document.getElementById('gas-saved-msg');
  msg.style.display = 'block';
  setTimeout(() => msg.style.display = 'none', 2000);
}

async function loadGasStatus() {
  try {
    const s = await fetch('/api/gas-status').then(r => r.json());
    gasAvailable = s.available;
    setGasAvailable(s.available);
    document.getElementById('gas-message').value = s.message || '';
    document.getElementById('gas-eta').value = s.eta || '';
  } catch {}
}

// ── Reviews ───────────────────────────────────────────────

async function loadReviews() {
  try {
    const reviews = await fetch('/api/admin/reviews', { headers: adminHeaders }).then(r => r.json());
    const list = document.getElementById('reviews-list');
    const avgEl = document.getElementById('reviews-avg');

    if (!reviews.length) {
      list.innerHTML = '<p style="text-align:center;color:var(--text3);font-size:14px;padding:16px 0;">Hali baholashlar yo\'q</p>';
      avgEl.textContent = '';
      return;
    }

    const avg = (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1);
    avgEl.textContent = `⭐ ${avg} o'rtacha (${reviews.length} ta)`;

    list.innerHTML = [...reviews].reverse().map(r => `
      <div class="queue-item">
        <div style="font-size:22px;flex-shrink:0;">${'⭐'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</div>
        <div style="flex:1;min-width:0;">
          ${r.comment ? `<p style="margin:0;font-size:13px;color:var(--text);">"${r.comment}"</p>` : ''}
          <p style="margin:${r.comment ? '3px' : '0'} 0 0;font-size:11px;color:var(--text3);">${r.section || ''} · ${new Date(r.time).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </div>`).join('');
  } catch (e) {
    console.warn('Reviews load error:', e);
  }
}

// ── Init + polling ────────────────────────────────────────

loadQueue();
loadSections();
loadReviews();
loadGasStatus();
updateHistoryUI();
setInterval(() => { loadQueue(); loadSections(); loadReviews(); }, 3000);
