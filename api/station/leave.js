import { cors } from '../_helpers.js';
import { rget, rset } from '../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { stationId, id } = req.body || {};
  if (!stationId || !id) return res.status(400).json({ error: 'stationId va id kerak' });

  let queue = await rget(`queue:${stationId}`) || [];
  queue = queue.filter(u => u.id !== id);
  await rset(`queue:${stationId}`, queue);
  res.json({ ok: true });
}
