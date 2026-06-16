import { cors, stationAuth } from '../../_helpers.js';
import { rget, rset } from '../../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const sid = req.query.stationId;
    if (!sid) return res.status(400).json({ error: 'stationId kerak' });
    const status = await rget(`gas:${sid}`) || { available: true, message: '', eta: '' };
    return res.json(status);
  }

  if (req.method === 'POST') {
    const sid = stationAuth(req, res);
    if (!sid) return;
    const { available, message, eta } = req.body || {};
    const status = { available: !!available, message: (message || '').trim(), eta: (eta || '').trim() };
    await rset(`gas:${sid}`, status);
    return res.json(status);
  }
  res.status(405).end();
}
