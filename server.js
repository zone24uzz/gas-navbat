import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import webpush from 'web-push';
import { initBot, sendTelegramNotification } from './bot.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// ── VAPID ─────────────────────────────────────────────────
const VAPID_PUBLIC  = 'BFv2gHyM-ILVNIDQBMbEThm4OO5eXWjvebp9UA0M_Jl7YOzIYdJPdeHAPGVk1f9jld5UQxBAyG0g1Kv4a-vmIp8';
const VAPID_PRIVATE = 'hBY4j5qJAsxKgiw6DkCxLOnbnJe-0thNuUEhG68BbTU';
webpush.setVapidDetails('mailto:admin@gazqueue.uz', VAPID_PUBLIC, VAPID_PRIVATE);

// ── Admin credentials ─────────────────────────────────────
// ── Bot config ────────────────────────────────────────────
const BOT_USERNAME = process.env.BOT_USERNAME || 'GazQueueBot';

const ADMIN_PHONE    = '+998909995526';
const ADMIN_PASSWORD = 'komron2013';

// ── Per-station credentials ───────────────────────────────
const STATIONS_AUTH = {
  's01': { phone: '+998901112233', password: 'azs101', name: 'Metan AZS №1 — Chilonzor' },
  's02': { phone: '+998902223344', password: 'azs202', name: 'Metan AZS №2 — Chilonzor' },
  's03': { phone: '+998903334455', password: 'azs303', name: 'Metan AZS №3 — Yunusobod' },
  's04': { phone: '+998904445566', password: 'azs404', name: 'Metan AZS №4 — Yunusobod' },
  's05': { phone: '+998905556677', password: 'azs505', name: "Metan AZS №5 — Mirzo Ulug'bek" },
  's06': { phone: '+998906667788', password: 'azs606', name: "Metan AZS №6 — Mirzo Ulug'bek" },
  's07': { phone: '+998907778899', password: 'azs707', name: 'Metan AZS №7 — Shayxontohur' },
  's08': { phone: '+998908889900', password: 'azs808', name: 'Metan AZS №8 — Shayxontohur' },
  's09': { phone: '+998909990011', password: 'azs909', name: 'Metan AZS №9 — Uchtepa' },
  's10': { phone: '+998901010101', password: 'azs110', name: 'Metan AZS №10 — Uchtepa' },
  's11': { phone: '+998902020202', password: 'azs211', name: 'Metan AZS №11 — Yakkasaroy' },
  's12': { phone: '+998903030303', password: 'azs312', name: 'Metan AZS №12 — Yakkasaroy' },
  's13': { phone: '+998904040404', password: 'azs413', name: 'Metan AZS №13 — Bektemir' },
  's14': { phone: '+998905050505', password: 'azs514', name: 'Metan AZS №14 — Sergeli' },
  's15': { phone: '+998906060606', password: 'azs615', name: 'Metan AZS №15 — Sergeli' },
  's16': { phone: '+998907070707', password: 'azs716', name: 'Metan AZS №16 — Olmazor' },
  's17': { phone: '+998908080808', password: 'azs817', name: 'Metan AZS №17 — Olmazor' },
  's18': { phone: '+998909090909', password: 'azs918', name: 'Metan AZS №18 — Yashnobod' },
};

function stationToken(id) { return `gazqueue-station-${id}`; }
function verifyStationToken(token) {
  for (const [id] of Object.entries(STATIONS_AUTH)) {
    if (stationToken(id) === token) return id;
  }
  return null;
}

// ── Users file storage ────────────────────────────────────
const USERS_FILE = join(__dirname, 'data', 'users.json');

function loadUsers() {
  if (!existsSync(USERS_FILE)) return [];
  try { return JSON.parse(readFileSync(USERS_FILE, 'utf8')); }
  catch { return []; }
}

function saveUsers() {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// users: [{ id, name, phone, carNumber, password, createdAt, telegramChatId }]
let users = loadUsers();

// ── Refuel history (persisted) ────────────────────────────
const HISTORY_FILE = join(__dirname, 'data', 'history.json');
function loadHistory() {
  if (!existsSync(HISTORY_FILE)) return [];
  try { return JSON.parse(readFileSync(HISTORY_FILE, 'utf8')); }
  catch { return []; }
}
function saveHistory() {
  writeFileSync(HISTORY_FILE, JSON.stringify(refuelHistory, null, 2), 'utf8');
}
let refuelHistory = loadHistory();

// ── In-memory runtime storage ─────────────────────────────
let queue = [];
const subscriptions = new Map();
const notifications = new Map();
const sections = {};
const reviewRequests = new Map();
const reviews = [];
let gasStatus = { available: true, message: '', eta: '' };

// Per-station in-memory storage
const stationQueues   = {};   // stationId → []
const stationSections = {};   // stationId → {}
const stationReviews  = {};   // stationId → []
const stationGasStatus = {};  // stationId → {}

function getStationQueue(sid)   { return stationQueues[sid]    || (stationQueues[sid] = []); }
function getStationSections(sid){ return stationSections[sid]  || (stationSections[sid] = {}); }
function getStationReviews(sid) { return stationReviews[sid]   || (stationReviews[sid] = []); }
function getStationGas(sid)     { return stationGasStatus[sid] || (stationGasStatus[sid] = { available: true, message: '', eta: '' }); }

// ── Track phones that have linked Telegram ────────────────
const linkedPhones = new Set();

// Rebuild from persisted users who already have telegramChatId
function rebuildLinkedPhones() {
  linkedPhones.clear();
  users.forEach(u => {
    if (u.telegramChatId) linkedPhones.add(normalizePhone(u.phone));
  });
  console.log(`📱 Telegram linked phones restored: ${linkedPhones.size}`);
}
rebuildLinkedPhones();

// Called by bot.js when a phone is successfully linked via /link
export function markPhoneVerified(phone) {
  const normalized = normalizePhone(phone);
  linkedPhones.add(normalized);
  console.log('📱 Phone verified via Telegram:', normalized);
}

export function isPhoneVerified(phone) {
  return linkedPhones.has(normalizePhone(phone));
}

export { BOT_USERNAME };

// ── Helpers ───────────────────────────────────────────────
function broadcast() {
  io.emit('queue:update', queue);
}

function addNotification(userId, title, body) {
  if (!notifications.has(userId)) notifications.set(userId, []);
  notifications.get(userId).unshift({
    id: Date.now().toString(), title, body,
    time: new Date().toISOString(), read: false
  });
  const list = notifications.get(userId);
  if (list.length > 50) list.splice(50);
  io.emit(`notif:${userId}`, list);
}

async function sendPush(userId, payload) {
  const sub = subscriptions.get(userId);
  if (!sub) return;
  try { await webpush.sendNotification(sub, JSON.stringify(payload)); }
  catch { subscriptions.delete(userId); }
}

function normalizePhone(phone) {
  // Strip spaces and ensure +998 prefix
  return phone.replace(/\s/g, '');
}

// ── Auth middleware for admin routes ──────────────────────
function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'];
  if (token !== 'gazqueue-admin-token') {
    return res.status(401).json({ error: 'Ruxsat yo\'q' });
  }
  next();
}

// ── REST API ──────────────────────────────────────────────

app.get('/api/vapid-public-key', (req, res) => res.json({ key: VAPID_PUBLIC }));
app.get('/api/queue', (req, res) => res.json(queue));

// POST /api/auth/register
// POST /api/auth/admin-login — returns admin token if credentials match
app.post('/api/auth/admin-login', (req, res) => {
  const { phone, password } = req.body;
  if (normalizePhone(phone) === ADMIN_PHONE && password === ADMIN_PASSWORD) {
    return res.json({ token: 'gazqueue-admin-token' });
  }
  res.status(401).json({ error: 'Noto\'g\'ri ma\'lumotlar' });
});

// GET /api/users — admin only
app.get('/api/users', adminAuth, (req, res) => {
  const safe = users.map(({ password: _, ...u }) => u);
  res.json(safe);
});

// POST /api/join  { phone }
app.post('/api/join', (req, res) => {
  const phone = normalizePhone(req.body.phone || '');
  if (!phone) return res.status(400).json({ error: 'Telefon raqam kiritilmagan' });
  if (phone.length < 12) return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });
  if (queue.find(u => u.phone === phone))
    return res.status(409).json({ error: 'Bu telefon raqam allaqachon navbatda' });

  const id = Date.now().toString();
  const user = { id, phone, gasAmount: (req.body.gasAmount || '').trim() || null, joinedAt: new Date().toISOString(), status: 'waiting' };
  queue.push(user);
  broadcast();
  addNotification(id, 'GazQueue', `Siz navbatga yozildingiz 🎫 — #${queue.length} o'rin`);
  res.json({ user, position: queue.length });
});

// POST /api/leave
app.post('/api/leave', (req, res) => {
  const { id } = req.body;
  queue = queue.filter(u => u.id !== id);
  subscriptions.delete(id);
  broadcast();
  res.json({ ok: true });
});

// POST /api/subscribe
app.post('/api/subscribe', (req, res) => {
  const { userId, subscription } = req.body;
  if (!userId || !subscription) return res.status(400).json({ error: 'Invalid' });
  subscriptions.set(userId, subscription);
  res.json({ ok: true });
});

// GET /api/notifications/:userId
app.get('/api/notifications/:userId', (req, res) => {
  res.json(notifications.get(req.params.userId) || []);
});

// POST /api/notifications/:userId/read-all
app.post('/api/notifications/:userId/read-all', (req, res) => {
  (notifications.get(req.params.userId) || []).forEach(n => n.read = true);
  res.json({ ok: true });
});

// POST /api/admin/next — protected
app.post('/api/admin/next', adminAuth, async (req, res) => {
  if (queue.length === 0) return res.status(400).json({ error: "Navbat bo'sh" });
  const served = queue[0];
  
  // Mark as awaiting confirmation (don't remove yet)
  served.status = 'awaiting_confirmation';
  broadcast();
  io.emit('queue:served', served);

  // Start arrival confirmation — remove only after confirmed
  await startArrivalConfirmation(served.id, 'Asosiy navbat', '', 'main');

  res.json({ served });
});

// POST /api/admin/clear — protected
app.post('/api/admin/clear', adminAuth, (req, res) => {
  queue = [];
  subscriptions.clear();
  broadcast();
  res.json({ ok: true });
});

// POST /api/admin/assign — assign user to a section
app.post('/api/admin/assign', adminAuth, async (req, res) => {
  const { userId, section } = req.body || {};
  if (!userId || !section) return res.status(400).json({ error: 'userId va section kerak' });

  const idx = queue.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

  const user = queue[idx];
  
  // Mark as awaiting confirmation, pre-assign section
  user.status = 'awaiting_confirmation';
  user.pendingSection = section;
  broadcast();

  // Start arrival confirmation — remove only after confirmed
  await startArrivalConfirmation(user.id, 'Asosiy navbat', section, 'main');

  res.json({ ok: true, user, section });
});

// GET /api/admin/sections
app.get('/api/admin/sections', adminAuth, (req, res) => {
  res.json(sections);
});

// POST /api/admin/sections/clear — clear one section
app.post('/api/admin/sections/clear', adminAuth, (req, res) => {
  const { section } = req.body || {};
  if (!section) return res.status(400).json({ error: 'section kerak' });
  const user = sections[section];
  if (user) {
    // Request review from the user
    reviewRequests.set(user.id, { section, requestedAt: new Date().toISOString() });
    delete sections[section];
  }
  io.emit('sections:update', sections);
  res.json({ ok: true });
});

// GET /api/review-check/:userId — client polls this
app.get('/api/review-check/:userId', (req, res) => {
  const req_ = reviewRequests.get(req.params.userId);
  res.json(req_ || null);
});

// POST /api/review — submit rating
app.post('/api/review', (req, res) => {
  const { userId, stars, comment } = req.body || {};
  if (!userId || !stars) return res.status(400).json({ error: 'userId va stars kerak' });
  const req_ = reviewRequests.get(userId);
  reviews.push({
    userId, stars, comment: comment || '',
    section: req_?.section || null,
    time: new Date().toISOString()
  });
  reviewRequests.delete(userId);
  res.json({ ok: true });
});

// GET /api/admin/reviews — admin sees all reviews
app.get('/api/admin/reviews', adminAuth, (req, res) => {
  res.json(reviews);
});

// GET /api/gas-status — public
app.get('/api/gas-status', (req, res) => res.json(gasStatus));

// POST /api/admin/gas-status — admin sets status
app.post('/api/admin/gas-status', adminAuth, (req, res) => {
  const { available, message, eta } = req.body || {};
  gasStatus = {
    available: !!available,
    message: (message || '').trim(),
    eta: (eta || '').trim()
  };
  res.json(gasStatus);
});

// ── Station auth ──────────────────────────────────────────
function stationAuthMw(req, res, next) {
  const token = req.headers['x-station-token'];
  const id = verifyStationToken(token);
  if (!id) return res.status(401).json({ error: "Ruxsat yo'q" });
  req.stationId = id;
  next();
}

// POST /api/auth/station-login
app.post('/api/auth/station-login', (req, res) => {
  const { phone, password } = req.body || {};
  const normalized = (phone || '').replace(/\s/g, '');
  for (const [id, s] of Object.entries(STATIONS_AUTH)) {
    if (s.phone.replace(/\s/g, '') === normalized && s.password === password) {
      return res.json({ token: stationToken(id), stationId: id, stationName: s.name });
    }
  }
  res.status(401).json({ error: "Telefon yoki parol noto'g'ri" });
});

// GET /api/station/queue?stationId=s01
app.get('/api/station/queue', (req, res) => {
  const sid = req.query.stationId;
  if (!sid) return res.status(400).json({ error: 'stationId kerak' });
  res.json(getStationQueue(sid));
});

// POST /api/station/join — phone-only, one-time per queue
app.post('/api/station/join', (req, res) => {
  const { stationId, gasAmount, arrivalTime } = req.body || {};
  if (!stationId) return res.status(400).json({ error: 'stationId kerak' });
  const phone = normalizePhone(req.body.phone || '');
  if (!phone) return res.status(400).json({ error: 'Telefon raqam kiritilmagan' });
  if (phone.length < 12) return res.status(400).json({ error: 'Telefon raqam noto\'g\'ri' });
  const q = getStationQueue(stationId);
  if (q.find(u => u.phone === phone))
    return res.status(409).json({ error: 'Bu telefon raqam allaqachon navbatda' });
  
  const telegramLinked = isPhoneVerified(phone);
  
  const id = Date.now().toString();
  
  const user = {
    id, phone,
    name: (req.body.name || '').trim() || null,
    carNumber: (req.body.carNumber || '').trim() || null,
    gasAmount: (gasAmount || '').trim() || null,
    arrivalTime: arrivalTime || 'now',
    joinedAt: new Date().toISOString(),
    status: 'waiting',
    notified20min: false,
  };
  q.push(user);
  io.emit(`queue:${stationId}`, q);
  
  // Return whether Telegram is linked so client can show linking prompt
  res.json({ user, position: q.length, telegramLinked });
});

// GET /api/telegram-check/:phone — check if phone has linked Telegram
app.get('/api/telegram-check/:phone', (req, res) => {
  const phone = normalizePhone(req.params.phone || '');
  res.json({ verified: isPhoneVerified(phone) });
});

// GET /api/bot-username — return bot username for linking instructions
app.get('/api/bot-username', (req, res) => {
  res.json({ username: BOT_USERNAME });
});

// POST /api/station/leave
app.post('/api/station/leave', (req, res) => {
  const { stationId, id } = req.body || {};
  if (!stationId || !id) return res.status(400).json({ error: 'stationId va id kerak' });
  const q = getStationQueue(stationId);
  const idx = q.findIndex(u => u.id === id);
  if (idx !== -1) q.splice(idx, 1);
  io.emit(`queue:${stationId}`, q);
  res.json({ ok: true });
});

// GET /api/station/gas-status?stationId=s01
app.get('/api/station/gas-status', (req, res) => {
  const sid = req.query.stationId;
  if (!sid) return res.status(400).json({ error: 'stationId kerak' });
  res.json(getStationGas(sid));
});

// POST /api/station/admin/gas-status
app.post('/api/station/admin/gas-status', stationAuthMw, (req, res) => {
  const { available, message, eta } = req.body || {};
  stationGasStatus[req.stationId] = { available: !!available, message: (message||'').trim(), eta: (eta||'').trim() };
  res.json(stationGasStatus[req.stationId]);
});

// GET /api/station/admin/sections
app.get('/api/station/admin/sections', stationAuthMw, (req, res) => {
  res.json(getStationSections(req.stationId));
});

// POST /api/station/admin/sections (clear one section)
app.post('/api/station/admin/sections', stationAuthMw, (req, res) => {
  const { section } = req.body || {};
  const secs = getStationSections(req.stationId);
  const user = secs[section];
  if (user) {
    reviewRequests.set(user.id, { section, stationId: req.stationId, requestedAt: new Date().toISOString() });
    delete secs[section];
  }
  res.json({ ok: true });
});

// POST /api/station/admin/assign — with Telegram notification & arrival confirmation
app.post('/api/station/admin/assign', stationAuthMw, async (req, res) => {
  const { userId, section } = req.body || {};
  const q = getStationQueue(req.stationId);
  const idx = q.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });
  const user = q[idx];
  
  // Mark as awaiting confirmation (don't remove yet)
  user.status = 'awaiting_confirmation';
  user.pendingSection = section;
  user.pendingStation = req.stationId;
  io.emit(`queue:${req.stationId}`, q);

  const stationName = STATIONS_AUTH[req.stationId]?.name || req.stationId;
  
  // Start arrival confirmation with 2-min timeout
  await startArrivalConfirmation(user.id, stationName, section, req.stationId);

  res.json({ ok: true, user, section });
});

// POST /api/station/admin/clear
app.post('/api/station/admin/clear', stationAuthMw, (req, res) => {
  stationQueues[req.stationId] = [];
  io.emit(`queue:${req.stationId}`, []);
  res.json({ ok: true });
});

// GET /api/station/admin/reviews
app.get('/api/station/admin/reviews', stationAuthMw, (req, res) => {
  res.json(getStationReviews(req.stationId));
});

// POST /api/station/review
app.post('/api/station/review', (req, res) => {
  const { stationId, userId, stars, comment } = req.body || {};
  if (!stationId || !userId || !stars) return res.status(400).json({ error: 'Maydonlar to\'ldirilmagan' });
  const reqData = reviewRequests.get(userId);
  getStationReviews(stationId).push({ userId, stars, comment: comment || '', section: reqData?.section || null, time: new Date().toISOString() });
  reviewRequests.delete(userId);
  res.json({ ok: true });
});

// ── Socket.IO ─────────────────────────────────────────────
io.on('connection', socket => {
  socket.emit('queue:update', queue);
});

// ── Phone → Queue user lookup ──────────────────────────
// Find a user in any station queue or main queue by phone
function findUserByPhone(phone) {
  // Check main queue
  let idx = queue.findIndex(u => u.phone === phone);
  if (idx !== -1) return { queueType: 'main', stationId: null, queue: queue, idx, user: queue[idx] };
  // Check station queues
  for (const [sid, q] of Object.entries(stationQueues)) {
    idx = q.findIndex(u => u.phone === phone);
    if (idx !== -1) return { queueType: 'station', stationId: sid, queue: q, idx, user: q[idx] };
  }
  return null;
}

// ── Arrival confirmation tracking ──────────────────────
// Map: userId -> { timeoutId, startedAt }
const arrivalConfirmations = new Map();

// Start arrival confirmation — bot will handle the response
// queueType: 'main' or stationId string
async function startArrivalConfirmation(userId, stationName, section, queueType) {
  const msg = `✅ Navbat keldi!\n🏪 ${stationName || 'AZS'}${section ? ` · ${section}-seksiya` : ''}\n\nПодъехали? У вас есть 2 минуты чтобы подтвердить.`;
  await sendTelegramNotification(userId, '✅ Navbat keldi!', msg);
  
  // Set 2-minute timeout for forfeiture
  const timeoutId = setTimeout(async () => {
    // Check if still awaiting
    if (!arrivalConfirmations.has(userId)) return;
    arrivalConfirmations.delete(userId);
    
    // Remove user from queue (forfeit)
    removeUserFromQueue(userId);
    await sendTelegramNotification(userId, '❌ Navbat bekor qilindi', 'Вы не подтвердили прибытие вовремя. Ваша очередь аннулирована.');
    addNotification(userId, 'GazQueue', '❌ Navbat bekor qilindi — vaqtida yetib kelmadingiz');
  }, 2 * 60 * 1000);
  
  arrivalConfirmations.set(userId, { timeoutId, startedAt: Date.now(), section, stationName, queueType });
}

// Remove user from queue by userId (helper)
function removeUserFromQueue(userId) {
  // Check main queue
  let idx = queue.findIndex(u => u.id === userId);
  if (idx !== -1) {
    queue.splice(idx, 1);
    broadcast();
    return true;
  }
  // Check station queues
  for (const [sid, q] of Object.entries(stationQueues)) {
    idx = q.findIndex(u => u.id === userId);
    if (idx !== -1) {
      q.splice(idx, 1);
      io.emit(`queue:${sid}`, q);
      return true;
    }
  }
  return false;
}

// Confirm or cancel arrival (called from bot)
export function confirmArrival(userId, arrived) {
  const confirm = arrivalConfirmations.get(userId);
  if (!confirm) return;
  clearTimeout(confirm.timeoutId);
  arrivalConfirmations.delete(userId);
  
  if (arrived) {
    addNotification(userId, 'GazQueue', '✅ Yetib kelganingiz tasdiqlandi');
    
    // Search in all queues (main + station)
    let found = false;
    let section = '';
    let stationId = null;
    let userName = '';
    let userCar = '';
    let userGas = '';
    
    // Check main queue
    let idx = queue.findIndex(u => u.id === userId);
    if (idx !== -1) {
      const user = queue[idx];
      section = user.pendingSection || '';
      stationId = user.pendingStation;
      userName = user.name || user.phone;
      userCar = user.carNumber || '';
      userGas = user.gasAmount || '';
      queue.splice(idx, 1);
      found = true;
    }
    
    // Check station queues if not in main queue
    if (!found) {
      for (const [sid, sq] of Object.entries(stationQueues)) {
        const sidx = sq.findIndex(u => u.id === userId);
        if (sidx !== -1) {
          const user = sq[sidx];
          section = user.pendingSection || '';
          stationId = sid;
          userName = user.name || user.phone;
          userCar = user.carNumber || '';
          userGas = user.gasAmount || '';
          sq.splice(sidx, 1);
          found = true;
          break;
        }
      }
    }
    
    if (found) {
      if (stationId) {
        // Station queue - assign to station section
        const secs = getStationSections(stationId);
        const sectionKey = section || confirm.section || 'Sektsiya';
        secs[sectionKey] = { id: userId, name: userName, carNumber: userCar, gasAmount: userGas, phone: '', assignedAt: new Date().toISOString() };
        io.emit(`queue:${stationId}`, getStationQueue(stationId));
        io.emit(`station-sections:${stationId}`, secs);
        const sn = STATIONS_AUTH[stationId]?.name || stationId;
        addRefuelEntry(userId, userName, userCar, userGas, sectionKey, sn);
      } else {
        // Main queue - assign to sections
        sections[section] = { id: userId, name: userName, carNumber: userCar, gasAmount: userGas, phone: '', assignedAt: new Date().toISOString() };
        io.emit('sections:update', sections);
        addRefuelEntry(userId, userName, userCar, userGas, section, 'Asosiy navbat');
      }
      broadcast();
    }
  } else {
    removeUserFromQueue(userId);
    sendTelegramNotification(userId, '❌ Navbat bekor qilindi', 'Вы отказались от очереди.');
    addNotification(userId, 'GazQueue', '❌ Siz navbatdan chiqdingiz');
  }
}

// ── Background timer: check for 20-min warnings ────────
function checkQueueNotifications() {
  const now = Date.now();
  const AVG_TIME_PER_CAR = 4 * 60 * 1000; // 4 minutes per car
  const TWENTY_MIN_MS = 20 * 60 * 1000;
  
  async function checkQueue(q, stationName, stationId) {
    for (let i = 0; i < q.length; i++) {
      const user = q[i];
      if (user.status === 'waiting' && !user.notified20min) {
        // Estimate wait: number of people ahead * avg time
        const estWaitMs = i * AVG_TIME_PER_CAR;
        if (estWaitMs <= TWENTY_MIN_MS) {
          user.notified20min = true;
          const pos = i + 1;
          await sendTelegramNotification(user.id, '⏳ 20 daqiqa qoldi!', 
            `⏳ *Navbatga 20 daqiqa qoldi!*\n\n` +
            `Sizning o'rningiz: #${pos}\n` +
            `Stansiya: ${stationName || stationId || 'Asosiy'}\n` +
            `Iltimos, tayyorlaning! 🚗`
          );
          addNotification(user.id, 'GazQueue', `⏳ Navbatga ~20 daqiqa qoldi! #${pos} o'rinsiz`);
        }
      }
    }
  }
  
  // Check main queue
  checkQueue(queue, 'Asosiy navbat', null);
  
  // Check all station queues
  for (const [sid, q] of Object.entries(stationQueues)) {
    const name = STATIONS_AUTH[sid]?.name || sid;
    checkQueue(q, name, sid);
  }
}

// Run every 30 seconds
setInterval(checkQueueNotifications, 30 * 1000);

// ── Telegram Bot (pass references for commands) ────────────
initBot(users, refuelHistory, notifications, () => queue, () => stationQueues, saveUsers, findUserByPhone, confirmArrival, markPhoneVerified);

function addRefuelEntry(userId, name, carNumber, gasAmount, section, stationName) {
  refuelHistory.unshift({
    userId, name, carNumber: carNumber || '', gasAmount: gasAmount || '',
    section: section || '', stationName: stationName || '',
    time: new Date().toISOString()
  });
  if (refuelHistory.length > 500) refuelHistory.splice(500);
  saveHistory();
}

// ── Start ─────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`GazQueue running → http://localhost:${PORT}`);
});
