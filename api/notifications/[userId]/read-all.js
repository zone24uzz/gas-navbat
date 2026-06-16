import { rget, rset } from '../../_redis.js';
import { cors } from '../../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId } = req.query;
  const key = `notif:${userId}`;
  const notifs = await rget(key) || [];
  notifs.forEach(n => n.read = true);
  await rset(key, notifs);
  res.json({ ok: true });
}
