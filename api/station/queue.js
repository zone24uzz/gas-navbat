import { cors, stationAuth } from '../_helpers.js';
import { rget } from '../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  // GET is public (clients poll it) — stationId from query
  if (req.method === 'GET') {
    const sid = req.query.stationId;
    if (!sid) return res.status(400).json({ error: 'stationId kerak' });
    const queue = await rget(`queue:${sid}`) || [];
    return res.json(queue);
  }
  res.status(405).end();
}
