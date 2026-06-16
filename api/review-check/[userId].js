import { rget } from '../_redis.js';
import { cors } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { userId } = req.query;
  const data = await rget(`review_req:${userId}`);
  res.json(data || null);
}
