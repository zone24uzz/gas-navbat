import { rget, rset } from './_redis.js';
import { cors, adminAuth } from './_helpers.js';

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const status = await rget('gas_status') || { available: true, message: '', eta: '' };
    return res.json(status);
  }

  if (req.method === 'POST') {
    if (!adminAuth(req, res)) return;
    const { available, message, eta } = req.body || {};
    const status = { available: !!available, message: (message || '').trim(), eta: (eta || '').trim() };
    await rset('gas_status', status);
    return res.json(status);
  }

  res.status(405).end();
}
