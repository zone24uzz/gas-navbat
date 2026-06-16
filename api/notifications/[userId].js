import { rget, rset } from '../_redis.js';
import { cors } from '../_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { userId } = req.query;
  const key = `notif:${userId}`;

  if (req.method === 'GET') {
    const notifs = await rget(key) || [];
    return res.json(notifs);
  }

  res.status(405).end();
}
