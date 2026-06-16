import { cors } from '../_helpers.js';
import { rget, rset } from '../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { stationId, name, carNumber, gasAmount, userId } = req.body || {};
  if (!stationId) return res.status(400).json({ error: 'stationId kerak' });

  const trimName = (name || '').trim();
  if (!trimName) return res.status(400).json({ error: 'Ism kiritilmagan' });
  const trimCar = (carNumber || '').trim().toUpperCase();
  if (!trimCar) return res.status(400).json({ error: 'Mashina raqami kiritilmagan' });

  const queue = await rget(`queue:${stationId}`) || [];
  if (queue.find(u => u.name.toLowerCase() === trimName.toLowerCase()))
    return res.status(409).json({ error: 'Bu ism allaqachon navbatda' });

  const id = userId || Date.now().toString();
  const user = { id, name: trimName, carNumber: trimCar, gasAmount: (gasAmount || '').trim() || null, joinedAt: new Date().toISOString() };
  queue.push(user);
  await rset(`queue:${stationId}`, queue);
  res.json({ user, position: queue.length });
}
