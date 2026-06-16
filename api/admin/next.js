import { rget, rset, rdel } from '../_redis.js';
import { cors, adminAuth, VAPID_PUBLIC, VAPID_PRIVATE } from '../_helpers.js';
import webpush from 'web-push';

webpush.setVapidDetails('mailto:admin@gazqueue.uz', VAPID_PUBLIC, VAPID_PRIVATE);

async function addNotification(userId, title, body) {
  const key = `notif:${userId}`;
  const notifs = await rget(key) || [];
  notifs.unshift({ id: Date.now().toString(), title, body, time: new Date().toISOString(), read: false });
  await rset(key, notifs.slice(0, 50));
}

async function sendPush(userId, payload) {
  const sub = await rget(`sub:${userId}`);
  if (!sub) return;
  try { await webpush.sendNotification(sub, JSON.stringify(payload)); }
  catch { await rdel(`sub:${userId}`); }
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!adminAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  const queue = await rget('queue') || [];
  if (queue.length === 0) return res.status(400).json({ error: "Navbat bo'sh" });

  const served = queue.shift();
  await rset('queue', queue);

  const servedMsg = { title: 'GazQueue', body: 'Ваша очередь пришла ✅', icon: '/favicon.svg' };
  await addNotification(served.id, servedMsg.title, servedMsg.body);
  await sendPush(served.id, servedMsg);

  if (queue.length > 0) {
    const nextMsg = { title: 'GazQueue', body: 'Siz navbatdasiz! Iltimos yaqinlashing 🚗', icon: '/favicon.svg' };
    await addNotification(queue[0].id, nextMsg.title, nextMsg.body);
    await sendPush(queue[0].id, nextMsg);
  }

  res.json({ served });
}
