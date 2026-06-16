import { rget, rset, rdel } from '../_redis.js';
import { cors, adminAuth, VAPID_PUBLIC, VAPID_PRIVATE } from '../_helpers.js';
import webpush from 'web-push';

webpush.setVapidDetails('mailto:admin@gazqueue.uz', VAPID_PUBLIC, VAPID_PRIVATE);

async function sendPush(userId, payload) {
  const sub = await rget(`sub:${userId}`);
  if (!sub) return;
  try { await webpush.sendNotification(sub, JSON.stringify(payload)); }
  catch { await rdel(`sub:${userId}`); }
}

async function addNotification(userId, title, body) {
  const key = `notif:${userId}`;
  const notifs = await rget(key) || [];
  notifs.unshift({ id: Date.now().toString(), title, body, time: new Date().toISOString(), read: false });
  await rset(key, notifs.slice(0, 50));
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!adminAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, section } = req.body || {};
  if (!userId || !section) return res.status(400).json({ error: 'userId va section kerak' });

  let queue = await rget('queue') || [];
  const idx = queue.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

  const [user] = queue.splice(idx, 1);
  await rset('queue', queue);

  // Save sections state
  const sections = await rget('sections') || {};
  sections[section] = { ...user, assignedAt: new Date().toISOString() };
  await rset('sections', sections);

  const msg = { title: 'GazQueue', body: `Ваша очередь пришла ✅ — ${section}-секция`, icon: '/favicon.svg' };
  await addNotification(user.id, msg.title, msg.body);
  await sendPush(user.id, msg);

  res.json({ ok: true, user, section });
}
