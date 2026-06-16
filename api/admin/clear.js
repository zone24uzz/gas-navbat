import { rset } from '../_redis.js';
import { cors, adminAuth } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!adminAuth(req, res)) return;
  if (req.method !== 'POST') return res.status(405).end();

  await rset('queue', []);
  res.json({ ok: true });
}
