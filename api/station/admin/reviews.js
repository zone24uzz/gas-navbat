import { cors, stationAuth } from '../../_helpers.js';
import { rget, rset } from '../../_redis.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const sid = stationAuth(req, res);
    if (!sid) return;
    const reviews = await rget(`reviews:${sid}`) || [];
    return res.json(reviews);
  }

  if (req.method === 'POST') {
    // submit review — public, stationId in body
    const { stationId, userId, stars, comment } = req.body || {};
    if (!stationId || !userId || !stars) return res.status(400).json({ error: 'Maydonlar to\'ldirilmagan' });
    const reqData = await rget(`review_req:${userId}`);
    const reviews = await rget(`reviews:${stationId}`) || [];
    reviews.push({ userId, stars, comment: comment || '', section: reqData?.section || null, time: new Date().toISOString() });
    await rset(`reviews:${stationId}`, reviews);
    await rset(`review_req:${userId}`, null);
    return res.json({ ok: true });
  }
  res.status(405).end();
}
