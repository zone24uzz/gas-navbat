import { rget, rset, rdel } from './_redis.js';
import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { userId, stars, comment } = req.body || {};
  if (!userId || !stars) return res.status(400).json({ error: 'userId va stars kerak' });

  const req_ = await rget(`review_req:${userId}`);
  const reviews = await rget('reviews') || [];
  reviews.push({
    userId, stars, comment: comment || '',
    section: req_?.section || null,
    time: new Date().toISOString()
  });
  await rset('reviews', reviews);
  await rdel(`review_req:${userId}`);
  res.json({ ok: true });
}
