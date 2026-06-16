import { cors, stationAuth } from '../../_helpers.js';
import { rget, rset } from '../../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const sid = stationAuth(req, res);
  if (!sid) return;

  if (req.method === 'GET') {
    const sections = await rget(`sections:${sid}`) || {};
    return res.json(sections);
  }

  if (req.method === 'POST') {
    const { section } = req.body || {};
    const sections = await rget(`sections:${sid}`) || {};
    const user = sections[section];
    if (user) {
      await rset(`review_req:${user.id}`, { section, stationId: sid, requestedAt: new Date().toISOString() });
      delete sections[section];
      await rset(`sections:${sid}`, sections);
    }
    return res.json({ ok: true });
  }
  res.status(405).end();
}
