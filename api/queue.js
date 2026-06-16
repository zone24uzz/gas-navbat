import { rget } from './_redis.js';
import { cors } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const queue = await rget('queue') || [];
  res.json(queue);
}
