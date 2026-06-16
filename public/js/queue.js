// Queue logic — per-station, polling-based

const nameInput  = document.getElementById('name-input');
const carInput   = document.getElementById('car-input');
const joinBtn    = document.getElementById('join-btn');
const leaveBtn   = document.getElementById('leave-btn');
const joinError  = document.getElementById('join-error');
const queueList  = document.getElementById('queue-list');
const queueCount = document.getElementById('queue-count');
const myBanner   = document.getElementById('my-position-banner');
const myPosText  = document.getElementById('my-position-text');

let myUser = JSON.parse(sessionStorage.getItem('gazqueue_user') || 'null');
let pollInterval = null;
let selectedGas  = null;

// ── Station selection ─────────────────────────────────────
function getSelectedStation() {
  return {
    id:   localStorage.getItem('selected_station_id'),
    name: localStorage.getItem('selected_station_name'),
  };
}

function updateStationBanner() {
  const { id, name } = getSelectedStation();
  const banner = document.getElementById('selected-station-banner');
  const hint   = document.getElementById('no-station-hint');
  const label  = document.getElementById('selected-station-label');
  if (id && name) {
    if (banner) { banner.style.display = 'block'; }
    if (label)  { label.textContent = name; }
    if (hint)   { hint.style.display = 'none'; }
  } else {
    if (banner) { banner.style.display = 'none'; }
    if (hint)   { hint.style.display = 'block'; }
  }
}

// ── Gas selector ──────────────────────────────────────────
function selectGas(btn) {
  document.querySelectorAll('.gas-opt').forEach(b => {
    b.style.borderColor = 'var(--border)';
    b.style.background  = 'var(--surface2)';
  });
  btn.style.borderColor = 'var(--accent)';
  btn.style.background  = 'var(--accent-bg)';
  selectedGas = btn.dataset.val;
}

// ── UI Helpers ────────────────────────────────────────────
function showError(msg) {
  joinError.textContent = msg;
  joinError.style.display = 'block';
  setTimeout(() => joinError.style.display = 'none', 3000);
}

function renderQueue(queue) {
  queueCount.textContent = `${queue.length} kishi`;
  if (queue.length === 0) {
    queueList.innerHTML = '<p style="text-align:center;color:var(--text3);font-size:14px;padding:20px 0;">Navbat bo\'sh</p>';
    myBanner.style.display = 'none';
    return;
  }
  queueList.innerHTML = queue.map((u, i) => {
    const isMe = myUser && u.id === myUser.id;
    const isFirst = i === 0;
    const cls = isMe ? 'mine' : isFirst ? 'first' : '';
    return `
      <div class="queue-item ${cls}">
        <span style="width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;background:${isFirst?'var(--accent2)':'var(--surface)'};color:${isFirst?'#fff':'var(--text2)'};border:1.5px solid ${isFirst?'transparent':'var(--border)'};">${i+1}</span>
        <span style="flex:1;font-weight:600;font-size:14px;color:var(--text);">${u.name}</span>
        ${isFirst?'<span style="font-size:11px;font-weight:700;color:var(--accent2);background:rgba(34,197,94,0.12);padding:3px 9px;border-radius:20px;">Navbatda</span>':''}
        ${isMe&&!isFirst?'<span style="font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);padding:3px 9px;border-radius:20px;">Siz</span>':''}
      </div>`;
  }).join('');

  if (myUser) {
    const pos = queue.findIndex(u => u.id === myUser.id);
    if (pos !== -1) {
      myBanner.style.display = 'block';
      myPosText.textContent = pos === 0
        ? '🎉 Siz navbatdasiz! Iltimos yaqinlashing.'
        : `Siz navbatda #${pos+1} o'rindasiz — ${pos} kishi oldingizda`;
    } else {
      myBanner.style.display = 'none';
      clearMyUser();
    }
  }
}

function setJoined(user) {
  myUser = user;
  sessionStorage.setItem('gazqueue_user', JSON.stringify(user));
  joinBtn.style.display = 'none';
  nameInput.style.display = 'none';
  carInput.style.display = 'none';
  document.querySelectorAll('.gas-opt').forEach(b => b.parentElement.style.display = 'none');
  leaveBtn.style.display = 'flex';
}

function clearMyUser() {
  myUser = null;
  selectedGas = null;
  sessionStorage.removeItem('gazqueue_user');
  joinBtn.style.display = 'flex';
  nameInput.style.display = 'block';
  carInput.style.display = 'block';
  document.querySelectorAll('.gas-opt').forEach(b => {
    b.parentElement.style.display = 'grid';
    b.style.borderColor = 'var(--border)';
    b.style.background  = 'var(--surface2)';
  });
  leaveBtn.style.display = 'none';
  myBanner.style.display = 'none';
}

// ── Polling ───────────────────────────────────────────────
async function pollQueue() {
  const { id } = getSelectedStation();
  if (!id) return;
  try {
    const queue = await fetch(`/api/station/queue?stationId=${id}`).then(r => r.json());
    renderQueue(queue);
    checkReviewRequest();
  } catch(e) { console.warn('Poll error:', e); }
}

function startPolling() {
  pollQueue();
  if (!pollInterval) pollInterval = setInterval(pollQueue, 3000);
}

// ── Join ──────────────────────────────────────────────────
joinBtn.addEventListener('click', async () => {
  const { id: stationId, name: stationName } = getSelectedStation();
  if (!stationId) { showError('Avval xaritadan zaправka tanlang'); return; }
  const name      = nameInput.value.trim();
  const carNumber = carInput.value.trim().toUpperCase();
  if (!name)       { showError('Ismingizni kiriting'); return; }
  if (!carNumber)  { showError('Mashina raqamini kiriting'); return; }
  if (!selectedGas){ showError('Qancha gaz kerakligini tanlang'); return; }

  joinBtn.disabled = true;
  joinBtn.textContent = 'Yuklanmoqda...';

  try {
    const res = await fetch('/api/station/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stationId, name, carNumber, gasAmount: selectedGas })
    });
    const data = await res.json();
    if (!res.ok) { showError(data.error); return; }
    // Save stationId with user so leave works
    data.user.stationId = stationId;
    setJoined(data.user);
    pollQueue();
  } catch {
    showError('Xatolik yuz berdi');
  } finally {
    joinBtn.disabled = false;
    joinBtn.textContent = 'Navbatga yozilish';
  }
});

// ── Leave ─────────────────────────────────────────────────
leaveBtn.addEventListener('click', async () => {
  if (!myUser) return;
  const stationId = myUser.stationId || getSelectedStation().id;
  await fetch('/api/station/leave', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationId, id: myUser.id })
  });
  clearMyUser();
  pollQueue();
});

nameInput.addEventListener('keydown', e => { if (e.key === 'Enter') carInput.focus(); });
carInput.addEventListener('keydown',  e => { if (e.key === 'Enter') joinBtn.click(); });

// ── Notification badge ────────────────────────────────────
function updateBadge(notifs) {
  const badge = document.getElementById('notif-badge');
  if (!badge) return;
  const unread = notifs.filter(n => !n.read).length;
  badge.textContent = unread > 9 ? '9+' : unread;
  badge.style.display = unread > 0 ? 'flex' : 'none';
}

// ── Review modal ──────────────────────────────────────────
function showReviewModal(section) {
  const existing = document.getElementById('review-modal');
  if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'review-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:20px;padding:28px 24px;max-width:360px;width:100%;box-shadow:0 20px 60px rgba(0,0,0,0.2);text-align:center;animation:slideUp 0.3s ease;">
      <div style="width:64px;height:64px;background:linear-gradient(135deg,#4f6ef7,#22c55e);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;">
        <span style="font-size:28px;">⭐</span>
      </div>
      <h2 style="font-size:18px;font-weight:800;color:#1a1f36;margin:0 0 6px;">Xizmatimizni baholang</h2>
      <p style="font-size:13px;color:#9aa3bf;margin:0 0 20px;">${section} · Xizmat yakunlandi</p>
      <div id="stars-row" style="display:flex;justify-content:center;gap:8px;margin-bottom:20px;">
        ${[1,2,3,4,5].map(n=>`<button data-star="${n}" onclick="selectStar(${n})" style="font-size:32px;background:none;border:none;cursor:pointer;transition:transform 0.15s;line-height:1;filter:grayscale(1);opacity:0.4;" onmouseover="hoverStar(${n})" onmouseout="unhoverStar()">⭐</button>`).join('')}
      </div>
      <textarea id="review-comment" placeholder="Izoh qoldiring (ixtiyoriy)..."
        style="width:100%;border:1.5px solid #e4eaf5;border-radius:12px;padding:12px;font-size:13px;font-family:inherit;resize:none;height:80px;outline:none;box-sizing:border-box;color:#1a1f36;"
        onfocus="this.style.borderColor='#4f6ef7'" onblur="this.style.borderColor='#e4eaf5'"></textarea>
      <button id="review-submit-btn" onclick="submitReview()"
        style="width:100%;margin-top:12px;padding:14px;background:linear-gradient(135deg,#4f6ef7,#22c55e);color:#fff;font-weight:700;font-size:15px;border:none;border-radius:12px;cursor:pointer;opacity:0.4;pointer-events:none;transition:opacity 0.2s;">
        Yuborish
      </button>
      <button onclick="document.getElementById('review-modal').remove()"
        style="width:100%;margin-top:8px;padding:11px;background:none;color:#9aa3bf;font-size:13px;font-weight:600;border:none;cursor:pointer;">
        O'tkazib yuborish
      </button>
    </div>
    <style>@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}</style>`;
  document.body.appendChild(modal);
}

let selectedStar = 0;

function selectStar(n) {
  selectedStar = n;
  document.querySelectorAll('#stars-row button').forEach((btn, i) => {
    btn.style.filter = i < n ? 'none' : 'grayscale(1)';
    btn.style.opacity = i < n ? '1' : '0.4';
    btn.style.transform = i < n ? 'scale(1.15)' : 'scale(1)';
  });
  const sb = document.getElementById('review-submit-btn');
  sb.style.opacity = '1'; sb.style.pointerEvents = 'auto';
}

function hoverStar(n) {
  if (selectedStar) return;
  document.querySelectorAll('#stars-row button').forEach((btn, i) => {
    btn.style.filter = i < n ? 'none' : 'grayscale(1)';
    btn.style.opacity = i < n ? '0.8' : '0.4';
  });
}

function unhoverStar() {
  if (selectedStar) return;
  document.querySelectorAll('#stars-row button').forEach(btn => {
    btn.style.filter = 'grayscale(1)'; btn.style.opacity = '0.4';
  });
}

async function submitReview() {
  if (!selectedStar || !myUser) return;
  const comment = document.getElementById('review-comment').value.trim();
  const stationId = myUser.stationId || getSelectedStation().id;
  await fetch('/api/station/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stationId, userId: myUser.id, stars: selectedStar, comment })
  });
  selectedStar = 0;
  const modal = document.getElementById('review-modal');
  if (modal) {
    modal.innerHTML = `<div style="background:#fff;border-radius:20px;padding:40px 24px;max-width:360px;width:100%;text-align:center;animation:slideUp 0.3s ease;">
      <div style="font-size:56px;margin-bottom:12px;">🎉</div>
      <h2 style="font-size:18px;font-weight:800;color:#1a1f36;margin:0 0 8px;">Rahmat!</h2>
      <p style="font-size:13px;color:#9aa3bf;margin:0;">Sizning fikringiz bizga juda muhim</p>
      <style>@keyframes slideUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}</style>
    </div>`;
    setTimeout(() => modal.remove(), 2000);
  }
}

async function checkReviewRequest() {
  if (!myUser) return;
  try {
    const data = await fetch(`/api/review-check/${myUser.id}`).then(r => r.json());
    if (data && !document.getElementById('review-modal')) {
      showReviewModal(data.section || 'Sektsiya');
    }
  } catch {}
}

// ── Init ──────────────────────────────────────────────────
updateStationBanner();

if (myUser) {
  const stationId = myUser.stationId || getSelectedStation().id;
  if (stationId) {
    fetch(`/api/station/queue?stationId=${stationId}`)
      .then(r => r.json())
      .then(queue => {
        if (queue.find(u => u.id === myUser.id)) {
          setJoined(myUser);
          renderQueue(queue);
        } else {
          clearMyUser();
        }
      });
  }
}

startPolling();
