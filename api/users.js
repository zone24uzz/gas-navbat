import { rget } from './_redis.js';
import { cors, adminAuth } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!adminAuth(req, res)) return;

  const users = await rget('users') || [];
  const safe = users.map(({ password: _, ...u }) => u);
  res.json(safe);
}
