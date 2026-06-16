import { cors, stationAuth } from '../../_helpers.js';
import { rset } from '../../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const sid = stationAuth(req, res);
  if (!sid) return;

  await rset(`queue:${sid}`, []);
  res.json({ ok: true });
}
