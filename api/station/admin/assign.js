import { cors, stationAuth } from '../../_helpers.js';
import { rget, rset } from '../../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();
  const sid = stationAuth(req, res);
  if (!sid) return;

  const { userId, section } = req.body || {};
  if (!userId || !section) return res.status(400).json({ error: 'userId va section kerak' });

  let queue = await rget(`queue:${sid}`) || [];
  const idx = queue.findIndex(u => u.id === userId);
  if (idx === -1) return res.status(404).json({ error: 'Foydalanuvchi topilmadi' });

  const [user] = queue.splice(idx, 1);
  await rset(`queue:${sid}`, queue);

  const sections = await rget(`sections:${sid}`) || {};
  sections[section] = { ...user, assignedAt: new Date().toISOString() };
  await rset(`sections:${sid}`, sections);

  res.json({ ok: true, user, section });
}
