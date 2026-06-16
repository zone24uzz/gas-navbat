import { rget, rset } from './_redis.js';
import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const name = (req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Ism kiritilmagan' });
  if (name.length > 30) return res.status(400).json({ error: 'Ism juda uzun' });
  const carNumber = (req.body?.carNumber || '').trim().toUpperCase();
  if (!carNumber) return res.status(400).json({ error: 'Mashina raqami kiritilmagan' });
  const queue = await rget('queue') || [];
  if (queue.find(u => u.name.toLowerCase() === name.toLowerCase()))
    return res.status(409).json({ error: 'Bu ism allaqachon navbatda' });

  const id = req.body?.userId || Date.now().toString();
  const user = { id, name, carNumber, gasAmount: (req.body?.gasAmount || '').trim() || null, joinedAt: new Date().toISOString() };
  queue.push(user);
  await rset('queue', queue);

  // Add notification
  const notifKey = `notif:${id}`;
  const notifs = await rget(notifKey) || [];
  notifs.unshift({
    id: Date.now().toString(),
    title: 'GazQueue',
    body: `Siz navbatga yozildingiz 🎫 — #${queue.length} o'rin`,
    time: new Date().toISOString(),
    read: false
  });
  await rset(notifKey, notifs.slice(0, 50));

  res.json({ user, position: queue.length });
}
