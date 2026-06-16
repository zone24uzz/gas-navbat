import { rset } from './_redis.js';
import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, subscription } = req.body || {};
  if (!userId || !subscription) return res.status(400).json({ error: 'Invalid' });
  await rset(`sub:${userId}`, subscription);
  res.json({ ok: true });
}
