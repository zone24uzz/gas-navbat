import { rget, rset } from '../_redis.js';
import { cors, adminAuth } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (!adminAuth(req, res)) return;

  if (req.method === 'GET') {
    const sections = await rget('sections') || {};
    return res.json(sections);
  }

  // POST — clear a section and request review
  if (req.method === 'POST') {
    const { section } = req.body || {};
    const sections = await rget('sections') || {};
    const user = sections[section];
    if (user) {
      await rset(`review_req:${user.id}`, { section, requestedAt: new Date().toISOString() });
      delete sections[section];
      await rset('sections', sections);
    }
    return res.json({ ok: true });
  }

  res.status(405).end();
}
