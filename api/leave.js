import { rget, rset } from './_redis.js';
import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { id } = req.body || {};
  let queue = await rget('queue') || [];
  queue = queue.filter(u => u.id !== id);
  await rset('queue', queue);
  res.json({ ok: true });
}
